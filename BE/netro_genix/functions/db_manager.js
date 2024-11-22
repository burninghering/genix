//import mysql from 'mysql';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import EventEmitter from 'events';
import Instance from '../variable/Instance.js';
import { json } from 'express';
import jwt from 'jsonwebtoken';
import TokenUtils from '../utils/tokenUtils';
import util from 'util';
import { BroadcastMSG, SendClientMSG } from './socketEmit.js';
import { logger } from '../utils/winston.js';

// import { l } from 'node-opcua';

const JWT_KEY = process.env.ACCESS_TOKEN_SECRET;
//import { turn } from 'core-js/core/array';

var dbhost = '192.168.0.225';
// var dbhost = 'localhost';
var dbport = 3306;
var dbuser = 'root';
var dbpwd = 'netro9888!';
// var dbpwd = 'Netro9888!';
var dbname = 'netro_data_platform';

//#region 새로운 mysql2
const pool = mysql.createPool({
    host: dbhost,
    port: dbport,
    user: dbuser,
    password: dbpwd,
    database: dbname,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    maxPreparedStatements: 10 // Adjust as necessary
});

//#endregion
const netroEvent = new EventEmitter();
var cnt;

//#region Encryption
function GenerateSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
}

function EncryptionString(str, salt) {
    const hash = crypto.createHash('sha256').update(str + salt).digest('base64');
    return hash;
}

function DecryptionString(str) {
    // 암호문을 Buffer로 변환
    const encryptedBuffer = Buffer.from(str, 'base64');

    // 개인 키로 복호화
    const decrypted = crypto.privateDecrypt(
        {
            key: Instance.privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        encryptedBuffer
    );

    // 복호화된 데이터를 문자열로 변환
    const decryptedText = decrypted.toString('utf8');
    return decryptedText;
}

function generateRSAKeys() {

}


//#endregion



async function DBConnection(query, values) {

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows, fields] = await connection.execute(query, values);

        // const [preparedStatement, fields] = await connection.prepare(query);
        // const [rows, resultFields] = await preparedStatement.execute(values);
        return rows;
    } catch (err) {
        logger.error(`db_manager : ${err}`);
        throw err;
    } finally {
        if (connection) {

            await connection.release();
        }
        // if(pool){
        //     pool.end();
        // }

    }
}
//#region  mysql2

//#endregion
//#region LOGIN
// Login
async function Login(userID, userPW, res) {
    const decryptPW = DecryptionString(userPW);
    // console.log(`userID ${userID} / userPW : ${decryptPW}`);
    if (await Instance.accountCheck(userID, decryptPW)) {
        var query = `select * from tb_sys_user where BINARY(login_id) = ?`;// + mysql.escape(userID) + ";"
        var values = [userID];
        try {
            const result = await DBConnection(query, values)
            // console.log(` result : ${result}`);

            if (result == "null" || result == 0 || result === null || result === 'null') {
                res.status(400).send('login_fail');
                //console.log("result: " + result);
                return;
            } else {
                if (result.length > 0) {
                    if (await VerifyPassword(decryptPW, result[0].password, result[0].salt)) {
                        query = `INSERT INTO tb_log_user(log_datetime,login_id,state) VALUE(NOW(), ?, 'login');`;
                        values = [userID];
                        try {
                            await DBConnection(query, values);
                            logger.info(`db_manager : login Success : ${userID}`);
                            const accessToken = TokenUtils.makeToken({ id: userID });
                            const refreshToken = TokenUtils.makeRefreshToken();
                            await InsertToken(userID, refreshToken);

                            //console.log(`userID : ${userID}`);
                            res.setHeader('AccessToken', `${accessToken}`);
                            res.setHeader('RefreshToken', `${refreshToken}`);
                            res.setHeader('expired', `${Date.now()}`)
                            res.setHeader('UserID', `${userID}`);
                            res.send('login_success');
                        }
                        catch (e) {
                            logger.error(`db_manager : login Fail1 : ${userID} \n  ${e}`);
                            //res.status(500).send('login_fail');
                        }
                    }
                    else {
                        console.log("3");
                        logger.info(`db_manager : login Fail2 : ${userID}`);
                        res.status(401).send('login_fail');
                    }
                }
            }
        }
        catch (e) {
            logger.error(`db_manager : login Fail3 : ${userID} \n  ${e}`);
            res.stauts(500).send("login_fail");
        }
    }
    else {
        res.status(401).send("login_fail")
        logger.info(`db_manager : login Fail : ${userID}`);
    }

}

