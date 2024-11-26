const express = require("express");
const cors = require("cors");
const socketio = require("socket.io");
const bodyParser = require("body-parser");
const r_login = require("./routes/r_login");
const r_device = require("./routes/r_device");
const r_user = require("./routes/r_user");
const r_service = require("./routes/r_service");
const http = require("http");
const https = require("https");
const cron = require("node-cron");
const socketScript = require("./functions/socket");
const { BroadcastMSG, SendClientMSG } = require("./functions/socketEmit");
const db_manager = require("./functions/db_manager");
const db_connector = require("./functions/db_connector");
const { deviceEvent } = require("./functions/device_dispenser");
const fs = require("fs");
const { morganMiddleware } = require("./utils/morganMiddleware");
const { logger } = require("./utils/winston");
const startWebSocketServer = require("./functions/db_to_service_ws.js")

// WebSocket 서버 실행 (db_to_service_ws)
startWebSocketServer()

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
  cors({credentials: true,
    origin: [ "https://192.168.0.231" ], // 클라이언트 주소
    exposedHeaders: [ "AccessToken", "RefreshToken", "UserID" ],})
)

// HTTPS 서버 설정 (SSL 인증서)
const option = {key: fs.readFileSync("./KEY/temp/server.key"),
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
app.use("/service", r_service)


// Socket.IO 설정
const io = socketio(httpServer, {cors: { origin: "*" },})

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
  db_connector.truncateLatest()
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

// 서버 설정: 특정 IP와 포트에서 서버를 실행
app.listen(3000, () => {
  console.log(`Server is running on 3000`)
})

const v8 = require("v8")
console.log(
  "Heap size limit",
  v8.getHeapStatistics().heap_size_limit / 1024 / 1024,
  "MB"
)

// netroEvent에서 이벤트 리스너 설정
db_manager.netroEvent.addListener("sensorState", function (result) {
  // console.log('Sensor State:', result);
})
