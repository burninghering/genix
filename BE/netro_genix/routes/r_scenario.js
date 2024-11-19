const express = require("express")
const router = express.Router()
const mysql = require("mysql2/promise")

// DB 연결 설정
const dbConfig = {
  host: "192.168.0.225",
  // port: 7306,
  //  port: 3306,
  user: "root",
  password: "netro9888!",
  database: "netro_data_platform",
}

// DB 연결 함수
async function getConnection() {
  return await mysql.createConnection(dbConfig)
}

// /air/:id 엔드포인트 추가
router.get("/air/:id", async (req, res) => {
  let connection
  const id = req.params.id

  try {
    connection = await getConnection()

    // dev_id가 요청된 id와 일치하는 각 센서의 최신 값을 가져오기
    const [airData] = await connection.query(
      `
            SELECT 
                DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                a.dev_id, s.sen_name, a.sen_value
            FROM example_air_log_data_scenario a
            LEFT JOIN example_air_sys_sensor s ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
            WHERE a.dev_id = ?
            ORDER BY a.log_datetime DESC
        `,
      [id]
    ) // id 값을 바인딩하여 dev_id 필터링

    if (airData.length === 0) {
      return res
        .status(404)
        .json({ error: `데이터를 찾을 수 없습니다. ID: ${id}` })
    }

    // 기본 response 객체 생성 (센서 값들을 null로 초기화)
    const response = {
      log_datetime: airData[0].log_datetime,
      id: parseInt(airData[0].dev_id),
      send: 0,
      humi: null,
      winsp: null,
      windir: null,
      firm: null,
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
    }

    // 데이터를 센서 이름에 맞게 매핑 (sen_name에 따른 sen_value를 정확하게 할당)
    airData.forEach((item) => {
      response[item.sen_name.toLowerCase()] = parseFloat(item.sen_value)
      if (item.sen_name === "FIRM") {
        response.firm = String(item.sen_value) // FIRM 값은 문자열로 처리
      }
    })

    res.json({ data: response })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "데이터를 불러오는 중 오류 발생" })
  } finally {
    if (connection) connection.end()
  }
})

// /vessel/:id 엔드포인트 추가
router.get("/vessel/:id", async (req, res) => {
  let connection
  const id = req.params.id

  try {
    connection = await getConnection()

    // 각 센서의 최신 데이터를 가져오는 쿼리
    const [vesselData] = await connection.query(
      `
            SELECT 
                v.dev_id,
                s.sen_name, 
                v.sen_value,
                DATE_FORMAT(v.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime
            FROM example_vessel_log_data_scenario v
            LEFT JOIN example_vessel_sys_sensor s 
                ON v.sen_id = s.sen_id AND v.dev_id = s.dev_id
            WHERE v.dev_id = ? 
            AND v.dev_id BETWEEN 1 AND 10
            AND v.log_datetime = (
                SELECT MAX(sub_v.log_datetime)
                FROM example_vessel_log_data_scenario sub_v
                WHERE sub_v.dev_id = v.dev_id AND sub_v.sen_id = v.sen_id
            )
            ORDER BY v.log_datetime DESC
        `,
      [id]
    )

    if (vesselData.length === 0) {
      return res
        .status(404)
        .json({ error: `데이터를 찾을 수 없습니다. ID: ${id}` })
    }

    // 기본 response 객체 생성 (센서 값들을 null로 초기화)
    const response = {
      log_datetime: vesselData[0].log_datetime,
      id: parseInt(vesselData[0].dev_id),
      rcv_datetime: null,
      lati: null,
      longi: null,
      speed: null,
      course: null,
      azimuth: null,
    }

    // 데이터를 센서 이름에 맞게 매핑 (sen_name에 따른 sen_value를 할당)
    vesselData.forEach((item) => {
      response[item.sen_name.toLowerCase()] = parseFloat(item.sen_value)
    })

    res.json({ data: response })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "데이터를 불러오는 중 오류 발생" })
  } finally {
    if (connection) connection.end()
  }
})

// /collision 엔드포인트
router.get("/collision", async (req, res) => {
  let connection

  try {
    // 데이터베이스 연결을 위한 함수 (적절히 정의되어 있어야 합니다)
    connection = await getConnection()

    // 테이블에서 모든 데이터를 시간 순으로 가져오는 쿼리
    const [collisionData] = await connection.query(
      `
        SELECT 
            dev_id,
            sen_id,
            sen_value,
            DATE_FORMAT(log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime
        FROM example_vessel_log_data_collision
        ORDER BY log_datetime ASC
      `
    )

    // 데이터가 없는 경우 처리
    if (collisionData.length === 0) {
      return res.status(404).json({ error: "충돌 데이터가 존재하지 않습니다." })
    }

    // 데이터를 요청하신 형식으로 변환
    const formattedData = []
    let currentVessel = {}

    // 센서 데이터에 따른 값 매핑
    collisionData.forEach((row) => {
      const { dev_id, sen_id, sen_value, log_datetime } = row

      // 새로운 dev_id가 발견되면, 현재 데이터를 배열에 추가하고 새로운 객체 생성
      if (currentVessel.id !== dev_id) {
        if (currentVessel.id) {
          formattedData.push({ ...currentVessel })
        }
        currentVessel = {
          log_datetime,
          rcv_datetime: new Date(new Date(log_datetime).getTime() - 1000)
            .toISOString()
            .slice(0, 19)
            .replace("T", " "), // 수신 시간을 로그 시간보다 1초 이전으로 설정
          id: dev_id,
          lati: null,
          longi: null,
          speed: null,
          course: null,
          azimuth: null,
        }
      }

      // 센서 ID에 따라 데이터를 매핑
      switch (sen_id) {
        case 2:
          currentVessel.lati = parseFloat(sen_value)
          break
        case 3:
          currentVessel.longi = parseFloat(sen_value)
          break
        case 4:
          currentVessel.speed = parseFloat(sen_value)
          break
        case 5:
          currentVessel.course = parseInt(sen_value, 10)
          break
        case 6:
          currentVessel.azimuth = parseInt(sen_value, 10)
          break
        default:
          break
      }
    })

    // 마지막 vessel을 배열에 추가
    if (currentVessel.id) {
      formattedData.push({ ...currentVessel })
    }

    // 데이터를 클라이언트에 응답으로 전달
    res.json({ data: formattedData })
  } catch (err) {
    console.error("데이터베이스에서 충돌 데이터를 불러오는 중 오류 발생:", err)
    res.status(500).json({ error: "데이터를 불러오는 중 오류가 발생했습니다." })
  } finally {
    if (connection) connection.end() // 연결 종료
  }
})

module.exports = router // 라우터 객체 내보내기
