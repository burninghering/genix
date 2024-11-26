const WebSocket = require("ws")
const mysql = require("mysql2/promise")
require('dotenv').config({ path: __dirname + '/../.env' });

// MySQL 커넥션 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 1000,
    queueLimit: 0, 
})

// MySQL 커넥션 풀에서 연결 가져오기
async function getConnection() {
  return pool.getConnection()
}

const wss = new WebSocket.Server({ port: 9000 })

wss.on("connection", (ws) => {
  console.log("Client connected")

  let interval

  // 메시지 수신 처리
  ws.on("message", async (message) => {
    console.log("Received message: %s", message)

    let request
    try {
      request = JSON.parse(message)
    } catch (error) {
      console.error("Invalid JSON format", error)
      ws.send(JSON.stringify({ error: "Invalid JSON format" }))
      return
    }

    // 이전 인터벌이 있으면 해제
    if (interval) {
      clearInterval(interval)
    }
      //선박 데이터 처리
    if (request.data === "vessel") {
      try {
        let vesselData = await fetchVesselData()
        console.log(">>>>>>>>>>>>>vessel >>>>>>>>>>>>>>>>")

        if (vesselData.length === 0) {
          ws.send(JSON.stringify({ error: "No vessel data found" }))
        } else {
          interval = setInterval(async () => {
            try {
              let vesselData = await fetchVesselData()
              if (vesselData.length === 0) {
                ws.send(JSON.stringify({ error: "No vessel data found" }))
              } else {
                // 100개의 데이터를 전송 (반복 전송)
                splitAndSendData(ws, vesselData)
              }
            } catch (error) {
              console.error(
                "Error during interval vessel data fetch:",
                error.message
              )
              ws.send(
                JSON.stringify({
                  error: "Error fetching vessel data during interval",
                })
              )
            }
          }, 1000) // 1초마다 반복
        }
      } catch (error) {
        console.error("Error fetching vessel data:", error.message)
        ws.send(JSON.stringify({ error: "Error fetching vessel data" }))
      }
    }
    // 알 수 없는 데이터 타입 처리
    else {
      console.log("Unknown request type:", request.data)
      ws.send(JSON.stringify({ error: "Unknown request type" }))
    }
  })

  // WebSocket 연결 종료 처리
  ws.on("close", () => {
    console.log("Client disconnected")
    clearInterval(interval)
  })
})


async function fetchVesselData() {
  const connection = await getConnection()
  try {
    // 선박 데이터를 가져오는 쿼리
    const [vesselData] = await connection.query(`
   select
	tbl.dev_id,
	tbl.sen_name,
	tbl.sen_value,
	tbl.log_datetime,
	tbl.sen_id
from
	(
	SELECT
		v.dev_id,
		s.sen_name,
		v.sen_value,
		v.log_datetime,
		v.sen_id
	FROM
		example_vessel_log_data_latest v
	LEFT JOIN example_vessel_sys_sensor_latest s 
      ON
		v.sen_id = s.sen_id
		AND v.dev_id = s.dev_id
	order by
		v.log_datetime desc ,
		v.dev_id asc
  ) as tbl
where
	tbl.log_datetime = (
	select
		max(log_datetime)
	from
		example_vessel_log_data_latest
      )



	`)

    if (!vesselData || vesselData.length === 0) {
      console.error("No vessel data returned")
      return []
    }

    const results = []

    // 데이터 처리
    for (let devId = 1; devId <= 50; devId++) {
      let result = {
        log_datetime: null,
        rcv_datetime: null,
        id: devId,
        lati: null,
        longi: null,
        speed: null,
        course: null,
        azimuth: null,
      }

      vesselData.forEach((item) => {
        if (item.dev_id === devId) {
          result.log_datetime = item.log_datetime

          // rcv_datetime의 경우 따로 처리함으로써 숫자값 씌워지지 않도록 처리
          if (item.sen_name.toLowerCase() === "rcv_datetime") {
            result.rcv_datetime = item.sen_value
          } else {
            // 나머지 데이터는 Float값으로 처리
            result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value)
          }
        }
      })

      results.push(result)
    }

    return results
  } catch (error) {
    console.error("Error fetching vessel data:", error.message)
    return []
  } finally {
    connection.release()
  }
}

// 데이터 청크를 분할하고 전송하는 함수
function splitAndSendData(ws, vesselData) {
  try {
    const totalChunks = 10 // 4개의 토픽
    const chunkSize = 10 // 각 토픽당 전송할 데이터 수
    const lastChunkSize = 10 // 마지막 토픽에 전송할 데이터 수
    console.log("vesselData size ::::::::::::" + vesselData.length)
    ws.send(JSON.stringify({ vesselData }))
    // if (vesselData.length > 0) {
    //   // 메시지를 청크로 나누어 전송
    //   for (let i = 0; i < totalChunks - 1; i++) {
    //     const chunk = vesselData.slice(i * chunkSize, (i + 1) * chunkSize)
    //     if (chunk.length > 0) {
    //       ws.send(JSON.stringify({ topic: i + 1, data: chunk }))
    //     }
    //   }
    //   // 마지막 청크 전송
    //   const lastChunk = vesselData.slice((totalChunks - 1) * chunkSize)
    //   if (lastChunk.length > 0) {
    //     ws.send(JSON.stringify({ topic: totalChunks, data: lastChunk }))
    //   }
    // } else {
    //   ws.send(JSON.stringify({ error: "No vessel data found" }))
    // }
  } catch (error) {
    console.error("Error during interval vessel data fetch:", error.message)
    ws.send(
      JSON.stringify({ error: "Error fetching vessel data during interval" })
    )
  }
}

function startWebSocketServer() {
  console.log("WebSocket server is running on port 9000")
}

module.exports = startWebSocketServer
