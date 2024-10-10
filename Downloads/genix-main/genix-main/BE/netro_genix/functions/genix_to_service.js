const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 5000;

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

app.get('/api/logs', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        // 공기 데이터 가져오기 (dev_id와 log_datetime으로 그룹화하여 센서 값 매핑)
        const [airData] = await connection.query(`
            SELECT 
                DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, a.dev_id,
                MAX(CASE WHEN s.sen_name = 'pm10' THEN a.sen_value END) AS pm10,
                MAX(CASE WHEN s.sen_name = 'PM25' THEN a.sen_value END) AS PM25,
                MAX(CASE WHEN s.sen_name = 'so2' THEN a.sen_value END) AS so2,
                MAX(CASE WHEN s.sen_name = 'no2' THEN a.sen_value END) AS no2,
                MAX(CASE WHEN s.sen_name = 'o3' THEN a.sen_value END) AS o3,
                MAX(CASE WHEN s.sen_name = 'co' THEN a.sen_value END) AS co,
                MAX(CASE WHEN s.sen_name = 'vocs' THEN a.sen_value END) AS vocs,
                MAX(CASE WHEN s.sen_name = 'h2S' THEN a.sen_value END) AS h2S,
                MAX(CASE WHEN s.sen_name = 'nh3' THEN a.sen_value END) AS nh3,
                MAX(CASE WHEN s.sen_name = 'ou' THEN a.sen_value END) AS ou,
                MAX(CASE WHEN s.sen_name = 'hcho' THEN a.sen_value END) AS hcho,
                MAX(CASE WHEN s.sen_name = 'temp' THEN a.sen_value END) AS temp,
                MAX(CASE WHEN s.sen_name = 'humi' THEN a.sen_value END) AS humi,
                MAX(CASE WHEN s.sen_name = 'winsp' THEN a.sen_value END) AS winsp,
                MAX(CASE WHEN s.sen_name = 'WINdr' THEN a.sen_value END) AS WINdr,
                MAX(CASE WHEN s.sen_name = 'batt' THEN a.sen_value END) AS batt,
                MAX(CASE WHEN s.sen_name = 'firm' THEN a.sen_value END) AS FIRM
            FROM example_air_log_data a
            JOIN example_air_sys_sensor s ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
            WHERE a.dev_id BETWEEN 1 AND 5  -- 공기 데이터는 1~5로 제한
            GROUP BY a.dev_id, a.log_datetime
            LIMIT 5
        `);

        // 해양 데이터 가져오기 (dev_id와 log_datetime으로 그룹화하여 센서 값 매핑)
        const [oceanData] = await connection.query(`
            SELECT 
                DATE_FORMAT(o.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, o.dev_id,
                MAX(CASE WHEN s.sen_name = 'battery' THEN o.sen_value END) AS batt,
                MAX(CASE WHEN s.sen_name = 'temp' THEN o.sen_value END) AS temp,
                MAX(CASE WHEN s.sen_name = 'DO' THEN o.sen_value END) AS DO,
                MAX(CASE WHEN s.sen_name = 'EC' THEN o.sen_value END) AS EC,
                MAX(CASE WHEN s.sen_name = 'salinity' THEN o.sen_value END) AS salinity,
                MAX(CASE WHEN s.sen_name = 'TDS' THEN o.sen_value END) AS TDS,
                MAX(CASE WHEN s.sen_name = 'pH' THEN o.sen_value END) AS pH,
                MAX(CASE WHEN s.sen_name = 'ORP' THEN o.sen_value END) AS ORP
            FROM example_air_log_data o
            JOIN example_air_sys_sensor s ON o.sen_id = s.sen_id AND o.dev_id = s.dev_id
            WHERE o.dev_id BETWEEN 6 AND 7  -- 해양 데이터는 6~7로 제한
            GROUP BY o.dev_id, o.log_datetime
            LIMIT 2
        `);

        // 공기 데이터에 ID 1~5 할당
        const airDataWithId = airData.map((item, index) => ({
            log_datetime: item.log_datetime,
            id: index + 1,  // 1~5로 ID 할당
            send: 0,
            humi: item.humi,
            winsp: item.winsp,
            WINdr: item.WINdr,
            batt: item.batt,
            pm10: item.pm10,
            pm25: item.PM25,
            so2: item.so2,
            no2: item.no2,
            o3: item.o3,
            co: item.co,
            vocs: item.vocs,
            h2S: item.h2S,
            nh3: item.nh3,
            ou: item.ou,
            hcho: item.hcho,
            temp: item.temp,
            firm: item.FIRM 
        }));

        // 해양 데이터에 ID 6, 7 할당
        const oceanDataWithId = oceanData.map((item, index) => ({
            log_datetime: item.log_datetime,
            id: index + 6,  // ID 6, 7 할당
            batt: item.batt,
            temp: item.temp,
            do: item.DO,
            ec: item.EC,
            salinity: item.salinity,
            tds: item.TDS,
            ph: item.pH,
            orp: item.ORP
        }));

        // 응답 형식에 맞게 공기 및 해양 데이터 반환
        const response = {
            data: [
                ...airDataWithId,
                ...oceanDataWithId
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



app.get('/api/air/:id', async (req, res) => {
    let connection;
    const id = req.params.id;  // 경로에서 id 값을 가져옴

    try {
        connection = await getConnection();
        const [airData] = await connection.query(`
            SELECT 
                DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, a.dev_id,
                MAX(CASE WHEN s.sen_name = 'humi' THEN a.sen_value END) AS humi,
                MAX(CASE WHEN s.sen_name = 'winsp' THEN a.sen_value END) AS winsp,
                MAX(CASE WHEN s.sen_name = 'windir' THEN a.sen_value END) AS windir,
                MAX(CASE WHEN s.sen_name = 'batt' THEN a.sen_value END) AS batt,
                MAX(CASE WHEN s.sen_name = 'pm10' THEN a.sen_value END) AS pm10,
                MAX(CASE WHEN s.sen_name = 'PM25' THEN a.sen_value END) AS pm25,  
                MAX(CASE WHEN s.sen_name = 'so2' THEN a.sen_value END) AS so2,
                MAX(CASE WHEN s.sen_name = 'no2' THEN a.sen_value END) AS no2,
                MAX(CASE WHEN s.sen_name = 'o3' THEN a.sen_value END) AS o3,
                MAX(CASE WHEN s.sen_name = 'co' THEN a.sen_value END) AS co,
                MAX(CASE WHEN s.sen_name = 'vocs' THEN a.sen_value END) AS vocs,
                MAX(CASE WHEN s.sen_name = 'h2S' THEN a.sen_value END) AS h2S,
                MAX(CASE WHEN s.sen_name = 'nh3' THEN a.sen_value END) AS nh3,
                MAX(CASE WHEN s.sen_name = 'ou' THEN a.sen_value END) AS ou,
                MAX(CASE WHEN s.sen_name = 'hcho' THEN a.sen_value END) AS hcho,
                MAX(CASE WHEN s.sen_name = 'temp' THEN a.sen_value END) AS temp,
                MAX(CASE WHEN s.sen_name = 'firm' THEN a.sen_value END) AS FIRM
            FROM example_air_log_data a
            JOIN example_air_sys_sensor s ON a.sen_id = s.sen_id
            WHERE a.dev_id = ? AND a.dev_id BETWEEN 1 AND 5  -- dev_id가 1~5까지만 검색되도록 추가
            GROUP BY a.dev_id, a.log_datetime
            LIMIT 1
        `, [id]);

        const response = {
            data: airData.map(item => ({
                log_datetime: item.log_datetime,
                id: item.dev_id,
                send: 0.0,
                humi: item.humi,
                winsp: item.winsp,
                firm: item.FIRM,
                windir: item.windir,
                batt: item.batt,
                pm10: item.pm10,
                pm25: item.pm25,
                so2: item.so2,
                no2: item.no2,
                o3: item.o3,
                co: item.co,
                vocs: item.vocs,
                h2S: item.h2S,
                nh3: item.nh3,
                ou: item.ou,
                hcho: item.hcho,
                temp: item.temp
            }))
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: '데이터를 불러오는 중 오류 발생' });
    } finally {
        if (connection) connection.end();
    }
});



app.get('/api/ocean/:id', async (req, res) => {
    let connection;
    const id = req.params.id;  // 경로에서 id 값을 가져옴

    try {
        connection = await getConnection();
        const [oceanData] = await connection.query(`
            SELECT 
                DATE_FORMAT(o.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, o.dev_id,
                MAX(CASE WHEN s.sen_name = 'battery' THEN o.sen_value END) AS batt,
                MAX(CASE WHEN s.sen_name = 'temp' THEN o.sen_value END) AS temp,
                MAX(CASE WHEN s.sen_name = 'DO' THEN o.sen_value END) AS DO,
                MAX(CASE WHEN s.sen_name = 'EC' THEN o.sen_value END) AS EC,
                MAX(CASE WHEN s.sen_name = 'salinity' THEN o.sen_value END) AS salinity,
                MAX(CASE WHEN s.sen_name = 'TDS' THEN o.sen_value END) AS TDS,
                MAX(CASE WHEN s.sen_name = 'pH' THEN o.sen_value END) AS pH,
                MAX(CASE WHEN s.sen_name = 'ORP' THEN o.sen_value END) AS ORP
            FROM example_air_log_data o
            JOIN example_air_sys_sensor s ON o.sen_id = s.sen_id
            WHERE o.dev_id = ? AND o.dev_id BETWEEN 6 AND 7  -- dev_id가 6~7까지만 검색되도록 설정
            GROUP BY o.dev_id, o.log_datetime
            LIMIT 1
        `, [id]);

        const response = {
            data: oceanData.map(item => ({
                log_datetime: item.log_datetime,
                id: item.dev_id,
                battery: item.batt,
                temp: item.temp,
                DO: item.DO,
                EC: item.EC,
                salinity: item.salinity,
                TDS: item.TDS,
                pH: item.pH,
                ORP: item.ORP
            }))
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: '데이터를 불러오는 중 오류 발생' });
    } finally {
        if (connection) connection.end();
    }
});


// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
