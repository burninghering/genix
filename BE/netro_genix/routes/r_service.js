const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")

// DB 연결 설정 - 연결 풀 생성
const pool = mysql.createPool({
  host: "192.168.0.225",
  // port: 7306,
  //  port: 3306,
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

// router.get("/oldship", async (req, res) => {
//   let connection
//   try {
//     connection = await getConnection()
//     const [oldShipData] = await connection.query(`
//       SELECT
//         s.ID AS id,
//         s.SHIP_ID AS ship_id,
//         s.TYPE AS type,
//         s.NAME AS name,
//         s.POL AS pol,
//         s.POL_ADDR AS pol_addr,
//         s.HM AS hm,
//         s.PE AS pe,
//         s.PS AS ps,
//         s.KW AS kw,
//         s.ENGINE_CNT AS engine_cnt,
//         s.PROPELLER AS propeller,
//         s.PROPELLER_CNT AS propeller_cnt,
//         s.LENGTH AS length,
//         s.BREATH AS breath,
//         s.DEPTH AS depth,
//         s.GT AS gt,
//         s.SIGN AS sign,
//         s.REG_YMD AS reg_ymd,
//         s.LAUNCHING_YMD AS launching_ymd,
//         l.CNT AS cnt,
//         l.STAY_TIME AS stay_time,
//         l.TOTAL AS total,
//         l.CO2 AS co2
//       FROM tb_sys_ship_device s
//       LEFT JOIN tb_log_oldship l
//       ON s.SHIP_ID = l.SHIP_ID
//       ORDER BY s.SHIP_ID
//     `)

//     // 데이터 병합 및 날짜 포맷 변경
//     const oldShipDataFormatted = oldShipData.map((item) => ({
//       id: item.id,
//       ship_id: item.ship_id,
//       type: item.type,
//       name: item.name,
//       pol: item.pol,
//       pol_addr: item.pol_addr,
//       hm: item.hm,
//       pe: item.pe,
//       ps: parseFloat(item.ps),
//       kw: parseFloat(item.kw),
//       engine_cnt: item.engine_cnt,
//       propeller: item.propeller,
//       propeller_cnt: item.propeller_cnt,
//       length: parseFloat(item.length),
//       breath: parseFloat(item.breath),
//       depth: parseFloat(item.depth),
//       gt: parseFloat(item.gt),
//       sign: item.sign,
//       reg_ymd: item.reg_ymd ? item.reg_ymd.toISOString().slice(0, 10) : null, // YYYY-MM-DD 형식으로 변환
//       launching_ymd: item.launching_ymd
//         ? item.launching_ymd.toISOString().slice(0, 10)
//         : null, // YYYY-MM-DD 형식으로 변환
//       cnt: item.cnt || 0,
//       stay_time: item.stay_time || "00:00:00",
//       total: parseFloat(item.total) || 0,
//       co2: parseFloat(item.co2) || 0,
//     }))

//     res.json({ data: oldShipDataFormatted })
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ error: "선박 데이터를 불러오는 중 오류 발생" })
//   } finally {
//     if (connection) connection.release() // 연결 풀로 반환
//   }
// })

router.get("/oldship", async (req, res) => {
  let connection
  try {
    connection = await getConnection()

    // tb_sys_ship_device와 old_ship 매핑 및 데이터 가져오기
    const [result] = await connection.query(`
      SELECT 
        d.id AS id,
        d.ship_id AS ship_id,
        d.type AS type,
        d.name AS name,
        d.pol AS pol,
        d.pol_addr AS pol_addr,
        d.hm AS hm,
        d.pe AS pe,
        d.ps AS ps,
        d.kw AS kw,
        d.engine_cnt AS engine_cnt,
        d.propeller AS propeller,
        d.propeller_cnt AS propeller_cnt,
        d.length AS length,
        d.breath AS breath,
        d.depth AS depth,
        d.gt AS gt,
        d.sign AS sign,
        DATE_FORMAT(d.reg_ymd, '%Y-%m-%d') AS reg_ymd, -- 등록일 포맷
        DATE_FORMAT(d.launching_ymd, '%Y-%m-%d') AS launching_ymd, -- 진수일 포맷
        IFNULL(o.cnt, 0) AS cnt,
        IFNULL(o.stay_time, '00:00:00') AS stay_time,
        IFNULL(o.total, 0) AS total,
        IFNULL(o.CO2, 0) AS co2
      FROM tb_sys_ship_device d
      LEFT JOIN old_ship o ON d.id = o.id
      ORDER BY d.id
    `)

    // JSON 형식으로 정리
    const formattedData = result.map((item) => ({
      id: item.id,
      ship_id: item.ship_id,
      type: item.type,
      name: item.name,
      pol: item.pol,
      pol_addr: item.pol_addr,
      hm: item.hm,
      pe: item.pe,
      ps: parseFloat(item.ps),
      kw: parseFloat(item.kw),
      engine_cnt: item.engine_cnt,
      propeller: item.propeller,
      propeller_cnt: item.propeller_cnt,
      length: parseFloat(item.length),
      breath: parseFloat(item.breath),
      depth: parseFloat(item.depth),
      gt: parseFloat(item.gt),
      sign: item.sign,
      reg_ymd: item.reg_ymd,
      launching_ymd: item.launching_ymd,
      cnt: item.cnt,
      stay_time: item.stay_time,
      total: parseFloat(item.total),
      co2: parseFloat(item.co2),
    }))

    res.json({ data: formattedData })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "데이터를 불러오는 중 오류 발생" })
  } finally {
    if (connection) connection.release()
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