async function InsertToken(userID, token) {
    var query = `UPDATE tb_sys_user SET token=? WHERE login_id=?;`
    var values = [token, userID]
    try {
        await DBConnection(query, values);
    }
    catch (e) {
        console.log(`InsertToken`, e);
        logger.error(`db_manager : InsertToken : ${userID} \n  ${e}`);
    }
}

async function RefreshToken(userID, token) {
    var query = `select token from tb_sys_user where BINARY(login_id)=?;`
    var values = [userID];
    try {
        const result = await DBConnection(query, values);//DBConnectionAsync(query);
        if (token === result[0].token) {
            try {
                const { exp } = jwt.verify(token, JWT_KEY);
                return true;
            }
            catch (e) {
                console.log('RefreshToken', e);
                logger.error(`db_manager : RefreshToken : ${userID} \n  ${e}`);
                return false;
            }
        }
        else {
            false;
        }
    }
    catch (e) {
        console.log(`RefreshToken`, e);
        logger.error(`db_manager : RefreshToken : ${userID} \n  ${e}`);
    }
    // console.log(result);
    // return result;
}

async function CheckDBToken(userID) {
    var query = `select token from tb_sys_user where BINARY(login_id)=?;`
    var values = [userID];
    try {
        const result = await DBConnection(query, values);//DBConnectionAsync(query);
        if (token === result[0].token) {
            try {
                const { exp } = jwt.verify(token, JWT_KEY);
                return true;
            }
            catch (e) {
                console.log('CheckDBToken', e);
                logger.error(`db_manager : CheckDBToken : ${userID} \n  ${e}`);
                return false;
            }
        }
        else {
            false;
        }
    }
    catch (e) {
        console.log(`RefreshToken`, e);
        logger.error(`db_manager : CheckDBToken : ${userID} \n  ${e}`);
    }
}

// VerifyPassword
async function VerifyPassword(userPW, dbPW, salt) {

    const encPW = EncryptionString(userPW, salt);
    if (encPW === dbPW) {
        return true;
    }
    else {
        return false;
    }
}

async function Logout(userID, res) {
    try {
        var query = `INSERT INTO tb_log_user(log_datetime,login_id,state) VALUE(NOW(), ?, 'logout');`;;
        var values = [userID];

        await DBConnection(query, values);
        res.status(200).send(`logout_success`);
    }
    catch (e) {
        console.log(e);
        logger.error(`db_manager : Logout : ${userID} \n  ${e}`);
        res.status(400).send(`logout_fail`);
    }

}

//#endregion

//#region USER
async function GetUserList(res) {
    var query = "SELECT login_id, nickname, role FROM tb_sys_user;";
    var values = [];
    const result = await DBConnection(query, values);
    if (result == "null" || result == 0 || result === null || result === 'null') {
        res.status(500).send();
        return;
    } else {
        if (result.length > 0) {
            res.status(200).send(result);
            Instance.userList = result.map(row => ({
                LOGIN_ID: row.login_id,
                NICKNAME: row.nickname,
            }));
        }
        else {
            res.status(204).send("No Contents");
        }
    }
}

// ADD USER
async function RegistUSER(U_ID, U_PW, U_NN, U_ROLE, res) {
    var existUser = true;
    var query = `SELECT * FROM tb_sys_user WHERE BINARY(login_id)=?;`;
    var values = [U_ID];

    try {
        const result = await DBConnection(query, values)
        if (result == 0) {
            existUser = false;
            var salt = GenerateSalt();
            const encPW = EncryptionString(U_PW, salt);
            query = `INSERT INTO tb_sys_user(login_id, nickname, password, role, salt) VALUE(?, ?, ?, ?, ?);`;
            var values = [U_ID, U_NN, encPW, U_ROLE, salt];

            const rst = await DBConnection(query, values);
            res.status(200).send("SUCCESS");
        }
        else {
            existUser = true;
            res.status(400).send("이미 존재하는 ID입니다.");
        }
    }
    catch (e) {
        console.log(`RegistUSER`, e);
        logger.error(`db_manager : RegistUSER : ${U_ID} \n  ${e}`);
        res.status(500).send("RegistUSER Error");
    }
}

