// socketUtils.js
import { io } from 'socket.io-client';
import Instance from '../Variable/Instance';

let socket;

export const initializeSocket = (updateCallback, mode) => {
    if (!socket) {
        socket = io(Instance.SVR_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
            timeout: 20000,
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection Error:', error);
        });
    }
    
    // 콜백을 모드에 맞게 설정
    switch (mode) {
        case 'realtimeData':
            socket.on('resRealData', (msg) => {
                const realDatas = Array.isArray(msg) ? msg.map((deviceRTdata, index) => {
                    const { log_datetime, SEN_NAME, SEN_VALUE } = deviceRTdata;
                    return {
                        index: index + 1,
                        time: log_datetime,
                        name: SEN_NAME,
                        value: SEN_VALUE,
                    };
                }) : [];
                if (updateCallback) {
                    updateCallback(realDatas);
                }
                Instance.Realdata = realDatas;
            });
            return true;
        case 'sensorState':
            socket.on('sensorState', (msg) => {
                // console.log("msg ",msg)

                const statusArray = msg.split(',').map(status => {
                    switch (status) {
                        case '1': return 'ON';
                        case '2': return 'OFF';
                        default: return 'Unknown';
                    }
                });
                if (updateCallback) {
                    updateCallback(statusArray);
                }
                Instance.DeviceState = statusArray;
            });
            return true;
        case 'systemLog':
            socket.on('systemLog', (log) => {
                if (updateCallback) {
                    updateCallback(log);
                }
                Instance.log = log;
            });
            return true;
        default:
            return true;
    }
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const BroadcastMSG = (topic, msg) => {
    if (socket) {
        socket.emit(topic, msg);
    }
};

export default socket;
