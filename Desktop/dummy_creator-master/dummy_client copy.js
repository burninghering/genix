const WebSocket = require('ws');

// WebSocket 서버에 연결
const ws = new WebSocket('ws://192.168.0.232:5000');

// 연결이 열리면 메시지를 보내는 함수
ws.on('open', () => {
    console.log('Connected to WebSocket server');

    setInterval(() => {
        const currentHour = new Date().getHours(); // 현재 시간에 맞춰 데이터 생성

        // 대기 데이터 생성 
        for (let devId = 1; devId <= 5; devId++) {
            const airData = generateTimeBasedDummyAirData(devId, currentHour);
            ws.send(JSON.stringify(airData));
        }

        console.log(`Sent Air data to WebSocket server for Hour ${currentHour}`);
    }, 60000); // 1분마다 데이터 전송

    
    setInterval(() => {
        const currentHour = new Date().getHours(); // 현재 시간에 맞춰 데이터 생성

        // 해양 데이터 생성 
        for (let devId = 1; devId <= 2; devId++) {
            const airData = generateTimeBasedDummyBuoyData(devId, currentHour);
            ws.send(JSON.stringify(airData));
        }

        console.log(`Sent Air data to WebSocket server for Hour ${currentHour}`);
    }, 60000); // 1분마다 데이터 전송


    // 1초마다 Vessel 데이터를 생성하여 서버로 전송
    setInterval(() => {
        // Vessel 데이터 생성 (1 ~ 10번 devId)
        for (let devId = 1; devId <= 10; devId++) {
            const vesselData = generateDummyVesselData(devId);
            ws.send(JSON.stringify(vesselData));
        }

        console.log('Sent Vessel data to WebSocket server');
    }, 1000); // 1초마다 데이터 전송
});



// 서버로부터 응답 메시지를 받으면 처리
ws.on('message', (message) => {
    console.log('Received from server:', message);
});

// WebSocket 연결 종료 시 처리
ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
});

// 오류 발생 시 처리
ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});



//<----------------------------------------------------------------대기