async function CheckDuplication(U_ID, res) {
    var query = `SELECT * FROM tb_sys_user WHERE BINARY(login_id)=?;`;
    var values = [U_ID];

    if (Instance.IDCheck(U_ID)) {
        try {
            const result = await DBConnection(query, values)
            if (result == 0) {
                res.status(200).send('사용하실 수 있는 ID입니다.');
            }
            else {
                res.status(400).send("이미 존재하는 ID입니다.");
            }
        }
        catch (e) {
            console.log(`CheckDuplication`, e);
            logger.error(`db_manager : CheckDuplication : ${U_ID} \n  ${e}`);
            res.status(500).send('fail');
        }
    }
    else {
        res.status(400).send(`ID 패턴이 틀렸습니다.`)
    }
}

// MODIFY MY INFO
async function ModifyMyInfo(U_ID, U_CUR_PW, U_NEW_PW, U_NN, res) {
    //VerifyPassword(userPW, result[0].password, result[0].salt)
    if (await Instance.IDCheck(U_ID)) {
        var existNewPW = false;
        if (U_NEW_PW === '') {
            existNewPW = false;
        }
        else {
            existNewPW = true;
            if (await Instance.PWCheck(U_NEW_PW)) {
                existNewPW = false;
            }
        }
        if (!existNewPW) {
            var query = `SELECT * FROM tb_sys_user WHERE BINARY(login_id)=?;`;
            var values = [U_ID];

            try {
                const result = await DBConnection(query, values);
                if (result == 0) {
                    res.status(400).send("아이디가 존재하지 않습니다.")
                }
                else {
                    if (VerifyPassword(U_CUR_PW, result[0].password, result[0].salt)) {
                        if (U_NEW_PW == "") {
                            if (U_NN == "") {
                                console.log("1query : " + query);
                                res.status(400).send("변경점이 없습니다.");
                            }
                            else {
                                query = `UPDATE tb_sys_user SET nickname=? WHERE login_id=?;`;
                                values = [U_NN, U_ID];
                                try {
                                    await DBConnection(query, values);
                                    res.status(200).send("MODIFY SUCCESS");
                                }
                                catch (e) {
                                    console.log(`ModifyMyInfo_NickName`, e);
                                    logger.error(`db_manager : ModifyMyInfo_NickName : ${U_ID} \n  ${e}`);
                                    res.status(500).send("MODIFY FAIL");

                                }
                            }
                        }
                        else {
                            var salt = GenerateSalt();
                            const encPW = EncryptionString(U_NEW_PW, salt);
                            if (U_NN == "") {
                                query = `UPDATE tb_sys_user SET password=?, salt=? WHERE login_id=?;`;
                                values = [encPW, salt, U_ID]
                                try {
                                    await DBConnection(query, values);
                                    res.status(200).send("MODIFY SUCCESS");
                                }
                                catch (e) {
                                    console.log(`ModifyMyInfo_PW`, e);
                                    logger.error(`db_manager : ModifyMyInfo_PW : ${U_ID} \n  ${e}`);
                                    res.status(500).send("MODIFY FAIL");

                                }
                            }
                            else {
                                query = `UPDATE tb_sys_user SET password=?, salt=?, nickname=? WHERE login_id=?;`;
                                values = [encPW, salt, U_NN, U_ID]
                                try {
                                    await DBConnection(query, values);
                                    res.status(200).send("MODIFY SUCCESS");
                                }
                                catch (e) {
                                    console.log(`ModifyMyInfo_All`, e)
                                    logger.error(`db_manager : ModifyMyInfo_All : ${U_ID} \n  ${e}`);
                                    res.status(500).send("MODIFY FAIL");

                                }
                            }
                        }
                    }
                    else {
                        res.status(401).send("현재 암호가 틀립니다.");
                    }
                }
            }
            catch (e) {
                console.log(`ModifyMyInfo`, e);
                logger.error(`db_manager : ModifyMyInfo : ${U_ID} \n  ${e}`);
                res.status(500).send(error);

            }
        }
        else {
            res.status(400).send(`패스워드 유효성검사 실패`);
        }
    }
    else {
        res.status(400).send(`아이디 유효성검사 실패`);
    }
}

