const express = require("express");
const { WebSocketServer } = require("ws");
const db_manager = require("./db_manager.js");

const router = express.Router();

// 연결된 모든 클라이언트를 저장할 배열
let clients = [];

// 웹소켓 연결 처리 및 서버 설정
function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('Client connected');
        clients.push(ws);

        ws.on('close', () => {
            console.log('Client disconnected');
            clients = clients.filter(client => client !== ws);
        });
    });
}

// 데이터를 클라이언트로 전송하는 함수
function broadcast(data) {
    clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// 더미 데이터를 생성하는 함수들 (공기 데이터, 부표 데이터, 선박 데이터)
function generateDummyData(devId) {
    return {
        DEV_ID: devId,
        PM10: parseFloat(21.1),
        PM25: parseFloat(1.7),
        SO2: parseFloat(0.003),
        NO2: parseFloat(0.011),
        O3: parseFloat(0.042),
        CO: parseFloat(0.301),
        VOCs: parseFloat(0.001),
        H2S: parseFloat(0.201),
        NH3: parseFloat(11.031),
        OU: parseFloat(0.001),
        HCHO: parseFloat(0.1),
        TEMP: parseFloat(24.2),
        HUMI: parseFloat(80.5),
        WINsp: parseFloat(3.381),
        WINdir: parseFloat(28.2),
        BATT: parseFloat(12.5),
        FIRM: "1.0.0", 
        SEND: parseInt(0)
    };
}

function generateDummyBuoyData(devId) {
    return {
        bouy_info_bouy_code: devId.toString(),
        bouy_state: {
            battery: 74.4
        },
        bouy_sensor_value: {
            temp: 25.6,
            DO: 7.34,
            EC: 32500,
            salinity: 32.53,
            TDS: 29930,
            pH: 8.15,
            ORP: 320
        }
    };
}

function generateDummyVesselData(devId) {
    return {
        id: devId,
        latitude: (35.98601 + (devId - 8) * 0.01).toFixed(3),
        longitude: (129.564329 + (devId - 8) * 0.01).toFixed(3),
        speed: 4 + (devId % 5),
        heading: (350.5 + (devId * 10)) % 360
    };
}

// 주기적으로 더미 데이터를 생성하고 저장하는 함수
async function generateAndSaveDummyData() {
    try {
        // 공기 데이터 생성 및 저장
        for (let devId = 1; devId <= 5; devId++) {
            let dummyData = generateDummyData(devId);
            const sensorNames = [
                'PM10', 'PM25', 'SO2', 'NO2', 'O3',
                'CO', 'VOCs', 'H2S', 'NH3', 'OU',
                'HCHO', 'TEMP', 'HUMI', 'WINsp', 'WINdir',
                'BATT', 'FIRM', 'SEND'
            ];

            for (let i = 0; i < sensorNames.length; i++) {
                const sensorName = sensorNames[i];
                const sensorValue = dummyData[sensorName];
                await db_manager.SaveDummyData(devId, i + 1, sensorName, sensorValue);
                await db_manager.SaveAirLogData(devId, i + 1, sensorValue);
            }

            // 웹소켓을 통해 클라이언트로 더미 데이터를 전송
            broadcast(dummyData);
        }

        // 부표 데이터 생성 및 저장
        for (let devId = 6; devId <= 7; devId++) {
            let dummyBuoyData = generateDummyBuoyData(devId - 5);

            const buoySensorNames = ['battery', 'temp', 'DO', 'EC', 'salinity', 'TDS', 'pH', 'ORP'];

            for (let i = 0; i < buoySensorNames.length; i++) {
                const SEN_ID = i + 1;
                const SEN_NAME = buoySensorNames[i];
                const sensorValue = (SEN_ID === 1) ? dummyBuoyData.bouy_state.battery : dummyBuoyData.bouy_sensor_value[SEN_NAME];

                await db_manager.SaveOceanSysSensor(devId, SEN_ID, SEN_NAME);
                await db_manager.SaveOceanLogData(devId, SEN_ID, sensorValue);
            }

            // 부표 데이터를 전송
            broadcast(dummyBuoyData);
        }

        // 선박 데이터 생성 및 저장
        for (let devId = 8; devId <= 17; devId++) {
            let dummyVesselData = generateDummyVesselData(devId);
            const vesselSensorNames = ['latitude', 'longitude', 'speed', 'heading'];

            for (let i = 0; i < vesselSensorNames.length; i++) {
                const SEN_ID = i + 1;
                const sensorName = vesselSensorNames[i];
                const sensorValue = dummyVesselData[sensorName];

                await db_manager.SaveVesselSysSensor(devId, SEN_ID, sensorName);
                await db_manager.SaveVesselLogData(devId, SEN_ID, sensorValue);
            }

            // 선박 데이터를 전송
            broadcast(dummyVesselData);
        }

    } catch (error) {
        console.error('Error generating and saving dummy data:', error);
    }
}

// 더미 데이터를 주기적으로 생성 (10초마다)
setInterval(generateAndSaveDummyData, 10000);

module.exports = { router, setupWebSocket };
