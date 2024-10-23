import mqtt_connector from "../functions/mqtt_connector.js"
import opcua from "../functions/opcua_connector.js"
import Instance from "../variable/Instance.js"
import { logger } from "../utils/winston.js"
import EventEmitter from "events"

const deviceEvent = new EventEmitter()

function StartGatheringData(res) {
  console.log(`Start Run / State : ${Instance.runState}`)

  //MQTT Client Start

  if (!Instance.runState) {
    for (let i = 0; i < Instance.arrayList.length; i++) {
      // console.log("a[" + i + "]=" + Instance.arrayList[i].ID);
      const DEV_ENDPOINT_URL = Instance.arrayList[i].DEV_ENDPOINT.split("@")[0]
      // 1=MQTT, 2=UART, 3=OPC-UA
      switch (Instance.arrayList[i].DEV_TYPE_ID) {
        case 1: // MQTT
          mqtt_connector.MQTT_RUN(
            DEV_ENDPOINT_URL,
            Instance.arrayList[i].DEV_NAME
          )
          break
        case 2: // UART
          break
        case 3: // OPC-UA
          opcua.startOPCUAClient(
            DEV_ENDPOINT_URL,
            Instance.arrayList[i].DEV_ENDPOINT.split("@")[1]
          )
          break
        case 4: // CCTV
          break
      }
    }
    res.status(200).send("실행성공.")
    Instance.runState = true
    logger.info(`START DEVICE`)
    deviceEvent.emit("deviceState", "장비 데이터 수집 시작.")
  } else {
    res.status(400).send("이미 실행중입니다.")
    logger.warn(`It is already working.`)
    deviceEvent.emit("deviceState", "이미 수집중입니다.")
  }
}

function StopGatheringData(res) {
  if (Instance.runState) {
    console.log("StopGatheringData")
    mqtt_connector.MQTT_STOP()
    opcua.stopOPCUAClient()
    Instance.runState = false
    res.status(200).send("중지성공.")
    logger.info(`STOP DEVICE`)
    deviceEvent.emit("deviceState", "장비 데이터 수집 종료.")
  } else {
    res.status(400).send(`작동중이 아닙니다..`)
    logger.warn(`It is not already working.`)
    deviceEvent.emit("deviceState", "수집중이 아닙니다.")
  }
}
module.exports = { StartGatheringData, StopGatheringData, deviceEvent }
