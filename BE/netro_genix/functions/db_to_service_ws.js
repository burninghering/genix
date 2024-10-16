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

                // 이후 10초마다 데이터를 보내는 setInterval 설정
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
                }, 10000); // 10초마다 응답 전송
            } catch (error) {
                console.error('Error fetching logs data', error);
                ws.send(JSON.stringify({ error: 'Error fetching logs data' }));
            }
        }

        // 공기 데이터 처리 
        else if (request.data === 'air') {
            console.log("Fetching air data...");
            try {
                const airData = await fetchAirData();
                ws.send(JSON.stringify({ data: airData }));  // 즉시 응답 전송

                // 이후 10초마다 데이터를 보내는 setInterval 설정
                interval = setInterval(async () => {
                    try {
                        const airData = await fetchAirData();
                        ws.send(JSON.stringify({ data: airData }));
                    } catch (error) {
                        console.error('Error fetching air data', error);
                        ws.send(JSON.stringify({ error: 'Error fetching air data' }));
                    }
                }, 10000);
            } catch (error) {
                console.error('Error fetching air data', error);
                ws.send(JSON.stringify({ error: 'Error fetching air data' }));
            }
        }

        // 해양 데이터 처리 
        else if (request.data === 'ocean') {
            console.log("Fetching ocean data...");
            try {
                const oceanData = await fetchOceanData();
                ws.send(JSON.stringify({ data: oceanData }));  // 즉시 응답 전송

                // 이후 10초마다 데이터를 보내는 setInterval 설정
                interval = setInterval(async () => {
                    try {
                        const oceanData = await fetchOceanData();
                        ws.send(JSON.stringify({ data: oceanData }));
                    } catch (error) {
                        console.error('Error fetching ocean data', error);
                        ws.send(JSON.stringify({ error: 'Error fetching ocean data' }));
                    }
                }, 10000);
            } catch (error) {
                console.error('Error fetching ocean data', error);
                ws.send(JSON.stringify({ error: 'Error fetching ocean data' }));
            }
        }

        // 선박 데이터 처리 
        else if (request.data === 'vessel') {
            console.log("Fetching vessel data...");
            try {
                const vesselData = await fetchVesselData();
                ws.send(JSON.stringify({ data: vesselData }));  // 즉시 응답 전송

                // 이후 10초마다 데이터를 보내는 setInterval 설정
                interval = setInterval(async () => {
                    try {
                        const vesselData = await fetchVesselData();
                        ws.send(JSON.stringify({ data: vesselData }));
                    } catch (error) {
                        console.error('Error fetching vessel data', error);
                        ws.send(JSON.stringify({ error: 'Error fetching vessel data' }));
                    }
                }, 10000);
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




//대기 데이터를 가져오는 함수
async function fetchAirData() {
    let connection;
    try {
        connection = await getConnection();
        const [airData] = await connection.query(`
            SELECT 
                a.dev_id, 
                DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                s.sen_name, 
                a.sen_value
            FROM example_air_log_data a
            LEFT JOIN example_air_sys_sensor s ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
            WHERE (a.dev_id, a.log_datetime) IN (
                SELECT dev_id, MAX(log_datetime) AS latest_log_datetime
                FROM example_air_log_data
                WHERE dev_id BETWEEN 1 AND 5
                GROUP BY dev_id
            )
            ORDER BY a.dev_id, a.log_datetime DESC
        `);

        const results = [];

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
                o.dev_id, 
                DATE_FORMAT(o.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                s.sen_name, 
                o.sen_value
            FROM example_ocean_log_data o
            LEFT JOIN example_ocean_sys_sensor s ON o.sen_id = s.sen_id AND o.dev_id = s.dev_id
            WHERE (o.dev_id, o.log_datetime) IN (
                SELECT dev_id, MAX(log_datetime) AS latest_log_datetime
                FROM example_ocean_log_data
                WHERE dev_id BETWEEN 1 AND 2
                GROUP BY dev_id
            )
            ORDER BY o.dev_id, o.log_datetime DESC
        `);

        const results = [];

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


function addSecondsToDate(datetimeString, secondsToAdd) {
    // log_datetime을 Date 객체로 변환
    const date = new Date(datetimeString);

    // Date 객체에 초 빼기
    date.setSeconds(date.getSeconds() - secondsToAdd);

    // YYYY-MM-DD HH:mm:ss 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


//선박 데이터를 가져오는 함수
async function fetchVesselData() {
    let connection;
    try {
        connection = await getConnection();
        const [vesselData] = await connection.query(`
            SELECT 
                v.dev_id, 
                s.sen_name, 
                v.sen_value
            FROM example_vessel_log_data v
            LEFT JOIN example_vessel_sys_sensor s ON v.sen_id = s.sen_id AND v.dev_id = s.dev_id
            WHERE (v.dev_id, v.log_datetime) IN (
                SELECT dev_id, MAX(log_datetime) AS latest_log_datetime
                FROM example_vessel_log_data
                WHERE dev_id BETWEEN 1 AND 10
                GROUP BY dev_id
            )
            ORDER BY v.dev_id DESC
        `);

        const results = [];
        const currentDate = new Date();

        for (let devId = 1; devId <= 10; devId++) {
            let result = {
                log_datetime: formatDateToYYYYMMDDHHMMSS(currentDate), // 현재 시간으로 log_datetime 설정
                rcv_datetime: null,
                id: devId,
                lati: null,
                longi: null,
                speed: null,
                course: null,
                azimuth: null
            };

            vesselData.forEach(item => {
                if (item.dev_id === devId) {
                    // log_datetime보다 1~3초 앞선 rcv_datetime 생성 (1~3초 랜덤)
                    const randomSeconds = Math.floor(Math.random() * 3) + 1;
                    result.rcv_datetime = addSecondsToDate(result.log_datetime, randomSeconds);

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

function formatDateToYYYYMMDDHHMMSS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function addSecondsToDate(datetimeString, secondsToAdd) {
    const date = new Date(datetimeString);
    date.setSeconds(date.getSeconds() - secondsToAdd);
    return formatDateToYYYYMMDDHHMMSS(date);
}

