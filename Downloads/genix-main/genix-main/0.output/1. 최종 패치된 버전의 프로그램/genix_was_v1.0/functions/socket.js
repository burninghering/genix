import {GetRealtimeData} from './db_manager.js';
var clientList = [];
const socketHandler =(io)  => {
    io.on('connection', (socket) => {
        // socket.on('message', (msg) => {
        //     console.log('Message received:', msg);
        //     io.emit('message', msg); // 모든 클라이언트에 메시지 전송
        // });

        // socket.on('disconnect', () => {
        //     console.log('A user disconnected');
        // });
        clientList.push(socket);
        socket.on('reqRealData',async (msg)=>{
            await GetRealtimeData(msg,socket);
        });
    });
    io.on('disconnect', (socket)=>{
        for(let i = 0; i < clientList.length; i++) {
            if (clientList[i] === socket) {
                clientList.splice(i, 1);
            }
        }
    })
};

// const BroadcastMSG = (io, topic, msg) => {
//     io.emit(topic, msg);
// }



module.exports = { socketHandler, clientList };