// DELETE USER
async function DeleteUser(U_ID, res) {
    var query = `DELETE FROM tb_sys_user WHERE login_id=?;`;
    var values = [U_ID];

    // DBConnection(query, function (error, result) {
    //     if (error) {
    //         // console.log("ModifyDevice error : " + error);
    //         res.status(400).send(`DELETE FAIL`);
    //     }
    //     else {
    //         res.status(200).send(`DELETE SUCCESS`);
    //     }
    // });

    try {
        const rsesult = await DBConnection(query, values)
        res.status(200).send(`DELETE SUCCESS`);
    }
    catch (e) {
        console.log(`DeleteUser`, e);
        logger.error(`db_manager : DeleteUser : ${U_ID} \n  ${e}`);
        res.status(500).send(`DELETE FAIL`);
    }
}

async function ChangePassword(U_ID, U_PW, res) {
    // TODO UPDATE

    if (Instance.PWCheck(U_PW)) {
        const salt = GenerateSalt();
        var encpw = EncryptionString(U_PW, salt);

        var query = `UPDATE tb_sys_user SET password=?, salt=? WHERE login_id=?;`;
        var values = [encpw, salt, U_ID];

        try {
            await DBConnection(query, values)
            res.status(200).send(`CHANGE SUCCESS`);
        }
        catch (e) {
            console.log(`ChangePassword`, e)
            logger.error(`db_manager : ChangePassword : ${U_ID} \n  ${e}`);
            res.status(500).send(`fail`);
        }
    }
    else {
        res.status(400).send(`CHANGE FAIL`);
    }
}

// MODIFY ROLE USER
async function ModifyRole(U_ID, ROLE, res) {
    var update_role;
    switch (ROLE)        //관리자 : 1, 사용자 : 2
    {
        case "관리자": //관리자일 때 사용자로 변경
            update_role = 2;
            break;
        case "사용자": //사용자일 때 사용자로 변경
            update_role = 1;
            break;
        default:
            update_role = 2;
            break;
    }
    var query = `UPDATE tb_sys_user SET role=? WHERE login_id=?;`;
    var values = [update_role, U_ID];

    // DBConnection(query, function (error, result) {
    //     if (error) {
    //         // console.log("ModifyDevice error : " + error);
    //         res.status(500).send(`fail`);
    //     }
    //     else {
    //         res.status(200).send(`success`);
    //     }
    // });

    try {
        await DBConnection(query, values);
        res.status(200).send(`success`);
    }
    catch (e) {
        console.log(`ModifyRole`, e);
        logger.error(`db_manager : ModifyRole : ${U_ID} \n  ${e}`);
        res.status(500).send(`fail`);
    }
}
//#endregion

