import express from "express";
import db_manager from '../functions/db_manager.js';
// import mqtt_connector from '../functions/mqtt_connector.js';
// import opcua from '../functions/opcua_connector.js';
import device_dispenser from '../functions/device_dispenser.js';
import { logger } from "../utils/winston.js";

var router = express.Router();

router.post('/', function (req, res) {
    db_manager.GetDevice(res);
});

router.post('/run', function (req, res) {
    console.log("run");
    device_dispenser.StartGatheringData(res);
});

router.post('/stop', function (req, res) {
    console.log("stop");
    device_dispenser.StopGatheringData(res);
});

router.post('/addDevice', function (req, res) {
    console.log("add");
    var DEV_TYPE_ID = req.body.DEV_TYPE_ID;
    var DEV_NAME = req.body.DEV_NAME;
    var DEV_DETAIL = req.body.DEV_DETAIL;
    var SEN_CNT = req.body.SEN_CNT;
    var LOC_LATI = req.body.LOC_LATI;
    var LOC_LONG = req.body.LOC_LONG;
    var LOC_ADDR = req.body.LOC_ADDR;
    var DEV_ENDPOINT = req.body.DEV_ENDPOINT;
    if(DEV_TYPE_ID===''||DEV_NAME==='' || DEV_DETAIL==='' || SEN_CNT === '' || DEV_ENDPOINT==='')
    {
        logger.warn('ADD PROPERTIES IS NULL');
        res.status(400).send('입력값이 올바르게 입력되지 않았습니다.');
    }
    else{
        db_manager.AddDevice(DEV_TYPE_ID, DEV_NAME, DEV_DETAIL, SEN_CNT, LOC_LATI, LOC_LONG, LOC_ADDR,DEV_ENDPOINT, res);

    }
});

router.post('/deleteDevice', function (req, res) {
    
    var DEV_ID = req.body.DEV_ID;
    console.log(`Delete: ${DEV_ID}` );
    db_manager.DeleteDevice(DEV_ID, res);
});

router.post('/modifyDevice', function (req, res) {
    var dev_type = null;
    switch(req.body.DEV_TYPE_ID)
    {
        case 'MQTT':
            dev_type = 1;
            break;
        case 'UART':
            dev_type = 2;
            break;
        case 'OPC-UA':
            dev_type = 3;
            break;
        default:
            dev_type = 0;
    }
    
    var DEV_TYPE_ID = dev_type;//req.body.DEV_TYPE_ID;
    var DEV_NAME = req.body.DEV_NAME;
    var DEV_DETAIL = req.body.DEV_DETAIL;
    var SEN_CNT = req.body.SEN_CNT;
    var LOC_LATI = req.body.LOC_LATI;
    var LOC_LONG = req.body.LOC_LONG;
    var LOC_ADDR = req.body.LOC_ADDR;
    var DEV_ENDPOINT = req.body.DEV_ENDPOINT;
    var DEV_ID = req.body.DEV_ID;

    db_manager.ModifyDevice(DEV_TYPE_ID, DEV_NAME, DEV_DETAIL, SEN_CNT, LOC_LATI, LOC_LONG, LOC_ADDR, DEV_ENDPOINT ,DEV_ID, res);
});

router.post('/getRealData', function (req, res) {
    var DEV_ID = req.body.DEV_ID;
    db_manager.GetRealtimeData_POST(DEV_ID,res);
});

router.post('/getSensor', function (req, res) {
    var DEV_ID = req.body.DEV_ID;
    db_manager.GetSensor(DEV_ID, res);
});

router.post('/insertSensor', async function (req, res) {
    const jsonArray = req.body;
    if (Array.isArray(jsonArray)) {
        try {
            for (const item of jsonArray) {
                const DEV_ID = item.DEV_ID;
                const SEN_ID = item.SEN_ID;
                const SEN_NAME = item.SEN_NAME;
                await db_manager.InsertSensor(DEV_ID, SEN_ID, SEN_NAME, res);
            }
            res.status(200).send(`success`);

        }
        catch (error) {
            res.status(500).send("insertSensor Fail");
            logger.error(`insertSensor : `,error);
        }
    }
    else{
        res.status(400).send("insertSensor : 유효한 JSON이 아닙니다.");
    }
});

router.post('/updateSensor', async function (req, res) {
    const jsonArray = req.body;

    if (Array.isArray(jsonArray)) {
        try {
            await db_manager.DeleteSensor(jsonArray[0].DEV_ID);
            console.log('')
            for (const item of jsonArray) {
                const DEV_ID = item.DEV_ID;
                const SEN_ID = item.SEN_ID;
                const SEN_NAME = item.SEN_NAME;

                await db_manager.InsertSensor(DEV_ID, SEN_ID, SEN_NAME, res);
            }
            res.status(200).send(`success`);
        }
        catch (error) {
            res.status(500).send(`updateSensor Fail`);
            logger.error(`updateSensor : `,error);

        }
    }
    else{
        res.status(400).send("updateSensor : 유효한 JSON이 아닙니다.");
    }
   
    // var MODIFY_SEN_ID = req.body.MODIFY_SEN_ID;
    // var MODIFY_SEN_NAME = req.body.MODIFY_SEN_NAME;
    // var DEV_ID = req.body.DEV_ID;
    // var SEN_ID = req.body.SEN_ID;
    // db_manager.UpdateSensor(MODIFY_SEN_ID, MODIFY_SEN_NAME, DEV_ID, SEN_ID, res);
});

module.exports = router;