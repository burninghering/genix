const express = require("express");
const { WebSocketServer } = require("ws");
const { saveVesselDataToDB, SaveVesselLogData } = require("./db_connector"); // 필요한 데이터베이스 저장 함수 가져오기

// Express 서버와 WebSocket 서버 설정
const app = express();
 
const server = require("http").createServer(app);
 

const wssReceive = new WebSocketServer({ server });
const wssSender = new WebSocketServer({ port: 8085 });

let vesselDataCache = new Map();

let lastValidTimestamp = null; // 마지막으로 확인된 유효한 타임스탬프 저장

let allDataReceived = false;

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);


wssReceive.on("connection", (ws) => {
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      // 데이터 검증 및 캐시에 저장
      if (validateVesselData(data)) {
        // 새 데이터거나 rcv_datetime이 변경된 경우에만 업데이트
        if (
          !vesselDataCache.has(data.id) ||
          vesselDataCache.get(data.id).rcv_datetime !== data.rcv_datetime
        ) {
          if (!vesselDataCache.has(data.id)) {
            // 새 데이터 추가
            vesselDataCache.set(data.id, data);
            console.log(`ID ${data.id} 데이터 수신 완료. 현재 캐시 크기: ${vesselDataCache.size}`);
          } else if (vesselDataCache.get(data.id).rcv_datetime !== data.rcv_datetime) {
            // 기존 데이터와 다른 데이터로 갱신
            vesselDataCache.set(data.id, data);
            // console.log(`ID ${data.id} 데이터 갱신 완료.`);
          }
          
        }

        // 50개의 데이터가 모두 수신된 경우에만 타임스탬프 확인
        if (vesselDataCache.size === 50) {
          const timestamps = Array.from(vesselDataCache.values()).map(
            (item) => item.rcv_datetime
          );
          const uniqueTimestamps = new Set(timestamps);

          if (uniqueTimestamps.size === 1) {
            allDataReceived = true;
            lastValidTimestamp = Array.from(uniqueTimestamps)[0];
            console.log(`✅ 50개의 데이터가 동일한 타임스탬프(${lastValidTimestamp})로 수신되었습니다.`);
          } else {
            // 50개 데이터가 도달한 후에만 경고 메시지 출력
            if (allDataReceived === false) {
              console.warn(
                `⚠️ 데이터 타임스탬프 불일치. 고유 타임스탬프 개수: ${uniqueTimestamps.size}, 타임스탬프: ${Array.from(uniqueTimestamps)}`
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("메시지 처리 중 오류 발생:", error);
    }
  });
});

wssSender.on("connection", (ws) => {
  const interval = setInterval(() => {
    if (!allDataReceived) {
      console.warn("⚠️ 모든 데이터가 수신되지 않았습니다. 전송 대기 중.");
      return;
    }

    const vesselDataCopy = Array.from(vesselDataCache.values());
    const timestamps = vesselDataCopy.map((data) => data.rcv_datetime);
    const uniqueTimestamps = new Set(timestamps);

    if (uniqueTimestamps.size === 1) {
      const currentTimestamp = Array.from(uniqueTimestamps)[0];

      if (currentTimestamp === lastValidTimestamp) {
        // 데이터를 전체 전송
        sendAllData(ws, vesselDataCopy);
        console.log(
          `✅ 50개의 데이터를 클라이언트로 전송했습니다. 타임스탬프: ${currentTimestamp}`
        );
      } else {
        console.warn("⚠️ 전송하지 않음: 새로운 유효한 타임스탬프가 확인되지 않았습니다.");
      }
    } else {
      console.warn("⚠️ 데이터의 타임스탬프가 다릅니다. 전송 대기 중.");
    }
  }, 1000);

  ws.on("close", () => clearInterval(interval));
});

// 전체 데이터를 전송하는 함수
function sendAllData(ws, vesselData) {
  try {
    ws.send(
      JSON.stringify({
        vesselData: vesselData.map((data) => ({
          id: data.id,
          log_datetime: data.log_datetime,
          rcv_datetime: data.rcv_datetime,
          lati: data.lati.toString(),
          longi: data.longi.toString(),
          speed: data.speed,
          course: data.course,
          azimuth: data.azimuth.toString(),
        })),
      }),
      (err) => {
        if (err) {
          console.error(`데이터 전송 중 오류 발생:`, err.message);
        } else {
          console.log(`✅ 데이터를 성공적으로 전송했습니다.`);
        }
      }
    );
  } catch (error) {
    console.error("데이터 전송 중 오류 발생:", error.message);
    ws.send(
      JSON.stringify({ error: "데이터 전송 중 오류가 발생했습니다." })
    );
  }
}




// 데이터 청크를 분할하고 전송하는 함수
function splitAndSendData(ws, vesselData) {
  try {
    const totalChunks = Math.ceil(vesselData.length / 10); // 청크 개수 계산
    const chunkSize = Math.ceil(vesselData.length / totalChunks); // 각 청크의 크기

    for (let i = 0; i < totalChunks; i++) {
      const chunk = vesselData.slice(i * chunkSize, (i + 1) * chunkSize);

      // 현재 서버 시간을 ISO 형식으로 가져오기
      const sendDatetime = new Date().toISOString();

      ws.send(
        JSON.stringify({
          topic: i + 1,
          data: chunk,
          send_datetime: sendDatetime, // 전송 시점의 서버 시간 추가
        }),
        (err) => {
          if (err) {
            console.error(`토픽 ${i + 1} 데이터 전송 중 오류 발생:`, err.message);
          } else {
            console.log(`✅ 토픽 ${i + 1} 데이터를 성공적으로 전송했습니다. 전송 시간: ${sendDatetime}`);
          }
        }
      );
    }
  } catch (error) {
    console.error("데이터 분할 및 전송 중 오류 발생:", error.message);
    ws.send(
      JSON.stringify({ error: "데이터 분할 및 전송 중 오류가 발생했습니다." })
    );
  }
}
 
// 1초마다 캐시 데이터를 데이터베이스에 저장
setInterval(async () => {
  if (vesselDataCache.size === 0) {
    return;
  }

  for (const [id, data] of vesselDataCache) {
    try {
      await handleVesselData(data); // 새로운 데이터 처리 함수 호출
    } catch (error) {
      console.error(`Vessel ID ${id} 데이터 저장 중 오류 발생:`, error);
    }
  }
}, 1000);
 

// 데이터 유효성 검증 함수
function validateVesselData(data) {
  const requiredFields = [
    "id",
    "log_datetime",
    "rcv_datetime",
    "lati",
    "longi",
    "speed",
    "course",
    "azimuth",
  ];
  for (let field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      console.error(`필드 ${field}가 유효하지 않습니다:`, data);
      return false;
    }
  }
  return true;
}

// 새로운 데이터 처리 함수
async function handleVesselData(data) {
  if (!data.id) {
    console.error("Received vessel data with null id:", data);
    throw new Error("Invalid vessel id: id cannot be null or undefined.");
  }

  const { id, log_datetime, rcv_datetime, lati, longi, speed, course, azimuth } =
    data;

  const sensorNames = [
    "rcv_datetime",
    "lati",
    "longi",
    "speed",
    "course",
    "azimuth",
  ];
  const sensorValues = [rcv_datetime, lati, longi, speed, course, azimuth];

  const savePromises = sensorNames.map(async (sensorName, index) => {
    const sensorValue =
      sensorValues[index] === undefined ? null : sensorValues[index];
    if (sensorValue !== null) {
      try {
        await SaveVesselLogData(id, index + 1, sensorValue, log_datetime);
      } catch (error) {
        console.error(
          `Error saving vessel data for sensor ${sensorName}:`,
          error
        );
      }
    } else {
      console.warn(
        `Skipping save for sensor ${sensorName} as sensorValue is null for vessel id=${id}`
      );
    }
  });

  await Promise.all(savePromises);
}



// HTTP 서버 시작
const PORT = 6005;
server.listen(PORT, () => {
  console.log(`dummy_client_vessel 서버가 ${PORT} 포트에서 실행 중입니다`);
});

 

console.log("Broadcast WebSocket server is running on port 8082");
module.exports = vesselDataCache;