//#region DEVICE
// GetDevices
async function GetDevice(res) {
    var query = "SELECT (SELECT count(ID) FROM tb_sys_device ORDER BY ID) cnt, ID, DEV_TYPE_ID, DEV_NAME, DEV_DETAIL, SEN_CNT, LOC_LATI, LOC_LONG, LOC_ADDR, DEV_ENDPOINT FROM tb_sys_device ORDER BY ID;";
    var values = [];

    // console.log("GetDevice");
    // DBConnection(query, function (error, result) {
    //     if (result == "null" || result == null || result === null || result === 'null') {
    //         res.status(500).send(error);
    //         return;
    //     } else {
    //         if (result.length > 0) {

    //             res.status(200).send(result);
    //             Instance.arrayList = result.map(row => ({
    //                 ID: row.ID,
    //                 DEV_TYPE_ID: row.DEV_TYPE_ID,
    //                 DEV_NAME: row.DEV_NAME,
    //                 DEV_DETAIL: row.DEV_DETAIL,
    //                 SEN_CNT: row.SEN_CNT,
    //                 LOC_LATI: row.LOC_LATI,
    //                 LOC_LONG: row.LOC_LONG,
    //                 LOC_ADDR: row.LOC_ADDR,
    //                 DEV_STATUS_ID: row.DEV_STATUS_ID,
    //                 DEV_ENDPOINT: row.DEV_ENDPOINT
    //             }));
    //             // for (let i = 0; i < Instance.arrayList.length; i++) {
    //             //     console.log("[" + i + "] = " + Instance.arrayList[i]);
    //             // }
    //         }
    //         else {
    //             res.status(204).send("No Contents");
    //         }
    //     }
    // });

    try {
        const result = await DBConnection(query, values)
        if (result == "null" || result == 0 || result === null || result === 'null') {
            res.status(500).send(error);
            return;
        } else {
            if (result.length > 0) {

                res.status(200).send(result);
                Instance.arrayList = result.map(row => ({
                    ID: row.ID,
                    DEV_TYPE_ID: row.DEV_TYPE_ID,
                    DEV_NAME: row.DEV_NAME,
                    DEV_DETAIL: row.DEV_DETAIL,
                    SEN_CNT: row.SEN_CNT,
                    LOC_LATI: row.LOC_LATI,
                    LOC_LONG: row.LOC_LONG,
                    LOC_ADDR: row.LOC_ADDR,
                    DEV_STATUS_ID: row.DEV_STATUS_ID,
                    DEV_ENDPOINT: row.DEV_ENDPOINT
                }));
                // for (let i = 0; i < Instance.arrayList.length; i++) {
                //     console.log("[" + i + "] = " + Instance.arrayList[i]);
                // }
            }
            else {
                res.status(204).send("No Contents");
            }
        }
    }
    catch (e) {
        console.log(`GetDevice`, e);
        logger.error(`db_manager : GetDevice : ${e}`);
        res.status(500).send(`fail`);
    }
}

// Insert Data
async function InsertData(DEV_ID, SEN_ID, SEN_VALUE) {
    var query = `CALL PROC_INSERT_DATA(?, ?, ?);`;
    var values = [DEV_ID, SEN_ID, SEN_VALUE];

    try {
        await DBConnection(query, values)
    }
    catch (e) {
        console.log(`InsertData`, e);
        logger.error(`db_manager : InsertData : ${DEV_ID} \n  ${e}`);
    }
}

