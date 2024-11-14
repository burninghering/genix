const mysql = require("mysql2/promise")
const { EventEmitter } = require("events")

// DB 연결 정보
const dbConfig = {
  host: "14.63.176.165",
  port: 7306,
  //  port: 3306,
  user: "root",
  password: "netro9888!",
  database: "netro_data_platform",
}

// 커넥션 풀 생성
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 1000, // 동시에 사용할 수 있는 최대 연결 수
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

let paramAirDataList = []

async function SaveAirLogData(
  devId,
  senId,
  sensorValue,
  logDateTime = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " "),
  retries = 5,
  delay = 500
) {
  const logData = { devId, senId, sensorValue, logDateTime }
  paramAirDataList.push(logData)

  if (paramAirDataList.length == 270) {
    console.log("저장중 .......SaveAirLogData...........")

    let connection

    try {
      connection = await pool.getConnection()
      await connection.beginTransaction()

      const deleteSql = `DELETE FROM example_air_log_data_latest`
      await connection.execute(deleteSql)

      const chunks = chunkArray(paramAirDataList, 100)

      for (const chunk of chunks) {
        const sql = `INSERT INTO example_air_log_data_latest (log_datetime, dev_Id, sen_Id, sen_Value) 
        VALUES ${chunk.map(() => "(?, ?, ?, ?)").join(", ")}`

        const values = chunk.flatMap((item) => [
          item.logDateTime,
          item.devId,
          item.senId,
          item.sensorValue,
        ])
        console.log(values)
        await connection.execute(sql, values)
      }

      for (const chunk of chunks) {
        const sql = `INSERT INTO example_air_log_data (log_datetime, dev_Id, sen_Id, sen_Value) 
        VALUES ${chunk.map(() => "(?, ?, ?, ?)").join(", ")}
        ON DUPLICATE KEY UPDATE sen_Value = VALUES(sen_Value), log_datetime = VALUES(log_datetime)`

        const values = chunk.flatMap((item) => [
          item.logDateTime,
          item.devId,
          item.senId,
          item.sensorValue,
        ])
        console.log(values)
        await connection.execute(sql, values)
      }

      await connection.commit()

      paramAirDataList = []
      console.log("커밋 완료 ")
    } catch (error) {
      console.error("대량 데이터 저장 중 오류 발생: ", error)
      if (connection) await connection.rollback()
      throw error
    } finally {
      if (connection) connection.release()
    }
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

let paramDataList = []
// 배열을 일정 크기로 나누는 함수
function chunkArray(array, size) {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

async function SaveVesselLogData(
  devId,
  senId,
  sensorValue,
  logDateTime,
  retries = 5,
  delay = 500
) {
  // 1. 들어오는 값들을 객체에 셋팅
  const logData = {
    devId,
    senId,
    sensorValue,
    logDateTime,
  }
  paramDataList.push(logData)
  if (paramDataList.length == 600) {
    console.log("저장중 .......SaveVesselLogData........... ")

    let connection

    try {
      connection = await pool.getConnection()
      await connection.beginTransaction()

      // const deleteSql = `truncate table example_vessel_log_data_latest`
      //deleteSql = `delete from table example_vessel_log_data_latest`
      // await connection.execute(deleteSql)

      const chunks = chunkArray(paramDataList, 100)
      console.log("chunks :::::::::::::::" + chunks)
      for (const chunk of chunks) {
        const sql = `INSERT INTO example_vessel_log_data_latest (log_datetime, dev_Id, sen_Id, sen_Value) 
        VALUES ${chunk.map(() => "(?, ?, ?, ?)").join(", ")}`
        // 청크 데이터를 납작하게 만들어서 execute에 전달
        const values = chunk.flatMap((item) => [
          item.logDateTime,
          item.devId,
          item.senId,
          item.sensorValue,
        ])
        console.log(values)
        await connection.execute(sql, values)
      }

      for (const chunk of chunks) {
        const sql = `INSERT INTO example_vessel_log_data (log_datetime, dev_Id, sen_Id, sen_Value) 
        VALUES ${chunk.map(() => "(?, ?, ?, ?)").join(", ")}
        ON DUPLICATE KEY UPDATE sen_Value = VALUES(sen_Value)`

        // 청크 데이터를 납작하게 만들어서 execute에 전달
        const values = chunk.flatMap((item) => [
          item.logDateTime,
          item.devId,
          item.senId,
          item.sensorValue,
        ])
        console.log(values)
        await connection.execute(sql, values)
      }

      await connection.commit()

      paramDataList = []
      console.log("commit 완료 ")
    } catch (error) {
      console.error("Error during bulk data saving: ", error)
      if (connection) await connection.rollback()
      throw error
    } finally {
      if (connection) connection.release()
    }
  }
}

// async function SaveVesselLogDataLatest(
//   devId,
//   senId,
//   sensorValue,
//   logDateTime,
//   retries = 5,
//   delay = 500
// )
// {
//   let connection

//   connection = await pool.getConnection()

//    // 1. 들어오는 값들을 객체에 셋팅
//     const logData = {
//       devId,
//       senId,
//       sensorValue,
//       logDateTime
//     };
//     paramDataList.push(logData);
//     if(paramDataList.length == 600)
//     {
//       console.log("저장중 .......SaveVesselLogDataLatest....... ");
//       let connection
//       try {
//         connection = await pool.getConnection()
//         await connection.beginTransaction()
//         const chunks = chunkArray(paramDataList,100);

//         for(const chunk of chunks)
//         {
//           const sql = `INSERT INTO example_vessel_log_data_latest (log_datetime, dev_Id, sen_Id, sen_Value)
//           VALUES ${chunk.map(() => '(?, ?, ?, ?)').join(', ')}`

//           // 청크 데이터를 납작하게 만들어서 execute에 전달
//           const values = chunk.flatMap(item => [
//             item.logDateTime,
//             item.devId,
//             item.senId,
//             item.sensorValue
//           ]);
//           await connection.execute(sql, values)
//         }
//         await connection.commit()
//         paramDataList= [];
//         console.log("commit 완료 ")
//     } catch (error) {
//       console.error("Error during bulk data saving: ", error);
//       if (connection) await connection.rollback();
//       throw error;
//     } finally {
//       if (connection) connection.release();
//   }
// }
// }

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
  SelectInsepectTable,
  truncateLatest,
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

async function truncateLatest() {
  let connection
  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()

    const deleteSql = `truncate table example_vessel_log_data_latest`

    await connection.execute(deleteSql) // execute()를 사용하여 SQL 실행
    await connection.commit() // 트랜잭션 커밋

    console.log("Table truncated successfully.")
  } catch (error) {
    // 에러가 발생하면 롤백
    if (connection) {
      await connection.rollback()
    }
    console.error("Error truncate lastest:", error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}
