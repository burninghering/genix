import db_manager from './db_manager.js';


// 대기 데이터 처리 함수
export async function handleAirData(data) {
    const { DEV_ID, PM10, PM25, SO2, NO2, O3, CO, VOCs, H2S, NH3, OU, HCHO, TEMP, HUMI, WINsp, WINdir, BATT, FIRM, SEND } = data;
    const sensorNames = ['PM10', 'PM25', 'SO2', 'NO2', 'O3', 'CO', 'VOCs', 'H2S', 'NH3', 'OU', 'HCHO', 'TEMP', 'HUMI', 'WINsp', 'WINdir', 'BATT', 'FIRM', 'SEND'];
    const sensorValues = [PM10, PM25, SO2, NO2, O3, CO, VOCs, H2S, NH3, OU, HCHO, TEMP, HUMI, WINsp, WINdir, BATT, FIRM, SEND];

    try {
        for (let i = 0; i < sensorNames.length; i++) {
            await db_manager.SaveDummyData(DEV_ID, i + 1, sensorNames[i]);
            await db_manager.SaveAirLogData(DEV_ID, i + 1, sensorValues[i]);
        }
    } catch (error) {
        console.error("Error handling air data:", error);
        throw error;
    }
}

// 해양 데이터 처리 함수
export async function handleBuoyData(data) {
    const { bouy_info_bouy_code, bouy_state, bouy_sensor_value } = data;
    const sensorNames = ['battery', 'temp', 'DO', 'EC', 'salinity', 'TDS', 'pH', 'ORP'];
    const sensorValues = [bouy_state.battery, bouy_sensor_value.temp, bouy_sensor_value.DO, bouy_sensor_value.EC, bouy_sensor_value.salinity, bouy_sensor_value.TDS, bouy_sensor_value.pH, bouy_sensor_value.ORP];

    try {
        for (let i = 0; i < sensorNames.length; i++) {
            await db_manager.SaveOceanSysSensor(bouy_info_bouy_code, i + 1, sensorNames[i]);
            await db_manager.SaveOceanLogData(bouy_info_bouy_code, i + 1, sensorValues[i]);
        }
    } catch (error) {
        console.error("Error handling buoy data:", error);
        throw error;
    }
}

// 선박 데이터 처리 함수
export async function handleVesselData(data) {
    const { id, rcv_datetime, lati, longi, speed, course, azimuth } = data;
    const sensorNames = ['rcv_datetime', 'lati', 'longi', 'speed', 'course', 'azimuth'];
    const sensorValues = [rcv_datetime, lati, longi, speed, course, azimuth];

    try {
        for (let i = 0; i < sensorNames.length; i++) {
            const sensorValue = sensorValues[i] === undefined ? null : sensorValues[i]; // undefined 값을 null로 변환
            await db_manager.SaveVesselSysSensor(id, i + 1, sensorNames[i]);
            await db_manager.SaveVesselLogData(id, i + 1, sensorValue);
        }
    } catch (error) {
        console.error("Error handling vessel data:", error);
        throw error;
    }
}

module.exports = { handleAirData, handleBuoyData, handleVesselData };