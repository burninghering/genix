import express from 'express';
import mysql from 'mysql2/promise';

// DB 연결 정보
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'netro_data_platform'
};

// 라우터 생성
const router = express.Router();

// 더미 데이터를 DB에 저장하는 API
router.post('/api/saveDummyData', async (req, res) => {
    const dummyData = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        const sensorNames = [
            "PM10", "PM2P5", "SO2", "NO2", "O3", "CO", "VOCs", "H2S", "NH3", "OU", 
            "HCHO", "TEMP", "HUMI", "WINsp", "WINdr", "BATT", "FIRM", "SEND"
        ];

        for (let i = 0; i < sensorNames.length; i++) {
            const sql = `
                INSERT INTO example_air_sys_sensor 
                (ID, DEV_ID, SEN_ID, sen_name, ID_VLU_TYPE, DFT_VALUE, MAX_VALUE, MIN_VALUE, UNIT)
                VALUES (?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL)
            `;
            await connection.execute(sql, [dummyData.ID, dummyData.DEV_ID, i + 1, sensorNames[i]]);
        }

        await connection.end();

        res.status(200).send(`Data saved for DEV_ID ${dummyData.DEV_ID}`);
    } catch (error) {
        console.error('Error saving data to DB:', error);
        res.status(500).send('Error saving data to DB');
    }
});

export default router;
