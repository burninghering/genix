const mysql = require("mysql2/promise")
const { EventEmitter } = require("events")

// DB 연결 정보
const dbConfig = {
  host: "192.168.0.225",
  // port: 7306,
  user: "root",
  password: "netro9888!",
  database: "netro_data_platform",
}

// 커넥션 풀 생성
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 500, // 동시에 사용할 수 있는 최대 연결 수
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

async function SaveAirLogData(devId, senId, sensorValue) {
  let connection
  try {
    if (isNaN(devId) || isNaN(senId)) {
      console.error("Invalid devId or senId value:", devId, senId)
      return
    }

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

    // console.log(
    //   `Ocean sys sensor data for ${senName} saved or updated successfully`
    // )
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

    // console.log("Data saved or updated successfully")
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
  logDateTime,
  retries = 5,
  delay = 500
) {
  let connection
  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()
    //console.log("logDateTime:::::::::::::::::::::::" + logDateTime)
    const sql = `INSERT INTO example_vessel_log_data (log_datetime, dev_Id, sen_Id, sen_Value) VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE sen_Value = VALUES(sen_Value)`
    await connection.execute(sql, [logDateTime, devId, senId, sensorValue])
    await connection.commit()

    // console.log("Data saved successfully.")
  } catch (error) {
    console.log("error>>>>>>>>>" + error)
    if (error.code === "ER_LOCK_DEADLOCK" && retries > 0) {
      console.warn(`Deadlock detected. Retrying... Attempts left: ${retries}`)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 50 + delay)
      )
      return SaveVesselLogData(
        devId,
        senId,
        sensorValue,
        logDateTime,
        retries - 1,
        delay * 2
      )
    } else {
      await connection.rollback()
    }
    console.error("Error saving vessel log data:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}

async function SaveVesselLogDataLatest() {
  let connection
  try {
    connection = await pool.getConnection()

    //트랜잭션 시작
    await connection.beginTransaction()

    // 기존 데이터를 삭제하고 최신 600개의 데이터를 삽입
    const deleteSql = `DELETE FROM example_vessel_log_data_latest`
    await connection.execute(deleteSql)

    const insertSql = `
      insert into example_vessel_log_data_latest  
      select b.log_datetime, b.DEV_ID, b.SEN_ID, b.SEN_VALUE, b.ALT_ID 
      from 
      (
        select log_datetime as log_datetime_max 
        from example_vessel_log_data evld
        group by log_datetime 
        order by log_datetime  desc
        limit 1
      )  as a
      left join example_vessel_log_data b
      on a.log_datetime_max = b.log_datetime 
      order by log_datetime
      limit 600
      `

    await connection.execute(insertSql)

    // 트랜잭션 커밋
    await connection.commit()
  } catch (error) {
    // 에러가 발생하면 롤백
    if (connection) {
      await connection.rollback()
    }
    console.error("Error saving latest vessel log data:", error)
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
  SaveVesselLogDataLatest,
  SaveScenarioAirData,
  SelectInsepectTable,
}

async function SelectInsepectTable() {
  let connection
  try {
    connection = await pool.getConnection()

    const selectSql = `
       select tble.log_datetime  
        from (
          select b.log_datetime, b.DEV_ID, b.SEN_ID, b.SEN_VALUE, b.ALT_ID 
                from 
                (
                  select log_datetime as log_datetime_max 
                  from example_vessel_log_data evld
                  order by log_datetime  desc
                  limit 1
                  
                )  as a
                left join example_vessel_log_data b
                on a.log_datetime_max = b.log_datetime 
                order by log_datetime
        ) as tble
        group by tble.log_datetime
      `
    const [rows, fields] = await connection.execute(selectSql)
    // `aaa` 필드 값만 출력하기
    rows.forEach((row) => {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
      console.log(
        "디버깅 결과 :::",
        row.log_datetime + "결과 :::" + rows.length
      )
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n")
    })
  } catch (error) {
    // 에러가 발생하면 롤백
    if (connection) {
      await connection.rollback()
    }
    console.error("Error saving latest vessel log data:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}
