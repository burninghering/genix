const mysql = require('mysql2/promise');
const { EventEmitter } = require('events');

// DB 연결 정보
const dbConfig = {
    host: '192.168.0.225',
    user: 'root',
    password: 'netro9888!',
    database: 'netro_data_platform'
};

// EventEmitter 객체 생성
const netroEvent = new EventEmitter();

// example_air_sys_sensor 테이블에 데이터 저장
async function SaveDummyData(devId, senId, senName) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const sql = `
            INSERT INTO example_air_sys_sensor (DEV_ID, SEN_ID, SEN_NAME)
            VALUES (?, ?, ?)
        `;
        await connection.execute(sql, [devId, senId, senName]);
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    } finally {
        await connection.end();
    }
}
    
// example_air_log_data 테이블에 데이터 저장
async function SaveAirLogData(devId, senId, sensorValue) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const currentDateTime = new Date();
        // 밀리초를 제외한 현재 시간을 로컬 포맷으로 생성
        const formattedDateTime = currentDateTime.toLocaleString('sv-SE', {
            timeZone: 'Asia/Seoul'
        }).replace(' ', 'T').slice(0, 19).replace('T', ' '); // 'yyyy-MM-dd HH:mm:ss' 형식으로 변환

        const sql = `
            INSERT INTO example_air_log_data (DEV_ID, SEN_ID, SEN_VALUE, log_datetime, ALT_ID)
            VALUES (?, ?, ?, ?, ?)
        `;
        await connection.execute(sql, [devId, senId, sensorValue, formattedDateTime, null]);
    } catch (error) {
        console.error('Error inserting log data:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// sys_sensor 테이블 -> ocean 데이터 저장
async function SaveOceanSysSensor(devId, senId, senName) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const sql = `
            INSERT INTO example_ocean_sys_sensor (DEV_ID, SEN_ID, SEN_NAME, ID_VLU_TYPE, DFT_VALUE, MAX_VALUE, MIN_VALUE, UNIT)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(sql, [devId, senId, senName, null, null, null, null, null]);
    } catch (error) {
        console.error('Error inserting ocean sys sensor data:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// log_data 테이블 -> ocean 데이터 저장
async function SaveOceanLogData(devId, senId, sensorValue) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const currentDateTime = new Date();
        // 밀리초를 제외한 현재 시간을 로컬 포맷으로 생성
        const formattedDateTime = currentDateTime.toLocaleString('sv-SE', {
            timeZone: 'Asia/Seoul'
        }).replace(' ', 'T').slice(0, 19).replace('T', ' '); // 'yyyy-MM-dd HH:mm:ss' 형식으로 변환

        const sql = `
            INSERT INTO example_ocean_log_data (DEV_ID, SEN_ID, SEN_VALUE, log_datetime, ALT_ID)
            VALUES (?, ?, ?, ?, ?)
        `;
        await connection.execute(sql, [devId, senId, sensorValue, formattedDateTime, null]);
    } catch (error) {
        console.error('Error inserting log data:', error);
        throw error;
    } finally {
        await connection.end();
    }
}



// sys_sensor 테이블 -> vessel 데이터 저장
async function SaveVesselSysSensor(devId, senId, senName) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const sql = `
            INSERT INTO example_vessel_sys_sensor (DEV_ID, SEN_ID, SEN_NAME, ID_VLU_TYPE, DFT_VALUE, MAX_VALUE, MIN_VALUE, UNIT)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(sql, [devId, senId, senName, null, null, null, null, null]);
    } catch (error) {
        console.error('Error inserting vessel sys sensor data:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// log_data 테이블 -> vessel 데이터 저장
async function SaveVesselLogData(devId, senId, sensorValue) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        // 해당 devId와 senId에 대한 최신 log_datetime 가져오기
        const [rows] = await connection.execute(`
            SELECT log_datetime
            FROM example_vessel_log_data
            WHERE DEV_ID = ? AND SEN_ID = ?
            ORDER BY log_datetime DESC
            LIMIT 1
        `, [devId, senId]);

        let latestDateTime;

        if (rows.length > 0) {
            // 데이터베이스에서 가져온 최신 시간을 사용
            latestDateTime = rows[0].log_datetime;
        } else {
            // 최신 데이터가 없을 경우에도 현재 시간으로 초기 데이터 삽입
            const currentDateTime = new Date();
            latestDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');
        }

        // 새로운 데이터 삽입
        const sql = `
            INSERT INTO example_vessel_log_data (DEV_ID, SEN_ID, SEN_VALUE, log_datetime)
            VALUES (?, ?, ?, ?)
        `;
        await connection.execute(sql, [devId, senId, sensorValue, latestDateTime]);
        console.log(`Vessel log data saved for DEV_ID: ${devId}, SEN_ID: ${senId}, log_datetime: ${latestDateTime}`);
    } catch (error) {
        console.error('Error inserting vessel log data:', error);
        throw error;
    } finally {
        await connection.end();
    }
}





// 이벤트 발생 함수 예시
function emitSensorState(result) {
    netroEvent.emit('sensorState', result);
}


module.exports = {
    SaveDummyData,
    SaveAirLogData,
    netroEvent,
    emitSensorState,
    SaveOceanSysSensor,
    SaveOceanLogData,
    SaveVesselSysSensor,
    SaveVesselLogData
};