function generateTimeBasedDummyAirData(devId, hour) {
    // 시간대별 기준값 설정
    let pm10Base = (hour >= 6 && hour < 9) ? 30 :       // 아침에는 낮은 PM10 값
                   (hour >= 9 && hour < 18) ? 60 :      // 낮에는 PM10 증가
                   (hour >= 18 && hour < 24) ? 40 : 20; // 밤에는 PM10 감소
                   
    let pm25Base = (hour >= 6 && hour < 9) ? 20 :       // 아침에 낮은 PM2.5 값
                   (hour >= 9 && hour < 18) ? 50 :      // 낮에는 PM2.5 증가
                   (hour >= 18 && hour < 24) ? 30 : 15; // 밤에 PM2.5 감소
    
    let tempBase = (hour >= 0 && hour < 6) ? 18 :       // 새벽에는 낮은 온도
                   (hour >= 6 && hour < 12) ? 22 :      // 아침에 온도 상승
                   (hour >= 12 && hour < 16) ? 30 :     // 오후에 온도 최고
                   (hour >= 16 && hour < 20) ? 25 : 20; // 저녁과 밤에 온도 하락

    let humiBase = (hour >= 0 && hour < 6) ? 75 :       // 새벽에는 습도 상승
                   (hour >= 6 && hour < 12) ? 60 :      // 아침에 습도 감소
                   (hour >= 12 && hour < 18) ? 50 :     // 오후에 낮은 습도
                   (hour >= 18 && hour < 24) ? 65 : 70; // 밤에 습도 다시 상승
    
    let so2Base = (hour >= 8 && hour < 18) ? 0.03 :     // 주간에 SO2 증가
                  0.01;                                 // 야간에 SO2 감소

    let no2Base = (hour >= 7 && hour < 19) ? 0.03 :     // 차량 운행이 많은 낮에 NO2 증가
                  0.01;                                 // 야간에 NO2 감소

    let o3Base = (hour >= 10 && hour < 16) ? 0.05 :     // 태양광 강한 낮 시간에 O3 증가
                 (hour >= 16 && hour < 20) ? 0.03 : 0.01; // 저녁과 밤에는 감소

    let coBase = (hour >= 5 && hour < 22) ? 0.4 : 0.2;  // 대부분 시간 CO 증가

    let vocsBase = (hour >= 6 && hour < 18) ? 0.005 :   // 낮 시간에 VOCs 증가
                   0.002;                               // 밤에 VOCs 감소

    let h2sBase = (hour >= 7 && hour < 20) ? 0.01 :     // 주간에 H2S 증가
                  0.005;                                // 야간에 감소

    let nh3Base = (hour >= 6 && hour < 18) ? 8 : 5;     // 낮에 NH3 증가, 밤에 감소

    let ouBase = (hour >= 6 && hour < 18) ? 0.005 :     // 낮에 악취 증가
                 0.002;                                 // 밤에 악취 감소

    let hchoBase = (hour >= 10 && hour < 16) ? 0.15 :   // 낮 시간에 HCHO 증가
                   0.1;                                 // 그 외 시간에 감소

    let winspBase = (hour >= 6 && hour < 18) ? 2.0 :    // 낮에 풍속 증가
                    1.0;                                // 밤에는 풍속 감소

    let battBase = (hour >= 0 && hour < 24) ? 12.0 : 12.0; // 배터리는 크게 변하지 않음
    
    // 데이터 생성 (기본값에 랜덤 변동 추가)
    return {
        type: 'air',
        DEV_ID: devId,
        PM10: parseFloat((pm10Base + (Math.random() * 10)).toFixed(1)), // PM10 변동
        PM25: parseFloat((pm25Base + (Math.random() * 5)).toFixed(1)),  // PM2.5 변동
        SO2: parseFloat((so2Base + (Math.random() * 0.01)).toFixed(3)), // SO2 변동
        NO2: parseFloat((no2Base + (Math.random() * 0.01)).toFixed(3)), // NO2 변동
        O3: parseFloat((o3Base + (Math.random() * 0.01)).toFixed(3)),   // O3 변동
        CO: parseFloat((coBase + (Math.random() * 0.1)).toFixed(3)),    // CO 변동
        VOCs: parseFloat((vocsBase + (Math.random() * 0.001)).toFixed(3)), // VOCs 변동
        H2S: parseFloat((h2sBase + (Math.random() * 0.005)).toFixed(3)), // H2S 변동
        NH3: parseFloat((nh3Base + (Math.random() * 5)).toFixed(1)),    // NH3 변동
        OU: parseFloat((ouBase + (Math.random() * 0.003)).toFixed(3)),  // OU 변동
        HCHO: parseFloat((hchoBase + (Math.random() * 0.05)).toFixed(3)), // HCHO 변동
        TEMP: parseFloat((tempBase + (Math.random() * 5)).toFixed(1)),  // TEMP 변동
        HUMI: parseFloat((humiBase + (Math.random() * 10)).toFixed(1)), // HUMI 변동
        WINsp: parseFloat((winspBase + (Math.random() * 1.0)).toFixed(1)), // WINsp 변동
        WINdir: parseFloat((Math.random() * 360).toFixed(1)),           // WINdir 변동 (랜덤)
        BATT: parseFloat((battBase + (Math.random() * 0.5)).toFixed(1)), // BATT 변동
        FIRM: "1.0.0", 
        SEND: parseInt(1)
    };
}

//<----------------------------------------------------------------해양

