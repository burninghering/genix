import express from "express";
import db_manager from '../functions/db_manager.js'; // 데이터베이스 관리 모듈 가져오기
var router = express.Router(); // 라우터 객체 생성

// POST /api/saveAirData 라우트 처리
router.post('/saveAirData', async (req, res) => {
    const dataArray = req.body;  // 클라이언트에서 보낸 JSON 배열 데이터 가져오기

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return res.status(400).send({ error: 'Invalid data format or empty array!' });
    }

    try {
        for (const data of dataArray) {
            const DEV_ID = data.DEV_ID;

            if (!DEV_ID) {
                console.error('DEV_ID is missing in one of the entries');
                continue;  // DEV_ID가 없으면 해당 항목을 건너뜁니다.
            }

            // 센서 이름 배열 정의
            const sensorNames = [
                'PM10', 'PM2P5', 'SO2', 'NO2', 'O3',
                'CO', 'VOCs', 'H2S', 'NH3', 'OU',
                'HCHO', 'TEMP', 'HUMI', 'WINsp', 'WINdir',
                'BATT', 'FIRM', 'SEND'
            ];

            // 각 센서 이름에 대해 데이터를 저장
            for (let i = 0; i < sensorNames.length; i++) {
                const sensorName = sensorNames[i];
                const sensorValue = data[sensorName];  // 데이터에서 센서 값 가져오기

                // example_air_sys_sensor 테이블에 데이터를 저장
                await db_manager.SaveDummyData(DEV_ID, i + 1, sensorName, sensorValue);

                // example_air_log_data 테이블에 데이터를 저장
                await db_manager.SaveAirLogData(DEV_ID, i + 1, sensorValue);
            }
        }

        // 데이터 저장 성공 응답
        res.status(200).send({ message: 'All air data saved successfully!' });
    } catch (error) {
        // 오류 발생 시 오류 로그와 함께 500 응답 전송
        console.error('Error saving air data to DB:', error);
        res.status(500).send({ error: 'Error saving air data to the database' });
    }
});



// POST /api/saveOceanData 라우트 처리
router.post('/saveOceanData', async (req, res) => {
    const dataArray = req.body;  // 클라이언트에서 보낸 JSON 배열 데이터 가져오기

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return res.status(400).send({ error: 'Invalid data format or empty array!' });
    }

    try {
        for (const data of dataArray) {
            let DEV_ID = data.bouy_info_bouy_code;  // example_ocean_sys_sensor의 DEV_ID
            DEV_ID = Number(DEV_ID) + 5;  // DEV_ID를 6부터 시작하도록 설정

            const battery = data.bouy_state.battery;  // battery 값을 사용하여 SEN_ID를 생성
            const sensorValues = data.bouy_sensor_value;

            // 센서 이름 목록
            const sensorNames = ['battery', 'temp', 'DO', 'EC', 'salinity', 'TDS', 'pH', 'ORP'];

            // SEN_ID를 1부터 시작하도록 설정
            for (let i = 0; i < sensorNames.length; i++) {
                const SEN_ID = i + 1;  // SEN_ID를 1부터 시작하도록 설정
                const SEN_NAME = sensorNames[i];  // 센서 이름
                const sensorValue = (SEN_ID === 1) ? battery : sensorValues[sensorNames[i]];  // 센서 값

                // 값이 undefined인 경우 null로 설정 (battery 값은 반드시 있어야 함)
                if (sensorValue === undefined && SEN_ID !== 1) {
                    throw new Error(`Sensor value for ${SEN_NAME} is missing!`);
                }

                // example_ocean_sys_sensor에 데이터를 저장
                await db_manager.SaveOceanSysSensor(DEV_ID, SEN_ID, SEN_NAME);

                // example_ocean_log_data에 로그 데이터를 저장
                await db_manager.SaveOceanLogData(DEV_ID, SEN_ID, sensorValue);
            }
        }

        res.status(200).send({ message: 'All ocean data saved successfully!' });
    } catch (error) {
        console.error('Error saving ocean data to DB:', error);
        res.status(500).send({ error: 'Error saving ocean data to the database' });
    }
});



module.exports = router; // 라우터 객체 내보내기
