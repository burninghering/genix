const mysql = require("mysql2/promise")
const { EventEmitter } = require("events")

// DB 연결 정보
const dbConfig = {
  host: "192.168.0.225",
  user: "root",
  password: "netro9888!",
  database: "netro_data_platform",
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
async function SaveDummyData(
  devId,
  senId,
  senName,
  idVluType = null,
  dftValue = null,
  maxValue = null,
  minValue = null,
  unit = null
) {
  let connection
  try {
    connection = await pool.getConnection()
    const sql = `CALL SaveOrUpdateAirSysSensorData(?, ?, ?, ?, ?, ?, ?, ?)`
    await connection.execute(sql, [
      devId || null,
      senId || null,
      senName || null,
      idVluType,
      dftValue,
      maxValue,
      minValue,
      unit,
    ])
    console.log("SaveDummyData 호출 성공")
  } catch (error) {
    console.error("SaveDummyData 호출 오류:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

// example_air_log_data 테이블에 데이터 저장 또는 업데이트
async function SaveAirLogData(devId, senId, sensorValue) {
  let connection
  try {
    connection = await pool.getConnection()
    console.log("DB 연결 성공")

    const sql = `CALL SaveOrUpdateAirLogData(?, ?, ?)`
    await connection.execute(sql, [devId, senId, sensorValue])

    console.log("데이터 저장 성공", { devId, senId, sensorValue })
  } catch (error) {
    console.error("Error saving air log data using stored procedure:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

// example_ocean_sys_sensor 테이블에 데이터 저장
async function SaveOceanSysSensor(
  devId,
  senId,
  senName,
  idVluType = null,
  dftValue = null,
  maxValue = null,
  minValue = null,
  unit = null
) {
  let connection
  try {
    connection = await pool.getConnection()

    // 프로시저 호출을 통한 데이터 처리
    const sql = `CALL SaveOrUpdateOceanSysSensor(?, ?, ?, ?, ?, ?, ?, ?)`
    await connection.execute(sql, [
      devId,
      senId,
      senName,
      idVluType,
      dftValue,
      maxValue,
      minValue,
      unit,
    ])

    console.log(
      `Ocean sys sensor data for ${senName} saved or updated successfully`
    )
  } catch (error) {
    console.error(
      `Error saving or updating ${senName} data in ocean sys sensor:`,
      error
    )
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
    const sql = `CALL SaveOrUpdateOceanLogData(?, ?, ?)`
    await connection.execute(sql, [devId, senId, sensorValue || null])
    console.log(
      `Ocean log data for sensor ID ${senId} saved successfully using stored procedure`
    )
  } catch (error) {
    console.error(
      `Error saving ocean log data for sensor ID ${senId} using stored procedure:`,
      error
    )
    throw error
  } finally {
    if (connection) connection.release()
  }
}

async function SaveVesselSysSensor(
  devId,
  senId,
  senName,
  idVluType,
  dftValue,
  maxValue,
  minValue,
  unit
) {
  let connection
  try {
    connection = await pool.getConnection()

    // 파라미터 값 중 undefined가 있으면 null로 변경
    senName = senName || null
    idVluType = idVluType || null
    dftValue = dftValue || null
    maxValue = maxValue || null
    minValue = minValue || null
    unit = unit || null

    // 저장 프로시저 호출
    const sql = `CALL SaveOrUpdateVesselSysSensor(?, ?, ?, ?, ?, ?, ?, ?)`
    await connection.execute(sql, [
      devId,
      senId,
      senName,
      idVluType,
      dftValue,
      maxValue,
      minValue,
      unit,
    ])

    console.log("Data saved or updated successfully")
  } catch (error) {
    console.error("Error saving or updating vessel sys sensor data:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

async function SaveVesselLogData(
  devId,
  senId,
  sensorValue,
  retries = 5,
  delay = 100
) {
  let connection
  try {
    connection = await pool.getConnection()
    const sql = `CALL SaveOrUpdateVesselLogData(?, ?, ?)`
    await connection.execute(sql, [devId, senId, sensorValue])
    console.log("Data saved successfully using stored procedure")
  } catch (error) {
    if (error.code === "ER_LOCK_DEADLOCK" && retries > 0) {
      console.warn(`Deadlock detected. Retrying... Attempts left: ${retries}`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return SaveVesselLogData(
        devId,
        senId,
        sensorValue,
        retries - 1,
        delay * 2
      )
    }
    console.error("Error saving vessel log data using stored procedure:", error)
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
