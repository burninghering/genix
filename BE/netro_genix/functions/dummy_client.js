const express = require("express")
const { WebSocketServer } = require("ws")
const db_manager = require("./db_manager") // db_manager 모듈 가져옴

// Express 서버와 WebSocket 서버 설정
const app = express()
const server = require("http").createServer(app)
const wss = new WebSocketServer({ server })

// WebSocket 연결 처리
wss.on("connection", (ws) => {
  console.log("Client connected")

  // 메시지 수신 처리
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message)
      // console.log("Received data:", data)

      // 데이터 타입에 따라 DB 저장 처리
      if (data.type === "air") {
        // await handleAirData(data)
      } else if (data.type === "buoy") {
        // await handleBuoyData(data)
      } else if (data.type === "vessel") {
        await handleVesselData(data)
      } else if (data.type === "scenario_air") {
        const { scenario } = data
        //  await handleScenarioAirData(data, scenario)
      } else {
        console.log("Unknown data type received:", data.type)
        ws.send(JSON.stringify({ message: "Unknown data type received." }))
        return
      }

      // 클라이언트에 성공 응답 메시지 전송
      ws.send(JSON.stringify({ message: "Data saved successfully." }))
    } catch (error) {
      console.error("Error processing message:", error)
      ws.send(
        JSON.stringify({ message: "Error saving data.", error: error.message })
      )
    }
  })

  // WebSocket 연결 종료 처리
  ws.on("close", () => {
    console.log("Client disconnected")
  })
})

// 대기 데이터 처리 함수
async function handleAirData(data) {
  const {
    DEV_ID,
    PM10 = null,
    PM25 = null,
    SO2 = null,
    NO2 = null,
    O3 = null,
    CO = null,
    VOC = null,
    H2S = null,
    NH3 = null,
    OU = null,
    HCHO = null,
    TEMP = null,
    HUMI = null,
    WINsp = null,
    WINdir = null,
    BATT = null,
    FIRM = null,
    SEND = null,
  } = data

  const sensorNames = [
    "PM10",
    "PM25",
    "SO2",
    "NO2",
    "O3",
    "CO",
    "VOC",
    "H2S",
    "NH3",
    "OU",
    "HCHO",
    "TEMP",
    "HUMI",
    "WINsp",
    "WINdir",
    "BATT",
    "FIRM",
    "SEND",
  ]
  const sensorValues = [
    PM10,
    PM25,
    SO2,
    NO2,
    O3,
    CO,
    VOC,
    H2S,
    NH3,
    OU,
    HCHO,
    TEMP,
    HUMI,
    WINsp,
    WINdir,
    BATT,
    FIRM,
    SEND,
  ]

  console.log("handleAirData 호출됨", data)

  const savePromises = sensorNames.map(async (sensorName, index) => {
    const sensorValue =
      sensorValues[index] === undefined ? null : sensorValues[index]
    try {
      console.log(
        `저장 중: DEV_ID=${DEV_ID}, sensorName=${sensorName}, sensorValue=${sensorValue}`
      )
      await db_manager.SaveDummyData(DEV_ID, index + 1, sensorName)
      await db_manager.SaveAirLogData(DEV_ID, index + 1, sensorValue)
    } catch (error) {
      console.error(`Error saving air data for sensor ${sensorName}:`, error)
    }
  })

  await Promise.all(savePromises)
}

// 해양 데이터 처리 함수
async function handleBuoyData(data) {
  const { bouy_info_bouy_code, bouy_state, bouy_sensor_value } = data
  const sensorNames = [
    "battery",
    "temp",
    "DO",
    "EC",
    "salinity",
    "TDS",
    "pH",
    "ORP",
    "Flow_Velocity",
    "Water_Depth",
    "GPS_longitude",
    "GPS_latitude",
  ]
  const sensorValues = [
    bouy_state.battery,
    bouy_sensor_value.temp,
    bouy_sensor_value.DO,
    bouy_sensor_value.EC,
    bouy_sensor_value.salinity,
    bouy_sensor_value.TDS,
    bouy_sensor_value.pH,
    bouy_sensor_value.ORP,
    bouy_sensor_value.Flow_Velocity,
    bouy_sensor_value.Water_Depth,
    bouy_sensor_value.GPS_longitude,
    bouy_sensor_value.GPS_latitude,
  ]

  const savePromises = sensorNames.map(async (sensorName, index) => {
    const sensorValue =
      sensorValues[index] === undefined ? null : sensorValues[index]
    try {
      await db_manager.SaveOceanSysSensor(
        bouy_info_bouy_code,
        index + 1,
        sensorName
      )
      await db_manager.SaveOceanLogData(
        bouy_info_bouy_code,
        index + 1,
        sensorValue
      )
    } catch (error) {
      console.error(`Error saving buoy data for sensor ${sensorName}:`, error)
    }
  })

  await Promise.all(savePromises)
}