function generateTimeBasedDummyBuoyData(devId, hour) {
    // 시간대별 기준값 설정
    let tempBase = (hour >= 0 && hour < 6) ? 20 :        // 새벽에는 낮은 온도
                   (hour >= 6 && hour < 12) ? 23 :       // 아침에는 온도 상승
                   (hour >= 12 && hour < 16) ? 28 :      // 오후에 최고 온도
                   (hour >= 16 && hour < 20) ? 25 : 22;  // 저녁과 밤에는 온도 하락

    let doBase = (hour >= 0 && hour < 6) ? 6.0 :         // 새벽에는 높은 DO
                 (hour >= 6 && hour < 12) ? 5.5 :        // 아침에 DO 감소
                 (hour >= 12 && hour < 18) ? 4.5 : 5.0;  // 낮에는 DO 더 감소, 저녁에 증가

    let ecBase = (hour >= 0 && hour < 6) ? 32000 :       // 새벽에는 높은 EC
                 (hour >= 6 && hour < 12) ? 30000 :      // 아침에 EC 감소
                 (hour >= 12 && hour < 18) ? 29000 : 31000; // 낮에 EC 더 감소, 저녁에 상승

    let salinityBase = (hour >= 0 && hour < 6) ? 30.0 :  // 새벽에는 높은 염분
                       (hour >= 6 && hour < 12) ? 28.0 : // 아침에 염분 감소
                       (hour >= 12 && hour < 18) ? 26.0 : 29.0; // 낮에 염분 더 감소, 저녁에 상승

    let tdsBase = (hour >= 0 && hour < 6) ? 30000 :      // 새벽에는 높은 TDS
                  (hour >= 6 && hour < 12) ? 28000 :     // 아침에 TDS 감소
                  (hour >= 12 && hour < 18) ? 27000 : 29000; // 낮에 TDS 더 감소, 저녁에 상승

    let phBase = (hour >= 0 && hour < 6) ? 7.5 :         // 새벽에는 중성 pH
                 (hour >= 6 && hour < 12) ? 7.0 :        // 아침에 pH 감소
                 (hour >= 12 && hour < 18) ? 6.8 : 7.2;  // 낮에 pH 더 감소, 저녁에 상승

    let orpBase = (hour >= 0 && hour < 6) ? 300 :        // 새벽에는 높은 ORP
                  (hour >= 6 && hour < 12) ? 270 :       // 아침에 ORP 감소
                  (hour >= 12 && hour < 18) ? 250 : 280; // 낮에 ORP 더 감소, 저녁에 상승

    let batteryBase = (hour >= 0 && hour < 24) ? 70.0 : 70.0;

    // 데이터 생성 (기본값에 랜덤 변동 추가)
    return {
        type: 'buoy',
        bouy_info_bouy_code: devId.toString(),
        bouy_state: {
            battery: (batteryBase + Math.random() * 20).toFixed(3) 
        },
        bouy_sensor_value: {
            temp: (tempBase + Math.random() * 2).toFixed(3),        
            DO: (doBase + Math.random() * 0.5).toFixed(3),        
            EC: (ecBase + Math.random() * 1000).toFixed(),          
            salinity: (salinityBase + Math.random() * 2).toFixed(2), 
            TDS: (tdsBase + Math.random() * 1000).toFixed(),        
            pH: (phBase + Math.random() * 0.2).toFixed(2),          
            ORP: (orpBase + Math.random() * 50).toFixed()           
        }
    };
}



//<----------------------------------------------------------------선박 
let vesselState = {}; // 각 선박의 상태를 저장하는 객체

function formatDateToYYYYMMDDHHMMSS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function generateDummyVesselData(devId) {
    let currentDate = new Date();

    // devId에 대한 상태가 없으면 초기화 (구룡포 해안을 기준으로 설정)
    if (!vesselState[devId]) {
        vesselState[devId] = {
            lati: 35.995 + (Math.random() * 0.01), // 구룡포 해안 근처 위도
            longi: 129.564 + (Math.random() * 0.01), // 구룡포 해안 근처 경도
            speed: 2 + Math.random() * 10, // 초기 속도 (2 ~ 12 km/h)
            course: Math.floor(Math.random() * 360), // 초기 방향 (0 ~ 360도)
        };
    }

    let state = vesselState[devId];

    // 속도에 따라 위치 변경 
    const speedFactor = state.speed / 1000; // 속도를 반영한 이동량 계산
    state.lati += speedFactor * Math.cos((state.course * Math.PI) / 180); // 위도 이동
    state.longi += speedFactor * Math.sin((state.course * Math.PI) / 180); // 경도 이동

    // 속도와 방향 변경 
    state.speed += (Math.random() * 2 - 1); // 속도 변화 (-1 ~ +1 km/h)
    state.speed = Math.max(2, Math.min(12, state.speed)); // 속도를 2 ~ 12로 제한
    state.course += (Math.random() * 10 - 5); // 방향 변경 (-5 ~ +5도)
    state.course = (state.course + 360) % 360; // 0 ~ 360도로 유지

    return {
        type: 'vessel',
        id: devId,
        log_datetime: formatDateToYYYYMMDDHHMMSS(currentDate),
        rcv_datetime: formatDateToYYYYMMDDHHMMSS(currentDate),
        lati: state.lati.toFixed(3), 
        longi: state.longi.toFixed(3), 
        speed: state.speed.toFixed(2), 
        course: state.course.toFixed(0), 
        azimuth: (50 + Math.floor(Math.random() * 10)).toFixed(0) 
    };
}
