const mysql = require("mysql2/promise")
const { EventEmitter } = require("events")

// DB 연결 정보
const dbConfig = {
  host: "14.63.176.136",
  user: "root",
  password: "netro9888!",
  database: "netro_data_platform",
  port: 7306,
}

// 커넥션 풀 생성
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 100, // 동시에 사용할 수 있는 최대 연결 수
  queueLimit: 0, // 대기 중인 연결 요청 제한 없음
})

// EventEmitter 객체 생성
const netroEvent = new EventEmitter()

// example_air_sys_sensor 테이블에 데이터 저장
async function SaveDummyData(devId, senId, senName) {
  let connection
  try {
    connection = await pool.getConnection()
    const sql = `INSERT INTO example_air_sys_sensor (DEV_ID, SEN_ID, SEN_NAME) VALUES (?, ?, ?)`
    await connection.execute(sql, [devId, senId, senName])
  } catch (error) {
    console.error("Error inserting data:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

// example_air_log_data 테이블에 데이터 저장
async function SaveAirLogData(devId, senId, sensorValue) {
  let connection
  try {
    connection = await pool.getConnection()
    console.log("DB 연결 성공")

    const currentDateTime = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Seoul" })
      .replace(" ", "T")
      .slice(0, 19)
      .replace("T", " ")

    const sql = `INSERT INTO example_air_log_data (DEV_ID, SEN_ID, SEN_VALUE, log_datetime, ALT_ID) VALUES (?, ?, ?, ?, ?)`
    await connection.execute(sql, [
      devId,
      senId,
      sensorValue,
      currentDateTime,
      null,
    ])

    console.log("데이터 저장 성공", { devId, senId, sensorValue })
  } catch (error) {
    console.error("Error inserting log data:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

// example_ocean_sys_sensor 테이블에 데이터 저장
async function SaveOceanSysSensor(devId, senId, senName) {
  let connection
  try {
    connection = await pool.getConnection()
    const sql = `INSERT INTO example_ocean_sys_sensor (DEV_ID, SEN_ID, SEN_NAME, ID_VLU_TYPE, DFT_VALUE, MAX_VALUE, MIN_VALUE, UNIT) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    await connection.execute(sql, [
      devId,
      senId,
      senName,
      null,
      null,
      null,
      null,
      null,
    ])
  } catch (error) {
    console.error("Error inserting ocean sys sensor data:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

// example_ocean_log_data 테이블에 데이터 저장
async function SaveOceanLogData(devId, senId, sensorValue) {
  let connection
  try {
    connection = await pool.getConnection()
    const currentDateTime = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Seoul" })
      .replace(" ", "T")
      .slice(0, 19)
      .replace("T", " ")
    const sql = `INSERT INTO example_ocean_log_data (DEV_ID, SEN_ID, SEN_VALUE, log_datetime, ALT_ID) VALUES (?, ?, ?, ?, ?)`
    await connection.execute(sql, [
      devId,
      senId,
      sensorValue,
      currentDateTime,
      null,
    ])
  } catch (error) {
    console.error("Error inserting log data:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

// example_vessel_sys_sensor 테이블에 데이터 저장
async function SaveVesselSysSensor(devId, senId, senName) {
  let connection
  try {
    connection = await pool.getConnection()
    const sql = `INSERT INTO example_vessel_sys_sensor (DEV_ID, SEN_ID, SEN_NAME, ID_VLU_TYPE, DFT_VALUE, MAX_VALUE, MIN_VALUE, UNIT) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    await connection.execute(sql, [
      devId,
      senId,
      senName,
      null,
      null,
      null,
      null,
      null,
    ])
  } catch (error) {
    console.error("Error inserting vessel sys sensor data:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

// example_vessel_log_data 테이블에 데이터 저장
async function SaveVesselLogData(devId, senId, sensorValue) {
  let connection
  try {
    connection = await pool.getConnection()
    const currentDateTime = new Date()
    const latestDateTime = `${currentDateTime.getFullYear()}-${String(
      currentDateTime.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDateTime.getDate()).padStart(
      2,
      "0"
    )} ${String(currentDateTime.getHours()).padStart(2, "0")}:${String(
      currentDateTime.getMinutes()
    ).padStart(2, "0")}:${String(currentDateTime.getSeconds()).padStart(
      2,
      "0"
    )}`

    const [rowCountResult] = await connection.execute(
      `SELECT COUNT(*) AS count FROM example_vessel_log_data`
    )
    const rowCount = rowCountResult[0].count

    if (rowCount >= 10000) {
      console.log("Table has more than 10,000 records, truncating...")
      await connection.execute(`TRUNCATE TABLE example_vessel_log_data`)
      await connection.execute(`TRUNCATE TABLE example_vessel_sys_sensor`)
    }

    const sql = `INSERT INTO example_vessel_log_data (DEV_ID, SEN_ID, SEN_VALUE, log_datetime) VALUES (?, ?, ?, ?)`
    await connection.execute(sql, [devId, senId, sensorValue, latestDateTime])
  } catch (error) {
    console.error("Error inserting vessel log data:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

// 시나리오 데이터 저장
async function SaveScenarioAirData(devId, senId, sensorValue, scenario) {
  let connection
  try {
    connection = await pool.getConnection()
    const currentDateTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")

    console.log(
      "Inserting Scenario Air Data:",
      devId,
      senId,
      sensorValue,
      scenario,
      currentDateTime
    )
    const sqlInsert = `INSERT INTO example_air_log_data_scenario (DEV_ID, SEN_ID, SEN_VALUE, log_datetime, ALT_ID) VALUES (?, ?, ?, ?, ?)`
    await connection.execute(sqlInsert, [
      devId,
      senId,
      sensorValue,
      currentDateTime,
      scenario,
    ])
    console.log("Scenario air data saved successfully")
  } catch (error) {
    console.error("Error saving scenario air data:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

// 이벤트 발생 함수 예시
function emitSensorState(result) {
  netroEvent.emit("sensorState", result)
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
}
