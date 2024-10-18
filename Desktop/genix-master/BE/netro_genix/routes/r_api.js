const express = require('express');
const mysql = require('mysql2');
const inside = require('point-in-polygon');

// Express 라우터 생성
const router = express.Router();

// MySQL 연결 설정
const connection = mysql.createConnection({
    host: '192.168.0.225',
    user: 'root',
    password: 'netro9888!',
    database: 'netro_data_platform'
});

// 다각형 좌표 (구룡포항 영역)
const polygon = [
  [35.989301, 129.559683], [35.990568, 129.557613], [35.990018, 129.555920], [35.989333, 129.556572],
  [35.988770, 129.555796], [35.989203, 129.555154], [35.987217, 129.552773], [35.985626, 129.552162],
  [35.983288, 129.555102], [35.986041, 129.560725], [35.983321, 129.559852], [35.978506, 129.553306],
  [35.969736, 129.555431], [35.986004, 129.572315], [35.988819, 129.561302], [35.986642, 129.558267],
  [35.985553, 129.558330], [35.985502, 129.557610], [35.987199, 129.556984], [35.987072, 129.557047]
];

// 다각형 내 임의의 위도, 경도 생성 함수
function getRandomLocation() {
  let latitude, longitude;
  let isInside = false;

  while (!isInside) {
    latitude = (Math.random() * (35.99 - 35.97) + 35.97).toFixed(6);
    longitude = (Math.random() * (129.56 - 129.55) + 129.55).toFixed(6);

    isInside = inside([parseFloat(latitude), parseFloat(longitude)], polygon);
  }

  return { latitude, longitude };
}

// 선박 데이터를 DB에 삽입하는 함수
function insertVesselData() {
  return new Promise((resolve, reject) => {
    let insertCount = 0;

    for (let i = 1; i <= 100; i++) {
      const { latitude, longitude } = getRandomLocation();
      const dev_name = `ship${i}`;
      const dev_detail = `구룡포항 선박 ${i}`;
      const dev_endpoint = `192.168.0.232/service/vessel/${i}`;

      const query = `
        INSERT INTO example_vessel_sys_device (ID, DEV_TYPE_ID, dev_name, dev_detail, SEN_CNT, loc_lati, loc_long, LOC_X, LOC_Y, LOC_Z, dev_endpoint) 
        VALUES (?, 1, ?, ?, 6, ?, ?, NULL, NULL, NULL, ?)
      `;
      const values = [i, dev_name, dev_detail, latitude.toString(), longitude.toString(), dev_endpoint];

      connection.query(query, values, (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        insertCount++;
        if (insertCount === 100) {
          resolve('100 vessels inserted successfully');
        }
      });
    }
  });
}

// example_vessel_sys_device 저장
router.post('/vessel_device', async (req, res) => {
  try {
    const result = await insertVesselData();
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send('Error inserting vessels: ' + err.message);
  }
});

// MySQL 연결
connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('Connected to MySQL');
});

module.exports = router;
