const WebSocket = require('ws');

// WebSocket 서버에 연결
const ws = new WebSocket('ws://192.168.0.232:5000');

// 연결이 열리면 메시지를 보내는 함수
ws.on('open', () => {
    console.log('Connected to WebSocket server');

setInterval(() => {
    const currentHour = new Date().getHours(); // 현재 시간에 맞춰 데이터 생성

    // Air 데이터 생성 (1 ~ 5번 devId)
    for (let devId = 1; devId <= 5; devId++) {
        const airData = generateTimeBasedDummyAirData(devId, currentHour);
        ws.send(JSON.stringify(airData));
    }

    console.log(`Sent Air data to WebSocket server for Hour ${currentHour}`);
}, 60000); // 1분마다 데이터 전송

    // 1분마다 Buoy 데이터를 생성하여 서버로 전송
    setInterval(() => {
        // Buoy 데이터 생성 (1 ~ 2번 devId)
        for (let devId = 1; devId <= 2; devId++) {
            const buoyData = generateDummyBuoyData(devId);
            ws.send(JSON.stringify(buoyData));
        }

        console.log('Sent Buoy data to WebSocket server');
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

// 시간에 따라 변화하는 대기 데이터를 생성하는 함수
function generateTimeBasedDummyAirData(devId, hour) {
    let pm10Base = hour >= 6 && hour <= 18 ? 40 : 20; // 낮에는 PM10이 더 높음
    let pm25Base = hour >= 6 && hour <= 18 ? 25 : 15; // 낮에 PM2.5 증가
    let tempBase = hour >= 12 && hour <= 16 ? 30 : 20; // 오후에 온도 상승
    let humiBase = hour >= 6 && hour <= 18 ? 50 : 70;  // 밤에 습도 상승

    return {
        type: 'air',
        DEV_ID: devId,
        PM10: parseFloat((pm10Base + (Math.random() * 10)).toFixed(1)), // 10의 변동폭
        PM25: parseFloat((pm25Base + (Math.random() * 5)).toFixed(1)),  // 5의 변동폭
        SO2: parseFloat((0.01 + (Math.random() * 0.02)).toFixed(3)), // 0.01~0.03
        NO2: parseFloat((0.01 + (Math.random() * 0.02)).toFixed(3)), // 0.01~0.03
        O3: parseFloat((0.02 + (Math.random() * 0.03)).toFixed(3)),  // 0.02~0.05
        CO: parseFloat((0.3 + (Math.random() * 0.2)).toFixed(3)),    // 0.3~0.5
        VOCs: parseFloat((0.001 + (Math.random() * 0.01)).toFixed(3)), // 0.001~0.01
        H2S: parseFloat((0.001 + (Math.random() * 0.01)).toFixed(3)), // 0.001~0.01
        NH3: parseFloat((5 + (Math.random() * 5)).toFixed(1)), // 5~10
        OU: parseFloat((0.001 + (Math.random() * 0.01)).toFixed(3)), // 0.001~0.01
        HCHO: parseFloat((0.1 + (Math.random() * 0.05)).toFixed(3)), // 0.1~0.15 ppm
        TEMP: parseFloat((tempBase + (Math.random() * 5)).toFixed(1)), // 시간대에 따른 온도 변화 반영
        HUMI: parseFloat((humiBase + (Math.random() * 10)).toFixed(1)), // 시간대에 따른 습도 변화
        WINsp: parseFloat((1.5 + (Math.random() * 1.5)).toFixed(1)), // 1.5 ~ 3.0
        WINdir: parseFloat((Math.random() * 360).toFixed(1)), // 풍향 0~360
        BATT: parseFloat((12.0 + (Math.random() * 0.5)).toFixed(1)), // 12.0~12.5
        FIRM: "1.0.0", 
        SEND: parseInt(1)
    };
}

//<----------------------------------------------------------------해양

function generateDummyBuoyData(devId) {
    return {
        type: 'buoy',
        bouy_info_bouy_code: devId.toString(),
        bouy_state: {
            battery: (74.0 + Math.random() * 10).toFixed(3)
        },
        bouy_sensor_value: {
            temp: (25.0 + Math.random() * 5).toFixed(3),
            DO: (7.0 + Math.random() * 2).toFixed(3),
            EC: (32000 + Math.random() * 500).toFixed(),
            salinity: (30.0 + Math.random() * 5).toFixed(2),
            TDS: (29000 + Math.random() * 1000).toFixed(),
            pH: (7.0 + Math.random() * 2).toFixed(2),
            ORP: (300 + Math.random() * 50).toFixed()
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
