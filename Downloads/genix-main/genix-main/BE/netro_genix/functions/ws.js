const WebSocket = require('ws');
const axios = require('axios');
const mysql = require('mysql2/promise'); 

const wss = new WebSocket.Server({ port: 3000 });

// MySQL 연결을 위한 설정
async function getConnection() {
    const connection = await mysql.createConnection({
    host: '192.168.0.225',
    user: 'root',
    password: 'netro9888!',
    database: 'netro_data_platform'
    });
    console.log('Database connection established');
    return connection;
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (message) => {
        console.log('Received message: %s', message);

        let request;
        try {
            request = JSON.parse(message);
        } catch (error) {
            console.error('Invalid JSON format', error);
            ws.send('Invalid JSON format');
            return;
        }

        if (request.data === 'logs') {
            try {
                // 데이터를 5초마다 보내기 위한 setInterval 설정
                const interval = setInterval(async () => {
                    if (ws.readyState === WebSocket.OPEN) {
                        const data = await fetchLogs();
                        ws.send(JSON.stringify({ data }));
                    } else {
                        clearInterval(interval); // 클라이언트가 연결을 끊으면 interval 종료
                    }
                }, 5000); // 5초마다 응답 전송
            } catch (error) {
                console.error('Error fetching logs', error);
                ws.send('Error fetching logs');
            }
        }

        // '/air/:id' 엔드포인트 처리
        else if (request.data === 'air' && request.id) {
            try {
                // 데이터를 5초마다 보내기 위한 setInterval 설정
                const interval = setInterval(async () => {
                    if (ws.readyState === WebSocket.OPEN) {
                        const data = await fetchAirDataById(request.id);
                        ws.send(JSON.stringify({ data }));
                    } else {
                        clearInterval(interval); // 클라이언트가 연결을 끊으면 interval 종료
                    }
                }, 5000); // 5초마다 응답 전송
            } catch (error) {
                console.error('Error fetching air data', error);
                ws.send('Error fetching air data');
            }
        }

        // '/ocean/:id' 엔드포인트 처리
        else if (request.data === 'ocean' && request.id) {
            try {
                // 데이터를 5초마다 보내기 위한 setInterval 설정
                const interval = setInterval(async () => {
                    if (ws.readyState === WebSocket.OPEN) {
                        const data = await fetchOceanDataById(request.id);
                        ws.send(JSON.stringify({ data }));
                    } else {
                        clearInterval(interval); // 클라이언트가 연결을 끊으면 interval 종료
                    }
                }, 5000); // 5초마다 응답 전송
            } catch (error) {
                console.error('Error fetching ocean data', error);
                ws.send('Error fetching ocean data');
            }
        }

        // '/vessel/:id' 엔드포인트 처리
        else if (request.data === 'vessel' && request.id) {
            try {
                // 데이터를 5초마다 보내기 위한 setInterval 설정
                const interval = setInterval(async () => {
                    if (ws.readyState === WebSocket.OPEN) {
                        const data = await fetchVesselDataById(request.id);
                        ws.send(JSON.stringify({ data }));
                    } else {
                        clearInterval(interval); // 클라이언트가 연결을 끊으면 interval 종료
                    }
                }, 5000); // 5초마다 응답 전송
            } catch (error) {
                console.error('Error fetching vessel data', error);
                ws.send('Error fetching vessel data');
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});







// 공기, 해양, 선박 데이터 로그를 가져오는 함수 (/logs)
async function fetchLogs() {
    let connection;
    try {
        connection = await getConnection();

        // 공기 데이터 가져오기 (각 장치의 최신 데이터)
        const [airData] = await connection.query(`
            SELECT 
                a.dev_id, DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                s.sen_name, a.sen_value
            FROM example_air_log_data a
            LEFT JOIN example_air_sys_sensor s ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
            WHERE a.dev_id BETWEEN 1 AND 5
            ORDER BY a.dev_id, a.log_datetime DESC
        `);

        // 해양 데이터 가져오기 (각 장치의 최신 데이터)
        const [oceanData] = await connection.query(`
            SELECT 
                o.dev_id, DATE_FORMAT(o.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime,
                s.sen_name, o.sen_value
            FROM example_air_log_data o
            LEFT JOIN example_air_sys_sensor s ON o.sen_id = s.sen_id AND o.dev_id = s.dev_id
            WHERE o.dev_id BETWEEN 6 AND 7
            ORDER BY o.dev_id, o.log_datetime DESC
        `);

        // 선박 데이터 가져오기 (각 선박의 최신 데이터)
        const [vesselData] = await connection.query(`
            SELECT 
                v.dev_id, DATE_FORMAT(v.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                s.sen_name, v.sen_value
            FROM example_air_log_data v
            LEFT JOIN example_air_sys_sensor s ON v.sen_id = s.sen_id AND v.dev_id = s.dev_id
            WHERE v.dev_id BETWEEN 8 AND 17
            ORDER BY v.dev_id, v.log_datetime DESC
        `);

        // 공기 데이터 처리
        const airDataWithId = [];
        airData.forEach(item => {
            let data = airDataWithId.find(data => data.id === item.dev_id);
            if (!data) {
                data = {
                    log_datetime: item.log_datetime,
                    id: item.dev_id,
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
                airDataWithId.push(data);
            }
            data[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
            if (item.sen_name === 'FIRM') {
                data.firm = String(item.sen_value);  // FIRM은 문자열로 처리
            }
        });

        // 해양 데이터 처리
        const oceanDataWithId = [];
        oceanData.forEach(item => {
            let data = oceanDataWithId.find(data => data.id === item.dev_id);
            if (!data) {
                data = {
                    log_datetime: item.log_datetime,
                    id: item.dev_id,
                    battery: null,
                    temp: null,
                    do: null,
                    ec: null,
                    salinity: null,
                    tds: null,
                    ph: null,
                    orp: null
                };
                oceanDataWithId.push(data);
            }
            data[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
        });

        // 선박 데이터 처리
        const vesselDataWithId = [];
        vesselData.forEach(item => {
            let data = vesselDataWithId.find(data => data.id === item.dev_id);
            if (!data) {
                data = {
                    log_datetime: item.log_datetime,
                    id: item.dev_id,
                    latitude: null,
                    longitude: null,
                    speed: null,
                    heading: null
                };
                vesselDataWithId.push(data);
            }
            data[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
        });

        // 최종 데이터 반환
        return {
            data: [
                ...airDataWithId,
                ...oceanDataWithId,
                ...vesselDataWithId
            ]
        };
    } catch (error) {
        console.error('Error fetching logs:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}



// ID별 공기 데이터를 가져오는 함수 (/air/:id)
async function fetchAirDataById(id) {
    let connection;
    try {
        connection = await getConnection();
        const [airData] = await connection.query(`
            SELECT 
                DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                a.dev_id, s.sen_name, a.sen_value
            FROM example_air_log_data a
            LEFT JOIN example_air_sys_sensor s ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
            WHERE a.dev_id = ?
            ORDER BY a.log_datetime DESC
        `, [id]);

        // 데이터를 하나의 객체로 합치기
        let result = {
            log_datetime: null,
            id: id,
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

        // 공기 데이터 매핑
        airData.forEach(item => {
            result.log_datetime = item.log_datetime;
            result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
            if (item.sen_name === 'FIRM') {
                result.firm = String(item.sen_value);  // FIRM 값을 문자열로 처리
            }
        });

        return result;
    } finally {
        if (connection) connection.end();
    }
}

// ID별 해양 데이터를 가져오는 함수 (/ocean/:id)
async function fetchOceanDataById(id) {
    let connection;
    try {
        connection = await getConnection();
        const [oceanData] = await connection.query(`
            SELECT 
                DATE_FORMAT(o.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                o.dev_id, s.sen_name, o.sen_value
            FROM example_air_log_data o
            LEFT JOIN example_air_sys_sensor s ON o.sen_id = s.sen_id AND o.dev_id = s.dev_id
            WHERE o.dev_id = ?
            ORDER BY o.log_datetime DESC
        `, [id]);

        // 데이터를 하나의 객체로 합치기
        let result = {
            log_datetime: null,
            id: id,
            battery: null,
            temp: null,
            do: null,
            ec: null,
            salinity: null,
            tds: null,
            ph: null,
            orp: null
        };

        // 해양 데이터 매핑
        oceanData.forEach(item => {
            result.log_datetime = item.log_datetime;
            result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
        });

        return result;
    } finally {
        if (connection) connection.end();
    }
}


// ID별 선박 데이터를 가져오는 함수 (/vessel/:id)
async function fetchVesselDataById(id) {
    let connection;
    try {
        connection = await getConnection();
        const [vesselData] = await connection.query(`
            SELECT 
                DATE_FORMAT(v.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                v.dev_id, s.sen_name, v.sen_value
            FROM example_air_log_data v
            LEFT JOIN example_air_sys_sensor s ON v.sen_id = s.sen_id AND v.dev_id = s.dev_id
            WHERE v.dev_id = ?
            ORDER BY v.log_datetime DESC
        `, [id]);

        // 데이터를 하나의 객체로 합치기
        let result = {
            log_datetime: null,
            id: id,
            latitude: null,
            longitude: null,
            speed: null,
            heading: null
        };

        // 선박 데이터 매핑
        vesselData.forEach(item => {
            result.log_datetime = item.log_datetime;
            result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
        });

        return result;
    } finally {
        if (connection) connection.end();
    }
}


