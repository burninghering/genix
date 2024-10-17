import mqtt from 'mqtt';
import db_manager from './db_manager.js';
import Instance from '../variable/Instance.js';
import ArrayList from 'arraylist';
import {logger} from '../utils/winston.js';

// 클라이언트들을 저장할 ArrayList
Instance.clients = new ArrayList();
// const checkInterval = 3000; // 1 seconds
const checkInterval = 3000; // 5 seconds

function findClientByEndpoint(endpoint) {
    // endpoint에 맞는 클라이언트 찾기
    return Instance.clients.find(client => client.endpoint === endpoint);
}

// URL 유효성검사
function isValidURL(url){
	var RegExp = /(mqtt):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

	if(RegExp.test(url)){
		return true;
	}else{
		return false;
	}
}

function MQTT_RUN(DEV_ENDPOINT, DEV_NAME) {
    // 이미 연결된 클라이언트인지 확인
    const existingClient = findClientByEndpoint(DEV_ENDPOINT);
    if (existingClient && existingClient.connected) {
        MQTT_SUBSCRIBE(existingClient, DEV_NAME); // 이미 연결된 클라이언트에 구독 설정
        return existingClient;
    }

    if(!isValidURL(DEV_ENDPOINT)){
        return;
    }

    // 새로운 클라이언트 생성 및 연결
    const client = mqtt.connect(DEV_ENDPOINT);

    client.topics = {};
    client.interval = null; // 인터벌을 클라이언트 객체에 추가

    client.on('connect', () => {
        client.endpoint = DEV_ENDPOINT; // 클라이언트 객체에 endpoint 속성 추가
        Instance.clients.add(client); // 클라이언트를 연결 완료 후에 ArrayList에 추가
        MQTT_SUBSCRIBE(client, DEV_NAME); // 클라이언트 연결 후 구독 설정
    });

    client.on("message", (topic, message) => {
        const msg = message.toString();
        const msgArr = msg.split('/');
        if (msgArr.length !== 6) {
            return;
        }
        if(msgArr[2] == "0"){
            console.log("0 msg : "+msg);
            console.log("0 name : "+msgArr[3]);
        }
        const devid = msgArr[2];
        const sensors = msgArr[3].split(',');
        const sensorids = msgArr[4].split(',');
        const values = msgArr[5].split(',');

        client.topics[topic] = {
            lastReceived: Date.now(),
            devid,
        };

        for (let i = 0; i < sensors.length; i++) {
            db_manager.InsertData(devid, sensorids[i], values[i]);
        }
    });

    client.on('disconnect', () => {
        console.log("Disconnected from: " + DEV_ENDPOINT);
        client.unsubscribe("netro/" + DEV_NAME); // DEV_NAME에 맞는 topic 구독 해제
    });

    client.on('error', (error) => {
        console.error('MQTT client error:', error);
        logger.error(`MQTT Client Error : ${error}`);

    });

    // 매 1초마다 writeToDatabase 호출
    client.interval = setInterval(() => {
        const currentTime = Date.now();
        Object.keys(client.topics).forEach(topic => {
            const topicData = client.topics[topic];
            if (topicData) {
                const DEV_ID = topicData.devid;
                const timeSinceLastReceived = currentTime - topicData.lastReceived;
                const DEV_STATUS_ID = timeSinceLastReceived > checkInterval * 5 ? 2 : 1; // 5초 이상 데이터 없으면 2, 그렇지 않으면 1
                writeToDatabase(DEV_ID, DEV_STATUS_ID);
            }
        });
    }, checkInterval);

    return client; // 새로운 클라이언트 반환
}

function MQTT_SUBSCRIBE(client, DEV_NAME) {
    if (client && client.connected) {
        client.subscribe("netro/" + DEV_NAME); // DEV_NAME을 topic으로 사용
    } else {
    }
}

function MQTT_STOP() {
    Instance.clients.forEach(client => {
        clearInterval(client.interval); // setInterval 해제
        if (client !== null) {
            Object.keys(client.topics).forEach(topic => {
                const topicData = client.topics[topic];
                if (topicData) {
                    const DEV_ID = topicData.devid;
                    writeToDatabase(DEV_ID, 2); // 모든 DEV_STATUS_ID를 2로 설정
                }
            });
            client.end();
        }
    });
    Instance.clients.clear(); // ArrayList clear method
}

// 데이터베이스에 기록하는 함수
function writeToDatabase(DEV_ID, DEV_STATUS_ID) {
    //console.log("topicData.devid : " + DEV_ID + " / STATE : " + DEV_STATUS_ID);
    db_manager.InsertState(DEV_ID, DEV_STATUS_ID);
}

module.exports = { MQTT_RUN, MQTT_SUBSCRIBE, MQTT_STOP };
