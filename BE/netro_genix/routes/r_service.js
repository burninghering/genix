const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")

// DB 연결 설정 - 연결 풀 생성
const pool = mysql.createPool({
  host: "14.63.176.165",
  port: 7306,
  user: "root",
  password: "netro9888!",
  database: "netro_data_platform",
  waitForConnections: true,
  connectionLimit: 10, // 동시 최대 연결 수 설정
  queueLimit: 0, // 대기열 무제한
})

// DB 연결 함수
async function getConnection() {
  return await pool.getConnection()
}

router.get("/air", async (req, res) => {
  let connection
  try {
    connection = await getConnection()
    const [airData] = await connection.query(`
      SELECT 
        DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, a.dev_id,
        s.sen_name, a.sen_value
      FROM example_air_log_data_latest a
      LEFT JOIN example_air_sys_sensor_latest s 
      ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
      WHERE a.dev_id BETWEEN 1 AND 15
      ORDER BY a.dev_id, a.log_datetime DESC
    `)

    // 데이터에 ID 할당 및 센서 값 매핑
    const airDataWithId = []
    airData.forEach((item) => {
      let existing = airDataWithId.find((data) => data.id === item.dev_id)
      if (!existing) {
        existing = {
          log_datetime: item.log_datetime,
          id: item.dev_id,
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
          send: 1,
        }
        airDataWithId.push(existing)
      }
      if (item.sen_name) {
        existing[item.sen_name.toLowerCase()] = parseFloat(item.sen_value)
      }
    })

    res.json({ data: airDataWithId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "공기 데이터를 불러오는 중 오류 발생" })
  } finally {
    if (connection) connection.release() // 연결 풀로 반환
  }
})

// 다른 엔드포인트에서도 동일한 방식으로 연결 풀 사용
router.get("/ocean", async (req, res) => {
  let connection
  try {
    connection = await getConnection()
    const [oceanData] = await connection.query(`
      SELECT 
        DATE_FORMAT(o.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, o.dev_id,
        s.sen_name, o.sen_value
      FROM example_ocean_log_data_latest o
      LEFT JOIN example_ocean_sys_sensor_latest s 
      ON o.sen_id = s.sen_id AND o.dev_id = s.dev_id
      WHERE o.dev_id BETWEEN 1 AND 5
      ORDER BY o.dev_id, o.log_datetime DESC
    `)

    // 센서 값과 dev_id 매핑
    const oceanDataWithId = []
    oceanData.forEach((item) => {
      let existing = oceanDataWithId.find((data) => data.id === item.dev_id)
      if (!existing) {
        existing = {
          log_datetime: item.log_datetime,
          id: item.dev_id,
          battery: null,
          temp: null,
          do: null,
          ec: null,
          salinity: null,
          tds: null,
          ph: null,
          orp: null,
        }
        oceanDataWithId.push(existing)
      }
      existing[item.sen_name.toLowerCase()] = parseFloat(item.sen_value)
    })

    res.json({ data: oceanDataWithId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "해양 데이터를 불러오는 중 오류 발생" })
  } finally {
    if (connection) connection.release() // 연결 풀로 반환
  }
})

// /service/ship 엔드포인트 (1~100 전체 ID 불러오기)
// router.get("/ship", async (req, res) => {
//   let connection
//   try {
//     connection = await getConnection()
//     const [vesselData] = await connection.query(`
//       SELECT
//         DATE_FORMAT(v.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, v.dev_id,
//         s.sen_name, v.sen_value
//       FROM example_vessel_log_data_latest v
//       LEFT JOIN example_vessel_sys_sensor_latest s ON v.sen_id = s.sen_id AND v.dev_id = s.dev_id
//       WHERE v.dev_id BETWEEN 1 AND 100
//       ORDER BY v.dev_id, v.log_datetime DESC
//     `)

//     const vesselDataWithId = []
//     vesselData.forEach((item) => {
//       let existing = vesselDataWithId.find((data) => data.id === item.dev_id)
//       if (!existing) {
//         existing = {
//           log_datetime: item.log_datetime,
//           id: item.dev_id,
//           rcv_datetime: null,
//           lati: null,
//           longi: null,
//           speed: null,
//           course: null,
//           azimuth: null,
//         }
//         vesselDataWithId.push(existing)
//       }
//       existing[item.sen_name.toLowerCase()] = parseFloat(item.sen_value)
//     })

//     res.json({ data: vesselDataWithId })
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ error: "선박 데이터를 불러오는 중 오류 발생" })
//   } finally {
//     if (connection) connection.release() // 연결 풀로 반환
//   }
// })

module.exports = router // 라우터 객체 내보내기
