const mysql = require('mysql2/promise');
const { EventEmitter } = require('events');

// DB 연결 정보
const dbConfig = {
    host: '192.168.0.225',
    user: 'root',
    password: 'netro9888!',
    database: 'netro_data_platform'
};

// 커넥션 풀 생성
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 100,  // 동시에 사용할 수 있는 최대 연결 수
    queueLimit: 0         // 대기 중인 연결 요청 제한 없음
});

// EventEmitter 객체 생성
const netroEvent = new EventEmitter();

// example_air_sys_sensor 테이블에 데이터 저장
async function SaveDummyData(devId, senId, senName) {
    const connection = await pool.getConnection();
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
        connection.release(); // 커넥션을 풀에 반환
    }
}

// example_air_log_data 테이블에 데이터 저장
async function SaveAirLogData(devId, senId, sensorValue) {
    const connection = await pool.getConnection();
    try {
        const currentDateTime = new Date();
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
        connection.release(); // 커넥션을 풀에 반환
    }
}

// example_ocean_sys_sensor 테이블에 데이터 저장
async function SaveOceanSysSensor(devId, senId, senName) {
    const connection = await pool.getConnection();
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
        connection.release(); // 커넥션을 풀에 반환
    }
}

// example_ocean_log_data 테이블에 데이터 저장
async function SaveOceanLogData(devId, senId, sensorValue) {
    const connection = await pool.getConnection();
    try {
        const currentDateTime = new Date();
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
        connection.release(); // 커넥션을 풀에 반환
    }
}

// example_vessel_sys_sensor 테이블에 데이터 저장
async function SaveVesselSysSensor(devId, senId, senName) {
    const connection = await pool.getConnection();
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
        connection.release(); // 커넥션을 풀에 반환
    }
}

// example_vessel_log_data 테이블에 데이터 저장
async function SaveVesselLogData(devId, senId, sensorValue) {
    const connection = await pool.getConnection();
    try {
        // 현재 시간 생성
        const currentDateTime = new Date();
        const latestDateTime = `${currentDateTime.getFullYear()}-${String(currentDateTime.getMonth() + 1).padStart(2, '0')}-${String(currentDateTime.getDate()).padStart(2, '0')} ${String(currentDateTime.getHours()).padStart(2, '0')}:${String(currentDateTime.getMinutes()).padStart(2, '0')}:${String(currentDateTime.getSeconds()).padStart(2, '0')}`;

        // 테이블의 레코드 수 확인
        const [rowCountResult] = await connection.execute(`SELECT COUNT(*) AS count FROM example_vessel_log_data`);
        const rowCount = rowCountResult[0].count;

        // 레코드 수가 10,000개를 넘으면 테이블 비우기
        if (rowCount >= 10000) {
            console.log('Table has more than 10,000 records, truncating...');
            await connection.execute(`TRUNCATE TABLE example_vessel_log_data`);
            await connection.execute(`TRUNCATE TABLE example_vessel_sys_sensor`);
        }

        // 새로운 데이터 삽입
        const sql = `
            INSERT INTO example_vessel_log_data (DEV_ID, SEN_ID, SEN_VALUE, log_datetime)
            VALUES (?, ?, ?, ?)
        `;
        await connection.execute(sql, [devId, senId, sensorValue, latestDateTime]);

    } catch (error) {
        console.error('Error inserting vessel log data:', error);
        throw error;
    } finally {
        connection.release(); // 커넥션을 풀에 반환
    }
}

// 이벤트 발생 함수 예시
function emitSensorState(result) {
    netroEvent.emit('sensorState', result);
}





//<-- 시나리오 -->

// 대기
async function SaveScenarioAirData(devId, senId, sensorValue, scenario) {
    const connection = await pool.getConnection();  
    try {
        // 현재 시간을 'YYYY-MM-DD HH:mm:ss' 형식의 문자열로 변환
        const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Insert 쿼리 실행 전, 모든 값을 로그로 출력해 디버깅
        console.log('Inserting Scenario Air Data:');
        console.log(`DEV_ID: ${devId}, SEN_ID: ${senId}, SensorValue: ${sensorValue}, Scenario: ${scenario}, log_datetime: ${currentDateTime}`);

        const sqlInsert = `
            INSERT INTO example_air_log_data_scenario (DEV_ID, SEN_ID, SEN_VALUE, log_datetime, ALT_ID)
            VALUES (?, ?, ?, ?, ?)
        `;
        await connection.execute(sqlInsert, [devId, senId, sensorValue, currentDateTime, scenario]);

        console.log('Scenario air data saved successfully');
    } catch (error) {
        console.error('Error saving scenario air data:', error.message);
    } finally {
        connection.release();
    }
}




// 모듈로 내보내기
module.exports = {
    SaveDummyData,
    SaveAirLogData,
    netroEvent,
    emitSensorState,
    SaveOceanSysSensor,
    SaveOceanLogData,
    SaveVesselSysSensor,
    SaveVesselLogData,
    SaveScenarioAirData,
};
