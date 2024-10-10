import express from 'express';
import db_manager from './db_manager.js';  // 데이터베이스 모듈

const router = express.Router();  // 새로운 라우터 생성

// 더미 데이터를 받아서 DB에 저장하는 API
router.post('/api/saveDummyData', async (req, res) => {
    const dummyData = req.body;

    try {
        // DEV_ID가 없을 경우 기본값 설정
        const DEV_ID = dummyData.DEV_ID || 1;

        let SEN_ID = 1;  // SEN_ID를 강제로 1부터 시작

        for (let key in dummyData) {
            if (key !== 'ID' && key !== 'DEV_ID') {
                const sen_name = key;
                const sen_value = dummyData[key];

                // DEV_ID와 SEN_ID를 올바르게 처리하여 데이터베이스에 저장
                await db_manager.SaveDummyData(null, DEV_ID, SEN_ID++, sen_name);
            }
        }
        res.status(200).send(`Data saved for DEV_ID ${DEV_ID}`);
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Error saving data');
    }
});



export default router;
