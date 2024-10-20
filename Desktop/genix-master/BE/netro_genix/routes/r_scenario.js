const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// DB 연결 설정
const dbConfig = {
    host: '192.168.0.225',
    user: 'root',
    password: 'netro9888!',
    database: 'netro_data_platform'
};

// DB 연결 함수
async function getConnection() {
    return await mysql.createConnection(dbConfig);
}

// /air/:id 엔드포인트 추가
router.get('/air/:id', async (req, res) => {
    let connection;
    const id = req.params.id;

    try {
        connection = await getConnection();

        // dev_id가 요청된 id와 일치하는 각 센서의 최신 값을 가져오기
        const [airData] = await connection.query(`
            SELECT 
                DATE_FORMAT(a.log_datetime, '%Y-%m-%d %H:%i:%s') AS log_datetime, 
                a.dev_id, s.sen_name, a.sen_value
            FROM example_air_log_data_scenario a
            LEFT JOIN example_air_sys_sensor s ON a.sen_id = s.sen_id AND a.dev_id = s.dev_id
            WHERE a.dev_id = ?
            ORDER BY a.log_datetime DESC
        `, [id]); // id 값을 바인딩하여 dev_id 필터링

        if (airData.length === 0) {
            return res.status(404).json({ error: `데이터를 찾을 수 없습니다. ID: ${id}` });
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
            vocs: null,
            h2s: null,
            nh3: null,
            ou: null,
            hcho: null,
            temp: null
        };

        // 데이터를 센서 이름에 맞게 매핑 (sen_name에 따른 sen_value를 정확하게 할당)
        airData.forEach(item => {
            response[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
            if (item.sen_name === 'FIRM') {
                response.firm = String(item.sen_value); // FIRM 값은 문자열로 처리
            }
        });

        res.json({ data: response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '데이터를 불러오는 중 오류 발생' });
    } finally {
        if (connection) connection.end();
    }
});

// /vessel/:id 엔드포인트 추가
router.get('/vessel/:id', async (req, res) => {
    let connection;
    const id = req.params.id;

    try {
        connection = await getConnection();

        // 각 센서의 최신 데이터를 가져오는 쿼리 
        const [vesselData] = await connection.query(`
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
        `, [id]);

        if (vesselData.length === 0) {
            return res.status(404).json({ error: `데이터를 찾을 수 없습니다. ID: ${id}` });
        }

        // 기본 response 객체 생성 (센서 값들을 null로 초기화)
        const response = {
            log_datetime: vesselData[0].log_datetime,
            id: parseInt(vesselData[0].dev_id),
            rcv_datetime:null,
            lati: null,
            longi: null,
            speed: null,
            course: null,
            azimuth: null
        };

        // 데이터를 센서 이름에 맞게 매핑 (sen_name에 따른 sen_value를 할당)
        vesselData.forEach(item => {
            response[item.sen_name.toLowerCase()] = parseFloat(item.sen_value);
        });

        res.json({ data: response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '데이터를 불러오는 중 오류 발생' });
    } finally {
        if (connection) connection.end();
    }
});




module.exports = router; // 라우터 객체 내보내기