async function handleVesselData(data) {
  if (!data.id) {
    console.error("Received vessel data with null id:", data)
    throw new Error("Invalid vessel id: id cannot be null or undefined.")
  }
  // console.log("data.log_datetime::::::::::" + data.log_datetime)
  const {
    id,
    log_datetime,
    rcv_datetime,
    lati,
    longi,
    speed,
    course,
    azimuth,
  } = data
  const sensorNames = [
    "rcv_datetime",
    "lati",
    "longi",
    "speed",
    "course",
    "azimuth",
  ]
  const sensorValues = [rcv_datetime, lati, longi, speed, course, azimuth]

  // 각 센서 데이터 저장 작업
  const savePromises = sensorNames.map(async (sensorName, index) => {
    const sensorValue =
      sensorValues[index] === undefined ? null : sensorValues[index]
    if (sensorValue !== null) {
      try {
        // await db_manager.SaveVesselSysSensor(id, index + 1, sensorName)
        //console.log("log_datetime::::::::::::" + log_datetime)
        await db_manager.SaveVesselLogData(
          id,
          index + 1,
          sensorValue,
          log_datetime
        )
        // await db_manager.SaveVesselLogDataLatest(
        //   id,
        //   index + 1,
        //   sensorValue,
        //   log_datetime
        // )
      } catch (error) {
        console.error(
          `Error saving vessel data for sensor ${sensorName}:`,
          error
        )
      }
    } else {
      console.warn(
        `Skipping save for sensor ${sensorName} as sensorValue is null for vessel id=${id}`
      )
    }
  })

  await Promise.all(savePromises)

  // 모든 센서 데이터 저장 후 최신 데이터 유지
  try {
    //await db_manager.SelectInsepectTable()
  } catch (error) {
    console.error("Error updating latest vessel log data:", error)
  }
}

// 시나리오 처리 함수
async function handleScenarioAirData(data, scenario) {
  const {
    DEV_ID,
    PM10,
    PM25,
    SO2,
    NO2,
    O3,
    CO,
    VOC,
    H2S,
    NH3,
    OU,
    HCHO,
    TEMP,
    HUMI,
    WINsp,
    WINdir,
    BATT,
    FIRM,
    SEND,
  } = data
  const sensorNames = [
    "PM10",
    "PM25",
    "SO2",
    "NO2",
    "O3",
    "CO",
    "VOC",
    "H2S",
    "NH3",
    "OU",
    "HCHO",
    "TEMP",
    "HUMI",
    "WINsp",
    "WINdir",
    "BATT",
    "FIRM",
    "SEND",
  ]
  const sensorValues = [
    PM10,
    PM25,
    SO2,
    NO2,
    O3,
    CO,
    VOC,
    H2S,
    NH3,
    OU,
    HCHO,
    TEMP,
    HUMI,
    WINsp,
    WINdir,
    BATT,
    FIRM,
    SEND,
  ]

  const savePromises = sensorNames.map(async (sensorName, index) => {
    const sensorValue =
      sensorValues[index] === undefined ? null : sensorValues[index]
    try {
      await db_manager.SaveDummyData(DEV_ID, index + 1, sensorName)
      await db_manager.SaveScenarioAirData(DEV_ID, index + 1, scenario)
    } catch (error) {
      console.error(
        `Error saving scenario air data for sensor ${sensorName}:`,
        error
      )
    }
  })

  await Promise.all(savePromises)
}

// HTTP 서버 시작
const PORT = 5000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
