const WebSocket = require("ws")
const mysql = require("mysql2/promise")
const dbConfig = require("../../dbConfig")

// MySQL 커넥션 풀 생성
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// MySQL 커넥션 풀에서 연결 가져오기
async function getConnection() {
  return pool.getConnection()
}

const wss = new WebSocket.Server({ port: 8082 })

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

    // 'logs' 요청 처리
    if (request.data === "logs") {
      console.log("Fetching air, ocean, and vessel data...")
      try {
        const [airData, oceanData, vesselData] = await Promise.all([
          fetchAirData(),
          fetchOceanData(),
          fetchVesselData(),
        ])

        const combinedData = [...airData, ...oceanData, ...vesselData]
        ws.send(JSON.stringify({ data: combinedData }))

        // 10초마다 데이터 전송
        interval = setInterval(async () => {
          try {
            const [airData, oceanData, vesselData] = await Promise.all([
              fetchAirData(),
              fetchOceanData(),
              fetchVesselData(),
            ])
            const combinedData = [...airData, ...oceanData, ...vesselData]
            ws.send(JSON.stringify({ data: combinedData }))
          } catch (error) {
            console.error("Error fetching logs data", error)
            ws.send(JSON.stringify({ error: "Error fetching logs data" }))
          }
        }, 10000)
      } catch (error) {
        console.error("Error fetching logs data", error)
        ws.send(JSON.stringify({ error: "Error fetching logs data" }))
      }
    }

    // 공기 데이터 처리
    else if (request.data === "air") {
      try {
        const airData = await fetchAirData()
        ws.send(JSON.stringify({ data: airData }))

        // 5초마다 데이터 전송
        interval = setInterval(async () => {
          try {
            const airData = await fetchAirData()
            ws.send(JSON.stringify({ data: airData }))
          } catch (error) {
            console.error("Error fetching air data", error)
            ws.send(JSON.stringify({ error: "Error fetching air data" }))
          }
        }, 5000)
      } catch (error) {
        console.error("Error fetching air data", error)
        ws.send(JSON.stringify({ error: "Error fetching air data" }))
      }
    }

    // 해양 데이터 처리
    else if (request.data === "ocean") {
      try {
        const oceanData = await fetchOceanData()
        ws.send(JSON.stringify({ data: oceanData }))

        // 5초마다 데이터 전송
        interval = setInterval(async () => {
          try {
            const oceanData = await fetchOceanData()
            ws.send(JSON.stringify({ data: oceanData }))
          } catch (error) {
            console.error("Error fetching ocean data", error)
            ws.send(JSON.stringify({ error: "Error fetching ocean data" }))
          }
        }, 5000)
      } catch (error) {
        console.error("Error fetching ocean data", error)
        ws.send(JSON.stringify({ error: "Error fetching ocean data" }))
      }

      //선박 데이터 처리
    } else if (request.data === "vessel") {
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

    // 시나리오 데이터 처리
    else if (request.data === "scenario_air") {
      const { devId, senId, scenario } = request

      if (!devId || !senId || !scenario) {
        ws.send(
          JSON.stringify({
            error: "Missing parameters: devId, senId, or scenario",
          })
        )
        return
      }

      try {
        // 시나리오 데이터를 저장
        await fetchScenarioAirData(devId, senId, scenario)
        ws.send(
          JSON.stringify({ success: "Scenario air data saved successfully" })
        )

        // 10초마다 시나리오 데이터를 저장
        interval = setInterval(async () => {
          try {
            await fetchScenarioAirData(devId, senId, scenario)
            ws.send(
              JSON.stringify({
                success: `Scenario air data saved for devId: ${devId}, senId: ${senId}`,
              })
            )
          } catch (error) {
            console.error("Error saving scenario air data:", error)
            ws.send(JSON.stringify({ error: "Error saving scenario air data" }))
          }
        }, 10000) // 10초마다 실행
      } catch (error) {
        console.error("Error saving scenario air data:", error)
        ws.send(JSON.stringify({ error: "Error saving scenario air data" }))
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

// 대기 데이터를 가져오는 함수
async function fetchAirData() {
  const connection = await getConnection()
  try {
    const [airData] = await connection.query(`
            SELECT a.dev_id, DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, s.sen_name, a.sen_value
            FROM example_air_log_data_latest a
            LEFT JOIN example_air_sys_sensor_latest s ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
            WHERE (a.dev_id, a.log_datetime) IN (
                SELECT dev_id, MAX(log_datetime) AS latest_log_datetime
                FROM example_air_log_data_latest
                WHERE dev_id BETWEEN 1 AND 15
                GROUP BY dev_id
            )
            ORDER BY a.dev_id, a.log_datetime DESC
        `)

    const results = []
    for (let devId = 1; devId <= 15; devId++) {
      let result = {
        log_datetime: null,
        id: devId,
        humi: null,
        winsp: null,
        windir: null,
        batt: null,
        pm10: null,
        pm25: null,
        so2: null,
        no2: null,
        o3: null,
        co: null,
        voc: null,
        h2s: null,
        nh3: null,
        ou: null,
        hcho: null,
        temp: null,
        firm: null,
      }

      airData.forEach((item) => {
        if (item.dev_id === devId) {
          result.log_datetime = item.log_datetime
          result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value)
        }
      })

      results.push(result)
    }

    return results
  } finally {
    connection.release()
  }
}

// 해양 데이터를 가져오는 함수
async function fetchOceanData() {
  const connection = await getConnection()
  try {
    const [oceanData] = await connection.query(`
            SELECT o.dev_id, DATE_FORMAT(o.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, s.sen_name, o.sen_value
            FROM example_ocean_log_data_latest o
            LEFT JOIN example_ocean_sys_sensor_latest s ON o.sen_id = s.sen_id AND o.dev_id = s.dev_id
            WHERE (o.dev_id, o.log_datetime) IN (
                SELECT dev_id, MAX(log_datetime) AS latest_log_datetime
                FROM example_ocean_log_data_latest
                WHERE dev_id BETWEEN 1 AND 5
                GROUP BY dev_id
            )
            ORDER BY o.dev_id, o.log_datetime DESC
        `)

    const results = []
    for (let devId = 1; devId <= 5; devId++) {
      let result = {
        log_datetime: null,
        id: devId,
        battery: null,
        temp: null,
        do: null,
        ec: null,
        salinity: null,
        tds: null,
        ph: null,
        orp: null,
        flow_velocity: null,
        water_depth: null,
        gps_longitude: null,
        gps_latitude: null,
      }

      oceanData.forEach((item) => {
        if (item.dev_id === devId) {
          result.log_datetime = item.log_datetime
          result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value)
        }
      })

      results.push(result)
    }

    return results
  } finally {
    connection.release()
  }
}

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
    for (let devId = 1; devId <= 100; devId++) {
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

// <-- 시나리오 -->

// fetchScenarioAirData 함수: 시나리오 데이터를 가져오고 처리하는 함수
async function fetchScenarioAirData() {
  const connection = await getConnection()
  try {
    // Air 시나리오 데이터 쿼리 실행
    const [airData] = await connection.query(`
            SELECT a.dev_id, s.sen_name, a.sen_value, a.log_datetime
            FROM example_air_log_data_scenario a
            LEFT JOIN example_air_sys_sensor s ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
            WHERE a.dev_id BETWEEN 1 AND 5
            AND a.log_datetime = (
                SELECT MAX(log_datetime) 
                FROM example_air_log_data_scenario 
                WHERE dev_id = a.dev_id
            )
            ORDER BY a.dev_id DESC
        `)

    // airData가 제대로 반환되지 않으면 에러를 로그로 출력
    if (!airData || airData.length === 0) {
      console.error("No air data returned")
      return []
    }

    const results = []

    // 데이터 처리
    airData.forEach((item) => {
      // 현재 devId에 대한 결과를 찾음
      let result = results.find((res) => res.id === item.dev_id)

      if (!result) {
        // 해당 devId에 대한 새로운 결과 생성
        result = {
          log_datetime: item.log_datetime, // 시나리오 데이터에서 가져온 로그 시간
          id: item.dev_id,
          pm10: null,
          pm25: null,
          so2: null,
          no2: null,
          o3: null,
          co: null,
          voc: null,
          h2s: null,
          nh3: null,
          ou: null,
          hcho: null,
          temp: null,
          humi: null,
          winsp: null,
          windir: null,
          batt: null,
        }
        results.push(result)
      }

      // 센서 데이터 매핑
      result[item.sen_name.toLowerCase()] = parseFloat(item.sen_value)
    })

    return results
  } catch (error) {
    // 에러 발생 시 에러 메시지를 콘솔에 출력
    console.error("Error fetching air scenario data:", error.message)
    return [] // 에러가 발생해도 빈 배열 반환
  } finally {
    connection.release() // 커넥션 반환
  }
}

// 날짜 포맷 변경 함수
function formatDateToYYYYMMDDHHMMSS(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 초 더하기 함수
function addSecondsToDate(datetimeString, secondsToAdd) {
  const date = new Date(datetimeString)
  date.setSeconds(date.getSeconds() + secondsToAdd)
  return formatDateToYYYYMMDDHHMMSS(date)
}

function startWebSocketServer() {
  console.log("WebSocket server is running on port 8082")
}

module.exports = startWebSocketServer
