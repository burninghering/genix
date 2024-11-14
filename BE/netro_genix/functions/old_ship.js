const mysql = require("mysql")
const WebSocket = require("ws")

// 데이터베이스 설정
const dbConfig = {
  host: "14.63.176.165",
  port: 7306,
  user: "root",
  password: "netro9888!",
  database: "netro_data_platform",
}

// 데이터베이스 연결 생성
const db = mysql.createConnection(dbConfig)
db.connect((err) => {
  if (err) throw err
  console.log("데이터베이스에 연결되었습니다.")
})

// WebSocket 서버 생성
const wss = new WebSocket.Server({ port: 8083 })
console.log("WebSocket 서버가 ws://localhost:8083 에서 시작되었습니다.")

// 데이터베이스에서 데이터를 가져와 모든 클라이언트에게 전송하는 함수
function sendDataToClients() {
  const query =
    "SELECT ship_id, cnt, stay_time, tonage, total, CO2 FROM old_ship"
  db.query(query, (error, results) => {
    if (error) throw error
    const data = JSON.stringify(results)

    // 연결된 모든 클라이언트에게 데이터 전송
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  })
}

// sendDataToClients 함수를 1분(60000 밀리초)마다 실행
setInterval(sendDataToClients, 60000)

// 새로운 WebSocket 연결을 처리
wss.on("connection", (ws) => {
  console.log("새로운 클라이언트가 연결되었습니다.")

  ws.on("close", () => {
    console.log("클라이언트가 연결을 끊었습니다.")
  })
})
