const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// DB 연결 설정
const dbConfig = {
    host: '192.168.0.225',
    user: 'root',
    password: 'netro9888!',
    database: 'netro_data_platform'
};

// DB 연결 함수
async function getConnection() {
    return await mysql.createConnection(dbConfig);
}

// /logs 엔드포인트(공기, 해양, 선박 데이터 처리)
router.get('/logs', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        // 공기 데이터 가져오기 (각 장치의 최신 데이터)
        const [airData] = await connection.query(`
            SELECT 
                DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, a.dev_id,
                s.sen_name, a.sen_value
            FROM example_air_log_data a
            LEFT JOIN example_air_sys_sensor s ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
            WHERE a.dev_id BETWEEN 1 AND 5
            ORDER BY a.dev_id, a.log_datetime DESC
        `);

        // 해양 데이터 가져오기 (각 장치의 최신 데이터)
        const [oceanData] = await connection.query(`
            SELECT 
                DATE_FORMAT(o.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, o.dev_id,
                s.sen_name, o.sen_value
            FROM example_air_log_data o
            LEFT JOIN example_air_sys_sensor s ON o.sen_id = s.sen_id AND o.dev_id = s.dev_id
            WHERE o.dev_id BETWEEN 6 AND 7
            ORDER BY o.dev_id, o.log_datetime DESC
        `);

        // 선박 데이터 가져오기 (각 선박의 최신 데이터)
        const [vesselData] = await connection.query(`
            SELECT 
                DATE_FORMAT(v.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, v.dev_id,
                s.sen_name, v.sen_value
            FROM example_air_log_data v
            LEFT JOIN example_air_sys_sensor s ON v.sen_id = s.sen_id AND v.dev_id = s.dev_id
            WHERE v.dev_id BETWEEN 8 AND 17
            ORDER BY v.dev_id, v.log_datetime DESC
        `);

        // 공기 데이터에 ID 1~5 할당
        const airDataWithId = [];
        airData.forEach(item => {
            const existing = airDataWithId.find(data => data.id === item.dev_id);
            if (!existing) {
                airDataWithId.push({
                    log_datetime: item.log_datetime,
                    id: parseInt(item.dev_id),
                    send: 0,
                    humi: null,
                    winsp: null,
                    windir: null,
                    batt: null,
                    pm10: null,
                    pm25: null,
                    so2: null,
                    no2: null,
                    o3: null,
                    co: null,
                    vocs: null,
                    h2s: null,
                    nh3: null,
                    ou: null,
                    hcho: null,
                    temp: null,
                    firm: null
                });
            }
            const data = airDataWithId.find(data => data.id === item.dev_id);
            if (data) {
                data[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
            }
            if (item.sen_name === 'FIRM') {
                data.firm = String(item.sen_value);  // FIRM 값을 문자열로 변환
            }
        });

        // 해양 데이터에 ID 6, 7 할당
        const oceanDataWithId = [];
        oceanData.forEach(item => {
            const existing = oceanDataWithId.find(data => data.id === item.dev_id);
            if (!existing) {
                oceanDataWithId.push({
                    log_datetime: item.log_datetime,
                    id: parseInt(item.dev_id),
                    battery: null,
                    temp: null,
                    do: null,
                    ec: null,
                    salinity: null,
                    tds: null,
                    ph: null,
                    orp: null
                });
            }
            const data = oceanDataWithId.find(data => data.id === item.dev_id);
            if (data) {
                data[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
            }
        });

        // 선박 데이터에 ID 8~17 할당
        const vesselDataWithId = [];
        vesselData.forEach(item => {
            const existing = vesselDataWithId.find(data => data.id === item.dev_id);
            if (!existing) {
                vesselDataWithId.push({
                    log_datetime: item.log_datetime,
                    id: parseInt(item.dev_id),
                    latitude: null,
                    longitude: null,
                    speed: null,
                    heading: null
                });
            }
            const data = vesselDataWithId.find(data => data.id === item.dev_id);
            if (data) {
                data[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
            }
        });

        // 응답 형식에 맞게 공기, 해양, 선박 데이터 반환
        const response = {
            data: [
                ...airDataWithId,
                ...oceanDataWithId,
                ...vesselDataWithId
            ]
        };

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '데이터를 불러오는 중 오류 발생' });
    } finally {
        if (connection) connection.end();
    }
});


