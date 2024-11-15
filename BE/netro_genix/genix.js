import express from "express"
import cors from "cors"
import socketio from "socket.io"
import bodyParser from "body-parser"
import r_login from "./routes/r_login.js"
import r_device from "./routes/r_device.js"
import r_user from "./routes/r_user.js"
import r_api from "./routes/r_api.js"
import r_scenario from "./routes/r_scenario.js"
import r_service from "./routes/r_service.js"
import http from "http"
import https from "https"
import cron from "node-cron"
import socketScript from "./functions/socket.js"
import { BroadcastMSG, SendClientMSG } from "./functions/socketEmit.js"
import db_manager from "./functions/db_manager.js"
import { deviceEvent } from "./functions/device_dispenser.js"
import fs from "fs"
import { morganMiddleware } from "./utils/morganMiddleware.js"
import { logger } from "./utils/winston.js"

const startWebSocketServer = require("./functions/db_to_service_ws.js")

// Express 앱 생성
const app = express()

// 미들웨어 설정
app.use(bodyParser.json())
app.use(morganMiddleware)

// Swagger
import { swaggerUi, specs } from "./modules/swagger.js"
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

// CORS 설정
app.use(
  cors({
    credentials: true,
    origin: ["https://192.168.0.231"], // 클라이언트 주소
    exposedHeaders: ["AccessToken", "RefreshToken", "UserID"],
  })
)

// HTTPS 서버 설정 (SSL 인증서)
const option = {
  key: fs.readFileSync("./KEY/temp/server.key"),
  cert: fs.readFileSync("./KEY/temp/server.crt"),
  ca: fs.readFileSync("./KEY/temp/server.csr"),
  secureOptions:
    require("constants").SSL_OP_NO_SSLv2 |
    require("constants").SSL_OP_NO_SSLv3 |
    require("constants").SSL_OP_NO_TLSv1 |
    require("constants").SSL_OP_NO_TLSv1_1,

  minVersion: "TLSv1.2", // TLS 1.2 이상을 강제함
}

const httpServer = https.createServer(option, app)

// 라우터 설정
app.use("/login", r_login)
app.use("/device", r_device)
app.use("/user", r_user)
app.use("/api", r_api)
app.use("/service", r_service)
app.use("/scenario", r_scenario)

// Socket.IO 설정
const io = socketio(httpServer, {
  cors: { origin: "*" },
})

// 소켓 이벤트 핸들러 설정
socketScript.socketHandler(io)

// 주기적으로 DB에서 디바이스 상태 가져오기
cron.schedule("* * * * * * *", () => {
  db_manager.GetDeviceState()
  BroadcastMSG(io, "runState", Instance.runState)
})

cron.schedule("0 */10 * * * *", () => {
  // 실행할 함수
  console.log("10분마다 실행되는 작업입니다.")
  db_manager.truncateLatest()
})

// 센서 및 디바이스 상태 이벤트 리스너 추가
db_manager.netroEvent.addListener("sensorState", (result) => {
  BroadcastMSG(io, "sensorState", result)
})
deviceEvent.addListener("deviceState", (result) => {
  BroadcastMSG(io, "systemLog", result)
})

// 서버 종료 처리
process.on("exit", (code) => {
  db_manager.InitializingState()
  if (code !== 0) {
    logger.error({ exitCode: code, message: "I'm gone", timestamp: new Date() })
  }
})

// WebSocket 서버 실행 (db_to_service_ws)
startWebSocketServer()

// 서버 설정: 특정 IP와 포트에서 서버를 실행
app.listen(3000, () => {
  console.log(`Server is running on 3000`)
})

// // 서버 설정: 로컬에서 서버를 실행
// app.listen(4000, () => {
//     console.log(`Server is running on 4000`);
// });
const v8 = require("v8")
console.log(
  "Heap size limit>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>:",
  v8.getHeapStatistics().heap_size_limit / 1024 / 1024,
  "MB"
)

// netroEvent에서 이벤트 리스너 설정
db_manager.netroEvent.addListener("sensorState", function (result) {
  // console.log('Sensor State:', result);
})

// 예시로 sensorState 이벤트를 발생시키는 부분
// 실제로는 sensorState를 발생시킬 조건이나 로직을 작성해야 함
const sensorResult = { status: "active", DEV_ID: 1 } // 예시 데이터
db_manager.emitSensorState(sensorResult) // 이벤트 발생