// Add Device
async function AddDevice(DEV_TYPE_ID, DEV_NAME, DEV_DETAIL, SEN_CNT, LOC_LATI, LOC_LONG, LOC_ADDR, DEV_ENDPOINT, res) {
    var query = `INSERT INTO tb_sys_device(DEV_TYPE_ID, DEV_NAME, DEV_DETAIL, SEN_CNT, LOC_LATI, LOC_LONG, LOC_ADDR, DEV_ENDPOINT) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    var values = [DEV_TYPE_ID, DEV_NAME, DEV_DETAIL, SEN_CNT, LOC_LATI, LOC_LONG, LOC_ADDR, DEV_ENDPOINT];

    try {
        await DBConnection(query, values);
        res.status(200).send("success");
    }
    catch (e) {
        console.log(`AddDevice`, e);
        logger.error(`db_manager : AddDevice : ${e}`);
        res.status(500).send(`fail`);
    }
}

// Delete Device
async function DeleteDevice(DEVICE_ID, res) {
    var query = `DELETE FROM tb_sys_device WHERE id IN (?);`;
    var values = [DEVICE_ID];
    try {
        await DBConnection(query, values);
        res.status(200).send('success');
    }
    catch (e) {
        console.log(`DeleteDevice`, e);
        logger.error(`db_manager : DeleteDevice : ${DEVICE_ID} \n  ${e}`);
        res.status(500).send("fail");

    }
}

// Modify Device
async function ModifyDevice(DEV_TYPE_ID, DEV_NAME, DEV_DETAIL, SEN_CNT, LOC_LATI, LOC_LONG, LOC_ADDR, DEV_ENDPOINT, DEVICE_ID, res) {
    var query = `UPDATE tb_sys_device SET DEV_TYPE_ID = ?, DEV_NAME = ?, DEV_DETAIL = ?, SEN_CNT = ?, LOC_LATI = ?, LOC_LONG = ?, LOC_ADDR = ?, DEV_ENDPOINT = ? WHERE ID = ?;`;
    var values = [DEV_TYPE_ID, DEV_NAME, DEV_DETAIL, SEN_CNT, LOC_LATI, LOC_LONG, LOC_ADDR, DEV_ENDPOINT, DEVICE_ID];
    try {
        await DBConnection(query, values);
        res.status(200).send(`success`);
    }
    catch (e) {
        console.log(`ModifyDevice`, e);
        logger.error(`db_manager : ModifyDevice : ${DEVICE_ID} \n  ${e}`);
        res.status(500).send(`fail`);
    }
}

async function InsertState(DEV_ID, DEV_STATUS_ID) {
    //var query = "INSERT INTO tb_log_dev(LOG_DATETIME, DEV_ID, DEV_STATUS_ID) VALUES (NOW()," + DEV_ID + "," + DEV_STATUS_ID + ");";
    var query = `CALL PROC_INSERT_STATUS(?, ?);`;
    var values = [DEV_ID, DEV_STATUS_ID];
    // console.log('query :' + query);
    try {
        await DBConnection(query, values);
    }
    catch (e) {

        console.log(`InsertState`, e);
        logger.error(`db_manager : InsertState : ${DEV_ID} \n  ${e}`);
    }
}


async function InitializingState() {
    console.log("INITIALIZING DEVICE STATE");
    //var query = "INSERT INTO tb_log_dev(LOG_DATETIME, DEV_ID, DEV_STATUS_ID) VALUES (NOW()," + DEV_ID + "," + DEV_STATUS_ID + ");";
    var query = "SELECT (SELECT count(ID) FROM tb_sys_device ORDER BY ID) cnt, ID, DEV_TYPE_ID, DEV_NAME, DEV_DETAIL, SEN_CNT, LOC_LATI, LOC_LONG, LOC_ADDR, DEV_ENDPOINT FROM tb_sys_device ORDER BY ID;";
    var values = [];

    try {
        var result = await DBConnection(query, values);
        if (result == "null" || result == 0 || result === null || result === 'null') {
            return;
        } else {
            if (result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    var initQuery = `CALL PROC_INSERT_STATUS(?, ?);`;
                    var DEV_ID = result[i].ID
                    var DEV_STATUS_ID = 2;
                    var initValue = [DEV_ID, DEV_STATUS_ID];
                    try {
                        await DBConnection(initQuery, initValue);
                    }
                    catch (e) {

                        console.log(`InitializingState`, e);
                        logger.error(`db_manager : InitializingState : ${DEV_ID} \n  ${e}`);
                    }
                }
            }
            else {
            }
        }

    }
    catch (e) {

        console.log(`InsertState`, e);
        logger.error(`db_manager : InsertState : ${DEV_ID} \n  ${e}`);
    }
}


// SocketIO Update Device State
async function GetDeviceState() {
    //console.log("GetDeviceState");
    // const query = "WITH RankedData AS (SELECT t1.DEV_ID, t1.DEV_STATUS_ID, ROW_NUMBER() OVER (PARTITION BY t1.DEV_ID ORDER BY t1.DEV_STATUS_ID DESC) AS rn FROM tb_log_dev t1 WHERE (DEV_ID, log_datetime) IN (SELECT DEV_ID, MAX(log_datetime) AS log_datetime FROM tb_log_dev GROUP BY DEV_ID)) SELECT DEV_ID, DEV_STATUS_ID FROM RankedData WHERE rn = 1 ORDER BY DEV_ID ASC;";
    //const query = "SELECT t1.log_datetime, t1.DEV_ID, t1.DEV_STATUS_ID FROM tb_log_dev t1 JOIN (SELECT DEV_ID, MAX(log_datetime) AS max_log_datetime FROM tb_log_dev GROUP BY DEV_ID) t2 ON t1.DEV_ID = t2.DEV_ID AND t1.log_datetime = t2.max_log_datetime WHERE (t1.DEV_ID, t1.log_datetime, t1.DEV_STATUS_ID) IN (SELECT DEV_ID, MAX(log_datetime) AS log_datetime, DEV_STATUS_ID FROM tb_log_dev WHERE (DEV_ID, log_datetime) IN (SELECT DEV_ID, MAX(log_datetime) AS log_datetime FROM tb_log_dev GROUP BY DEV_ID ) GROUP BY DEV_ID, DEV_STATUS_ID HAVING DEV_STATUS_ID = 2) ORDER BY t1.DEV_ID ASC;";
    //const query = 'SELECT * FROM tb_log_dev_latest ORDER BY DEV_ID ASC;';
    const query = `CALL PROC_LATEST_STATUS();`;
    var values = [];
    try {
        const result = await DBConnection(query, values);
        if (result == "null" || result == 0 || result === null || result === 'null') {
            console.log("GetDeviceState There is no result value.");
            return;
        } else {
            if (result.length > 0) {
                var list_state = "";

                for (let i = 0; i < result[0].length; i++) {
                    list_state += result[0][i].DEV_STATUS_ID + ",";
                }
//		console.log(`list_state : `, list_state);
                list_state = list_state.slice(0, -1);
                netroEvent.emit('sensorState', list_state);
            }
            else {
                console.log("GetDeviceState There is no result value.");
            }
        }
    }
    catch (e) {
        console.log(`GetDeviceState`, e)
        logger.error(`db_manager : GetDeviceState : ${e}`);
    }
}

var blankJson =
{
    log_datetime: '',
    DEV_ID: 0,
    SEN_ID: 0,
    SEN_NAME: '',
    SEN_VALUE: ''
};
// SocketIO Realtime Data
async function GetRealtimeData(DEV_ID, socket) {
    // console.log('GetRealtimeData ',DEV_ID);
    var query = `CALL PROC_LATEST_DEV_VALUE(?);`
    var values = [DEV_ID];
    try {
        const result = await DBConnection(query, values);
        //console.log(result[0]);
        if (result == "null" || result == 0 || result === null || result === 'null') {
            // console.log("1 : There is no result value.");
            console.log("data : ", blankJson);
            SendClientMSG(socket, 'resRealData', blankJson);
            return;
        } else {
            if (result[0].length > 0) {
                //console.log('result : ', result[0]);
                SendClientMSG(socket, 'resRealData', result[0]);
            }
            else {
                // console.log("2 : There is no result value.");
                console.log("data : ", blankJson);

                SendClientMSG(socket, 'resRealData', blankJson);
            }
        }
    }
    catch (e) {
        console.log(`GetRealtimeData_Socket`, e);
        logger.error(`db_manager : GetRealtimeData_Socket : ${DEV_ID} \n ${e}`);
        SendClientMSG(socket, 'resRealData', 'error');
    }
}

// REST POST Realtime Data
async function GetRealtimeData_POST(DEV_ID, res) {
    // const query = `WITH DistinctData AS (SELECT d.log_datetime, d.DEV_ID, d.SEN_ID, d.SEN_VALUE FROM tb_log_data d JOIN tb_sys_sensor s ON d.DEV_ID = s.DEV_ID AND d.SEN_ID = s.SEN_ID ORDER BY d.log_datetime DESC LIMIT 1000), RankedData AS (SELECT log_datetime, DEV_ID, SEN_ID, SEN_VALUE, DENSE_RANK() OVER (PARTITION BY DEV_ID, SEN_ID ORDER BY log_datetime DESC) AS rn FROM DistinctData) SELECT DISTINCT log_datetime, DEV_ID, SEN_ID, SEN_VALUE FROM RankedData WHERE rn <= 1 AND DEV_ID=${mysql2.escape(DEV_ID)} ORDER BY DEV_ID ASC, SEN_ID ASC, log_datetime DESC;`;
    //const query = `WITH DistinctData AS (SELECT d.log_datetime, d.DEV_ID, d.SEN_ID, s.SEN_NAME, d.SEN_VALUE from tb_log_data d JOIN tb_sys_sensor s ON d.DEV_ID = s.DEV_ID AND d.SEN_ID = s.SEN_ID ORDER BY d.log_datetime DESC LIMIT 1000), RankedData AS (SELECT log_datetime, DEV_ID, SEN_ID, SEN_NAME, SEN_VALUE, DENSE_RANK() OVER (PARTITION BY DEV_ID, SEN_ID ORDER BY log_datetime DESC) AS rn FROM DistinctData) SELECT DISTINCT log_datetime, DEV_ID, SEN_ID, SEN_NAME, SEN_VALUE FROM RankedData WHERE rn <= 1 AND DEV_ID=${mysql2.escape(DEV_ID)} ORDER BY DEV_ID ASC, SEN_ID ASC, log_datetime DESC;`;
    //console.log(`DEVID : ${DEV_ID}\nquery : ${query}`);

    //var query = `SELECT * FROM tb_log_data_latest WHERE DEV_ID=${mysql2.escape(DEV_ID)} ORDER BY SEN_ID ASC;`;
    var query = `CALL PROC_LATEST_DEV_VALUE(?);`
    var values = [DEV_ID];
    try {
        const result = await DBConnection(query, values);
        if (result == "null" || result == 0 || result === null || result === 'null') {
            console.log("There is no result value.");
            res.status(500).send(result);
            return;
        } else {
            //console.log(result[0][0].SEN_VALUE);
            if (result[0].length > 0) {
                res.status(200).send(result[0]);
            }
            else {
                console.log("There is no result value.");
                res.status(204).send('There is no result value.');
            }
        }
    }
    catch (e) {
        console.log(`GetRealtimeData_POST`, e);
        logger.error(`db_manager : GetRealtimeData_POST : ${DEV_ID} \n  ${e}`);
        res.status(500).send(e);
    }
}

async function GetSensor(DEV_ID, res) {
    var query = `SELECT DEV_ID, SEN_ID, sen_name as SEN_NAME FROM tb_sys_sensor WHERE DEV_ID=?;`;
    var values = [DEV_ID];
    // console.log('query :' + query);
    try {
        var result = await DBConnection(query, values);
        if (result == "null" || result == 0 || result === null || result === 'null') {
            res.status(204).send('No Contents');
            return;
        } else {
            if (result.length > 0) {

                res.status(200).send(result);
            }
            else {
                res.status(204).send("No Contents");
            }
        }
    }
    catch (e) {
        console.log(`GetSensor`, e);
        res.status(500).send(`fail`);
        logger.error(`db_manager : GetSensor : ${DEV_ID} \n  ${e}`);
    }
}

async function InsertSensor(DEV_ID, SEN_ID, SEN_NAME, res) {
    var query = `INSERT INTO tb_sys_sensor(DEV_ID, SEN_ID, sen_name) VALUES(?, ?, ?);`;
    var values = [DEV_ID, SEN_ID, SEN_NAME];
    // console.log('query :' + query);
    try {
        await DBConnection(query, values);
        //res.status(200).send(`success`);
    }
    catch (e) {
        console.log(`InsertSensor`, e);
       // res.status(500).send(`fail`);
        logger.error(`db_manager : InsertSensor : ${DEV_ID} \n  ${e}`);
    }
}

async function UpdateSensor(MODIFY_SEN_ID, MODIFY_SEN_NAME, DEV_ID, SEN_ID, res) {

    var query = `UPDATE tb_sys_sensor SET SEN_ID=?, sen_name=? WHERE DEV_ID=? AND SEN_ID=?;`;
    var values = [MODIFY_SEN_ID, MODIFY_SEN_NAME, DEV_ID, SEN_ID];
    // console.log('query :' + query);
    try {
        await DBConnection(query, values);
        //res.status(200).send(`success`);

    }
    catch (e) {
        console.log(`UpdateSensor`, e);
        //res.status(500).send(`fail`);
        logger.error(`db_manager : UpdateSensor : ${DEV_ID} \n  ${e}`);
    }
}

async function DeleteSensor(DEV_ID) {
    var query = `DELETE FROM tb_sys_sensor WHERE DEV_ID=?;`;
    var values = [DEV_ID];
    try {
        await DBConnection(query, values);
    }
    catch (e) {
        console.log(`DeleteSensor`, e);
        logger.error(`db_manager : DeleteSensor : ${DEV_ID} \n  ${e}`);
    }
}

//#endregion

module.exports = { netroEvent, Login, Logout, GetDevice, InsertData, GetDeviceState, AddDevice, DeleteDevice, ModifyDevice, InsertState, GetRealtimeData, GetUserList, RegistUSER, ModifyMyInfo, DeleteUser, ModifyRole, GetRealtimeData_POST, CheckDuplication, ChangePassword, RefreshToken, DecryptionString, InitializingState, GetSensor, InsertSensor, UpdateSensor,DeleteSensor };
