const express = require("express")
const { WebSocketServer } = require("ws")
const db_manager = require("./db_manager") // db_manager 모듈을 가져옴

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
      // console.log("Received data:", data);

      // 데이터 타입에 따라 DB 저장 처리
      if (data.type === "air") {
        await handleAirData(data)
      } else if (data.type === "buoy") {
        await handleBuoyData(data)
      } else if (data.type === "vessel") {
        await handleVesselData(data)
      } else if (data.type === "scenario_air") {
        const { scenario } = data
        await handleScenarioAirData(data, scenario)
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
    PM10,
    PM25,
    SO2,
    NO2,
    O3,
    CO,
    VOCs,
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
    "VOCs",
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
    VOCs,
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

  for (let i = 0; i < sensorNames.length; i++) {
    console.log(
      `저장 중: DEV_ID=${DEV_ID}, sensorName=${sensorNames[i]}, sensorValue=${sensorValues[i]}`
    )
    await db_manager.SaveDummyData(DEV_ID, i + 1, sensorNames[i])
    await db_manager.SaveAirLogData(DEV_ID, i + 1, sensorValues[i])
  }
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
  ]

  for (let i = 0; i < sensorNames.length; i++) {
    await db_manager.SaveOceanSysSensor(
      bouy_info_bouy_code,
      i + 1,
      sensorNames[i]
    )
    await db_manager.SaveOceanLogData(
      bouy_info_bouy_code,
      i + 1,
      sensorValues[i]
    )
  }
}

// 선박 데이터 처리 함수
async function handleVesselData(data) {
  const { id, rcv_datetime, lati, longi, speed, course, azimuth } = data
  const sensorNames = [
    "rcv_datetime",
    "lati",
    "longi",
    "speed",
    "course",
    "azimuth",
  ]
  const sensorValues = [rcv_datetime, lati, longi, speed, course, azimuth]

  for (let i = 0; i < sensorNames.length; i++) {
    const sensorValue = sensorValues[i] === undefined ? null : sensorValues[i] // undefined를 null로 변환
    await db_manager.SaveVesselSysSensor(id, i + 1, sensorNames[i])
    await db_manager.SaveVesselLogData(id, i + 1, sensorValue)
  }
}

// <!-- 시나리오 -->
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
    VOCs,
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
    "VOCs",
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
    VOCs,
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

  for (let i = 0; i < sensorNames.length; i++) {
    // 기존 데이터 저장
    await db_manager.SaveDummyData(DEV_ID, i + 1, sensorNames[i])

    // 시나리오 데이터를 처리 및 저장
    await db_manager.SaveScenarioAirData(DEV_ID, i + 1, scenario)
  }
}

// HTTP 서버 시작
const PORT = 5000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
