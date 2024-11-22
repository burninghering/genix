import chalk from 'chalk';
import { AttributeIds, OPCUAClient, TimestampsToReturn } from 'node-opcua';
import db_manager from './db_manager.js';
import Instance from '../variable/Instance.js';
import {logger} from '../utils/winston.js';

let opcuaClients = []; // OPC-UA 클라이언트 배열
const uniqueDevids = new Set(); // Set to track unique devids
// URL 유효성검사
function isValidURL(url){
	var RegExp = /(opc.tcp):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

	if(RegExp.test(url)){
		return true;
	}else{
		return false;
	}
}

async function createOPCUAClient(DEV_EndpointURL, nodeIdToMonitor) {
  try {
    const client = OPCUAClient.create({endpointMustExist: false,});

    // client.on("backoff", (retry, delay) => {
    //   console.log("Retrying to connect to ", DEV_EndpointURL, " attempt ", retry);
    // });


    console.log("Connecting to ", chalk.cyan(DEV_EndpointURL));
    await client.connect(DEV_EndpointURL);
    console.log("Connected to ", chalk.cyan(DEV_EndpointURL));

    const session = await client.createSession();
    console.log("Session created".yellow);

    const subscription = await session.createSubscription2({requestedPublishingInterval: 250,
      requestedMaxKeepAliveCount: 50,
      requestedLifetimeCount: 6000,
      maxNotificationsPerPublish: 1000,
      publishingEnabled: true,
      priority: 10,});

    subscription
      .on("keepalive", () => {
        console.log("Keepalive");
      })
      .on("terminated", () => {
        console.log("Subscription terminated");
      })
      .on("started", () => {
        console.log("Subscription started");
      });

    const itemToMonitor = {nodeId: nodeIdToMonitor,
      attributeId: AttributeIds.Value,};

    const parameters = {samplingInterval: 100,
      discardOldest: true,
      queueSize: 10,};

    const monitoredItem = await subscription.monitor(
      itemToMonitor,
      parameters,
      TimestampsToReturn.Both
    );

    const processedDevids = new Set();

    monitoredItem.on("changed", (dataValue) => {
      //  console.log('data:' + chalk.green(dataValue.value.value.toString()));
      const valueArr = dataValue.value.value.toString().split('/');
      
      const devid = valueArr[2];
      const sensorids = valueArr[3].split(',');
      const values = valueArr[4].split(',');
      
      
      // Add the devid to the uniqueDevids set
      uniqueDevids.add(devid);
      
      for (let i = 0; i < sensorids.length; i++) {
        db_manager.InsertData(devid, sensorids[i], values[i]);

        //console.log(`devID : ${devid} / senID : ${sensorids[i]}`);
      }
      
      // Check if the devid has been processed in the last 3 seconds
      if (!processedDevids.has(devid)) {
        // Call writeToDatabase for each devid with DEV_STATUS_ID set to 1
        writeToDatabase(devid, 1);
        
        // Add devid to the processed set
        processedDevids.add(devid);
        
        // Remove the devid from the set after 3 seconds
        setTimeout(() => {
          processedDevids.delete(devid);
        }, 3000);
      }
    });

    const opcuaClient = {client,
      session,
      subscription,
      DEV_EndpointURL,};

    opcuaClients.push(opcuaClient); // 클라이언트 배열에 추가
  } catch (err) {
    console.error(chalk.bgRed.white(`Error creating OPC-UA client for ${DEV_EndpointURL}: ${err.message}`));
    logger.error(`Error creating OPC-UA client for ${DEV_EndpointURL}: ${err.message}`);

    throw err; // 예외를 상위로 전파
  }
}

//#region Start OPC-UA
async function startOPCUAClient(DEV_EndpointURL, nodeIdToMonitor) {
  try {
    const existingClient = opcuaClients.find(client => client.DEV_EndpointURL === DEV_EndpointURL);
    if (existingClient) {
      console.log(`OPC-UA client for ${DEV_EndpointURL} already exists.`);
      return;
    }
    if(!isValidURL(DEV_EndpointURL)){
      return;
  }
    await createOPCUAClient(DEV_EndpointURL, nodeIdToMonitor);
    console.log(`OPC-UA client started for ${DEV_EndpointURL}`);
  } catch (err) {
    console.error(chalk.bgRed.white(`Error starting OPC-UA client for ${DEV_EndpointURL}: ${err.message}`));
    logger.error(`Error starting OPC-UA client for ${DEV_EndpointURL}: ${err.message}`);

  }
}
//#endregion

//#region  Stop OPC-UA
async function stopOPCUAClient() {
  try {
    for (const { subscription, session, client } of opcuaClients) {
      if (subscription) {
        await subscription.terminate();
        console.log(`Subscription terminated for ${client.endpointUrl}`);
      }
      if (session) {
        await session.close();
        console.log(`Session closed for ${client.endpointUrl}`);
      }
      if (client && client.isConnected) {
        console.log(`Disconnecting from ${client.endpointUrl}`);
        await client.disconnect();
        console.log(`Disconnected from ${client.endpointUrl}`);
      }
    }

    // Call writeToDatabase for each unique devid with DEV_STATUS_ID set to 2
    uniqueDevids.forEach(devid => {
      writeToDatabase(devid, 2);
    });

    opcuaClients = []; // 클라이언트 배열 초기화
  } catch (err) {
    console.error(chalk.bgRed.white(`Error stopping OPC-UA clients: ${err.message}`));
    logger.error(`Error stopping OPC-UA clients: ${err.message}`);

    throw err; // 예외를 상위로 전파
  }
}
//#endregion

function writeToDatabase(DEV_ID, DEV_STATUS_ID) {
  // console.log(`DEV_ID : ${DEV_ID} / DEV_STATUS : ${DEV_STATUS_ID}`);
  db_manager.InsertState(DEV_ID, DEV_STATUS_ID);
}

module.exports = { startOPCUAClient, stopOPCUAClient };
