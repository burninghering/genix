const axios = require('axios');

// 일정 시간 지연을 추가하는 함수
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 더미 데이터를 생성하는 함수
function generateDummyData(devId) {
    return {
        DEV_ID: devId,
        PM10: "0.1",
        PM2P5: "0.1",
        SO2: "0.1",
        NO2: "0.1",
        O3: "0.001",
        CO: "0.001",
        VOCs: "0.001",
        H2S: "0.001",
        NH3: "0.001",
        OU: "0.001",
        HCHO: "0.1",
        TEMP: "25.0",
        HUMI: "55.4",
        WINsp: "0.123",
        WINdir: "245.1",
        BATT: "12.5",
        FIRM: "1.0.0",
        SEND: "0"
    };
}

// 90개의 데이터를 전송하는 함수 (요청 간 지연 추가)
async function sendDummyDataSequential() {
    for (let devId = 1; devId <= 5; devId++) {  // 5개의 DEV_ID 생성
        for (let i = 1; i <= 18; i++) {  // 각 DEV_ID에 대해 18개의 센서 데이터 생성
            let dummyData = generateDummyData(devId);
            dummyData.SEN_ID = i;  // 각 센서에 대한 고유 SEN_ID 설정

            try {
                const response = await axios.post('http://localhost:3000/api/saveDummyData', dummyData, {
                    timeout: 5 // 타임아웃 20초로 설정
                });
                console.log(`Data sent for DEV_ID ${devId}, SEN_ID ${i}:`, response.data);
            } catch (error) {
                console.error(`Error sending data for DEV_ID ${devId}, SEN_ID ${i}: ${error.message}`);
            }

            // 각 요청 사이에 5초 지연 추가
            await delay(5000);
        }
    }
}

// 90개의 데이터를 전송
sendDummyDataSequential();
