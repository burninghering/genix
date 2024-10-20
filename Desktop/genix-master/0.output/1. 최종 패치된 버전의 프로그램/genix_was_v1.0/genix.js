import express from "express";
import cors from "cors";
import socketio from "socket.io";
import bodyParser from "body-parser";
import r_login from './routes/r_login.js';
import r_device from './routes/r_device.js';
import r_user from './routes/r_user.js';
import r_api from './routes/r_api.js';
import http from "http";
import https from 'https';

import cron from 'node-cron';
import socketScript from './functions/socket.js';
import {BroadcastMSG, SendClientMSG} from './functions/socketEmit.js';

import db_manager from './functions/db_manager.js';
import {deviceEvent} from './functions/device_dispenser.js';
import { addListener } from "process";
import Instance from './variable/Instance.js';
import { getSystemErrorMap } from "util";
import fs, { fstat } from "fs";
import { morganMiddleware } from "./utils/morganMiddleware.js";
import {logger} from "./utils/winston.js";
//const r_user = require('./routes/r_user');
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(morganMiddleware);
const option = {
    // key: fs.readFileSync("./KEY/key.pem"),
    // cert: fs.readFileSync("./KEY/cert.pem"),
    key: fs.readFileSync("./KEY/temp/server.key"),
    cert: fs.readFileSync("./KEY/temp/server.crt"),
    ca: fs.readFileSync("./KEY/temp/server.csr"),
    secureOptions: require('constants').SSL_OP_NO_SSLv2 | require('constants').SSL_OP_NO_SSLv3 | require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1,
}

app.use(cors({
    // origin: "http://localhost:3000",
    credentials: true,
    origin: ['https://192.168.0.231'],//'http://localhost:3000', // React 앱이 호스팅되는 주소
    exposedHeaders: ['AccessToken','RefreshToken','UserID','Accesstoken' , 'Refreshtoken','Userid'] // 노출할 헤더 추가
    
}));
const httpServer = https.createServer(option, app);

app.use('/login',r_login);
app.use('/device',r_device);
app.use('/user',r_user);
app.use('/api',r_api);

//#region Socket.IO
const io = socketio(httpServer, {
    cors: {
        origin: "*",
    },
});
db_manager.InitializingState();

socketScript.socketHandler(io);

cron.schedule('* * * * * * *', () => {
    db_manager.GetDeviceState();
    //db_manager.GetRealtimeData();
    BroadcastMSG(io,'runState',Instance.runState);
    
    //socketScript.BroadcastMSG(io,'systemLog',`SystemLog Random1 : ${Math.floor(Math.random() * 10)}\nSystemLog Random2 : ${Math.floor(Math.random() * 10)}` );
});

// cron.schedule('* * * * * * *', () => {
//     db_manager.GetRealtimeData();
//     socketScript.BroadcastMSG(io,'runState',Instance.runState);
//});

// Send DeviceState
db_manager.netroEvent.addListener('sensorState', (result) => {
    BroadcastMSG(io,'sensorState',result);
});
//#endregion

// Send Device Realtime Data
// db_manager.netroEvent.addListener('realtimeData',(result)=>{
//     BroadcastMSG(io,'realtimeData',result);
// });
deviceEvent.addListener('deviceState', (result)=>{
    BroadcastMSG(io,'systemLog',result);
});

db_manager.InitializingState();
process.on('exit', code =>{
    db_manager.InitializingState();
    console.log(`exit code : ${code}`);

    if(code !== 0) {
        logger.error({
            exitCode: code,
            message: "I'm gone",
            timestamp: new Date(),
        });
    }

});


httpServer.listen(port, function() {
    console.log('Socket IO server listening on port ' + port);
    logger.info(`genix : Socket IO server listening on port ${port}`);
}); 


//socketScript.BroadcastMSG(io,'systemLog', '');