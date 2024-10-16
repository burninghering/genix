import db_manager from './db_manager.js';

// 공기 데이터 가져오는 함수
export async function fetchAirData() {
    let connection;
    try {
        connection = await db_manager.getConnection(); // DB 연결
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
    } catch (error) {
        console.error('Error fetching air data:', error);
        throw error;
    } finally {
        if (connection) connection.end(); // DB 연결 해제
    }
}

// 해양 데이터 가져오는 함수
export async function fetchOceanData() {
    let connection;
    try {
        connection = await db_manager.getConnection(); // DB 연결
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
    } catch (error) {
        console.error('Error fetching ocean data:', error);
        throw error;
    } finally {
        if (connection) connection.end(); // DB 연결 해제
    }
}

// 선박 데이터 가져오는 함수
export async function fetchVesselData() {
    let connection;
    try {
        connection = await db_manager.getConnection(); // DB 연결
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
                log_datetime: formatDateToYYYYMMDDHHMMSS(currentDate), // 현재 시간으로 설정
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
                    const randomSeconds = Math.floor(Math.random() * 3) + 1;
                    result.rcv_datetime = addSecondsToDate(result.log_datetime, randomSeconds);
                    result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
                }
            });

            results.push(result);
        }

        return results;
    } catch (error) {
        console.error('Error fetching vessel data:', error);
        throw error;
    } finally {
        if (connection) connection.end(); // DB 연결 해제
    }
}

// 날짜에 초 추가하는 함수
function addSecondsToDate(datetimeString, secondsToAdd) {
    const date = new Date(datetimeString);
    date.setSeconds(date.getSeconds() - secondsToAdd);
    return formatDateToYYYYMMDDHHMMSS(date);
}

// 날짜 포맷 변환 함수 (YYYY-MM-DD HH:MM:SS)
function formatDateToYYYYMMDDHHMMSS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


module.exports = { fetchAirData, fetchOceanData, fetchVesselData, addSecondsToDate, formatDateToYYYYMMDDHHMMSS };