// 공기 데이터를 가져오는 함수 (1~5 범위의 데이터)
async function fetchAirData() {
    let connection;
    try {
        connection = await getConnection();
        const [airData] = await connection.query(`
            SELECT 
                DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                a.dev_id, s.sen_name, a.sen_value
            FROM example_air_log_data a
            LEFT JOIN example_air_sys_sensor s ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
            WHERE a.dev_id BETWEEN 1 AND 5
            ORDER BY a.dev_id, a.log_datetime DESC
        `);

        const results = [];

        // 각 장치에 대한 데이터를 정리해서 저장
        for (let devId = 1; devId <= 5; devId++) {
            let result = {
                log_datetime: null,
                id: devId,
                send: 0,
                humi: null,
                winsp: null,
                windir: null,
                batt: null,
                pm10: null,
                pm25: null,
                so2: null,
                no2: null,
                o3: null,
                co: null,
                vocs: null,
                h2s: null,
                nh3: null,
                ou: null,
                hcho: null,
                temp: null,
                firm: null
            };

            airData.forEach(item => {
                if (item.dev_id === devId) {
                    result.log_datetime = item.log_datetime;
                    result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
                    if (item.sen_name === 'FIRM') {
                        result.firm = String(item.sen_value);
                    }
                }
            });

            results.push(result);
        }

        return results;
    } finally {
        if (connection) connection.end();
    }
}

// 해양 데이터를 가져오는 함수 (6~7 범위의 데이터)
async function fetchOceanData() {
    let connection;
    try {
        connection = await getConnection();
        const [oceanData] = await connection.query(`
            SELECT 
                DATE_FORMAT(o.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                o.dev_id, s.sen_name, o.sen_value
            FROM example_air_log_data o
            LEFT JOIN example_air_sys_sensor s ON o.sen_id = s.sen_id AND o.dev_id = s.dev_id
            WHERE o.dev_id BETWEEN 6 AND 7
            ORDER BY o.dev_id, o.log_datetime DESC
        `);

        const results = [];

        // 각 장치에 대한 데이터를 정리해서 저장
        for (let devId = 6; devId <= 7; devId++) {
            let result = {
                log_datetime: null,
                id: devId,
                battery: null,
                temp: null,
                do: null,
                ec: null,
                salinity: null,
                tds: null,
                ph: null,
                orp: null
            };

            oceanData.forEach(item => {
                if (item.dev_id === devId) {
                    result.log_datetime = item.log_datetime;
                    result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
                }
            });

            results.push(result);
        }

        return results;
    } finally {
        if (connection) connection.end();
    }
}

// 선박 데이터를 가져오는 함수 (8~17 범위의 데이터)
async function fetchVesselData() {
    let connection;
    try {
        connection = await getConnection();
        const [vesselData] = await connection.query(`
            SELECT 
                DATE_FORMAT(v.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                v.dev_id, s.sen_name, v.sen_value
            FROM example_air_log_data v
            LEFT JOIN example_air_sys_sensor s ON v.sen_id = s.sen_id AND v.dev_id = s.dev_id
            WHERE v.dev_id BETWEEN 8 AND 17
            ORDER BY v.dev_id, v.log_datetime DESC
        `);

        const results = [];

        // 각 장치에 대한 데이터를 정리해서 저장
        for (let devId = 8; devId <= 17; devId++) {
            let result = {
                log_datetime: null,
                id: devId,
                latitude: null,
                longitude: null,
                speed: null,
                heading: null
            };

            vesselData.forEach(item => {
                if (item.dev_id === devId) {
                    result.log_datetime = item.log_datetime;
                    result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
                }
            });

            results.push(result);
        }

        return results;
    } finally {
        if (connection) connection.end();
    }
}




module.exports = router; // 라우터 객체 내보내기
