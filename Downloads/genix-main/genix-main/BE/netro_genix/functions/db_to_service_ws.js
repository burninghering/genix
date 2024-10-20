const WebSocket = require('ws');
const mysql = require('mysql2/promise'); 

const wss = new WebSocket.Server({ port: 8081 });

// MySQL 연결을 위한 설정
async function getConnection() {
    const connection = await mysql.createConnection({
        host: '192.168.0.225',
        user: 'root',
        password: 'netro9888!',
        database: 'netro_data_platform'
    });
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
            ws.send(JSON.stringify({ error: 'Invalid JSON format' }));
            return;
        }

        let interval;

        // 'logs' 요청 처리 (공기, 해양, 선박 데이터를 모두 가져옴)
        if (request.data === 'logs') {
            console.log("Fetching air, ocean, and vessel data...");

            try {
                // 즉시 데이터를 한 번 보내기
                const airData = await fetchAirData();
                const oceanData = await fetchOceanData();
                const vesselData = await fetchVesselData();
                
                const combinedData = [...airData, ...oceanData, ...vesselData];
                ws.send(JSON.stringify({ data: combinedData }));  // 즉시 응답 전송

                // 이후 5초마다 데이터를 보내는 setInterval 설정
                interval = setInterval(async () => {
                    try {
                        const airData = await fetchAirData();
                        const oceanData = await fetchOceanData();
                        const vesselData = await fetchVesselData();
                        const combinedData = [...airData, ...oceanData, ...vesselData];
                        ws.send(JSON.stringify({ data: combinedData }));
                    } catch (error) {
                        console.error('Error fetching logs data', error);
                        ws.send(JSON.stringify({ error: 'Error fetching logs data' }));
                    }
                }, 5000); // 5초마다 응답 전송
            } catch (error) {
                console.error('Error fetching logs data', error);
                ws.send(JSON.stringify({ error: 'Error fetching logs data' }));
            }
        }

        // 공기 데이터 처리 (1~5 DEV_ID에 대한 데이터)
        else if (request.data === 'air') {
            console.log("Fetching air data...");
            try {
                const airData = await fetchAirData();
                ws.send(JSON.stringify({ data: airData }));  // 즉시 응답 전송

                // 이후 5초마다 데이터를 보내는 setInterval 설정
                interval = setInterval(async () => {
                    try {
                        const airData = await fetchAirData();
                        ws.send(JSON.stringify({ data: airData }));
                    } catch (error) {
                        console.error('Error fetching air data', error);
                        ws.send(JSON.stringify({ error: 'Error fetching air data' }));
                    }
                }, 5000);
            } catch (error) {
                console.error('Error fetching air data', error);
                ws.send(JSON.stringify({ error: 'Error fetching air data' }));
            }
        }

        // 해양 데이터 처리 (6~7 DEV_ID에 대한 데이터)
        else if (request.data === 'ocean') {
            console.log("Fetching ocean data...");
            try {
                const oceanData = await fetchOceanData();
                ws.send(JSON.stringify({ data: oceanData }));  // 즉시 응답 전송

                // 이후 5초마다 데이터를 보내는 setInterval 설정
                interval = setInterval(async () => {
                    try {
                        const oceanData = await fetchOceanData();
                        ws.send(JSON.stringify({ data: oceanData }));
                    } catch (error) {
                        console.error('Error fetching ocean data', error);
                        ws.send(JSON.stringify({ error: 'Error fetching ocean data' }));
                    }
                }, 5000);
            } catch (error) {
                console.error('Error fetching ocean data', error);
                ws.send(JSON.stringify({ error: 'Error fetching ocean data' }));
            }
        }

        // 선박 데이터 처리 (8~17 DEV_ID에 대한 데이터)
        else if (request.data === 'vessel') {
            console.log("Fetching vessel data...");
            try {
                const vesselData = await fetchVesselData();
                ws.send(JSON.stringify({ data: vesselData }));  // 즉시 응답 전송

                // 이후 5초마다 데이터를 보내는 setInterval 설정
                interval = setInterval(async () => {
                    try {
                        const vesselData = await fetchVesselData();
                        ws.send(JSON.stringify({ data: vesselData }));
                    } catch (error) {
                        console.error('Error fetching vessel data', error);
                        ws.send(JSON.stringify({ error: 'Error fetching vessel data' }));
                    }
                }, 5000);
            } catch (error) {
                console.error('Error fetching vessel data', error);
                ws.send(JSON.stringify({ error: 'Error fetching vessel data' }));
            }
        } else {
            ws.send(JSON.stringify({ error: 'Unknown data type' }));
        }

        // 클라이언트 연결이 끊기면 setInterval 해제
        ws.on('close', () => {
            console.log('Client disconnected');
            clearInterval(interval);
        });
    });
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

// 해양 데이터를 가져오는 함수 
async function fetchOceanData() {
    let connection;
    try {
        connection = await getConnection();
        const [oceanData] = await connection.query(`
            SELECT 
                DATE_FORMAT(o.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                o.dev_id, s.sen_name, o.sen_value
            FROM example_ocean_log_data o
            LEFT JOIN example_ocean_sys_sensor s ON o.sen_id = s.sen_id AND o.dev_id = s.dev_id
            WHERE o.dev_id BETWEEN 1 AND 2
            ORDER BY o.dev_id, o.log_datetime DESC
        `);

        const results = [];

        // 각 장치에 대한 데이터를 정리해서 저장
        for (let devId = 1; devId <= 2; devId++) {
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

// 선박 데이터를 가져오는 함수 
async function fetchVesselData() {
    let connection;
    try {
        connection = await getConnection();
        const [vesselData] = await connection.query(`
            SELECT 
                DATE_FORMAT(v.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                v.dev_id, s.sen_name, v.sen_value
            FROM example_vessel_log_data v
            LEFT JOIN example_vessel_sys_sensor s ON v.sen_id = s.sen_id AND v.dev_id = s.dev_id
            WHERE v.dev_id BETWEEN 1 AND 10
            ORDER BY v.dev_id, v.log_datetime DESC
        `);

        const results = [];

        // 각 장치에 대한 데이터를 정리해서 저장
        for (let devId = 1; devId <= 10; devId++) {
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
