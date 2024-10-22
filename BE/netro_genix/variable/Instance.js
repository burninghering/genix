import ArrayList from 'arraylist';
import crypto from 'crypto';

var arrayList = [];
var userList = [];
var clients = new ArrayList();
const nodeIdToMonitor = "ns=1;s=Temperature";
var runState = false;

var systemLog = '';


//영어 숫자로만 된 8~16 글자
const idPattern = /^[A-Za-z0-9]{8,16}$/;
//영어,특수문자,숫자가 최소 1개 이상 포함된 8~15글자
const pwPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
const spacePattern = /\s/;
const duplicationPattern = /(.+?)\1{2,}/;
const nicknamePattern = /^[ㄱ-ㅎ가-힣a-zA-Z0-9]{2,16}$/;
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  
//#region 연속된 문자 체크 함수
async function consecutiveLetterCheck(data) {
    var cnt = 0;
    var cnt2 = 0;
    var tmp = '';
    var tmp2 = '';
    var tmp3 = '';
    for (var i = 0; i < data.length; i++) {
        // charAt(): 문자값 반환
        tmp = data.charAt(i);
        tmp2 = data.charAt(i + 1);
        tmp3 = data.charAt(i + 2);

        // charCodeAt(): 유니코드값 반환
        if (tmp.charCodeAt(0) - tmp2.charCodeAt(0) === 1 && tmp2.charCodeAt(0) - tmp3.charCodeAt(0) === 1) {
            cnt = cnt + 1;
        }
        if (tmp.charCodeAt(0) - tmp2.charCodeAt(0) === -1 && tmp2.charCodeAt(0) - tmp3.charCodeAt(0) === -1) {
            cnt2 = cnt2 + 1;
        }
    }
    if (cnt > 0 || cnt2 > 0) {
        //연속된 문자 3개 이상
        return false;
    } else {
        return true;
    }

}
//#endregion

//#region 로그인 패턴 확인 함수
async function accountCheck(id, pw) {
    if (idPattern.test(id) && pwPattern.test(pw)) {
        if (!spacePattern.test(id) && !spacePattern.test(pw)) {
            if (!duplicationPattern.test(id) && !duplicationPattern.test(pw)) {
                if (await consecutiveLetterCheck(id) && await consecutiveLetterCheck(pw)) {
                    return true;
                } else {
                    //연속된 문자 3개 이상
                    console.log('연속된 문자 3개 이상');
                    return false;
                }
            } else {
                //같은 문자 3개 이상
                console.log('같은 문자 3개 이상');
                return false;
            }
        } else {
            //공백 확인
            console.log('공백');
            console.log(`ID:${id}/PW:${pw}`);
            return false;
        }
    } else {
        //ID,PW 패턴이 안 맞을경우
        console.log('ID, PW 패턴이 맞지않습니다.');
        return false;
    }
}

async function nickNameCheck(nickname) {
    if (!spacePattern.test(nickname)) { // 공백 체크 공백 들어가면 false 안들어가면 true
        if (nicknamePattern.test(nickname)) {   
            return true;
        }
        else {
            console.log("닉네임 패턴 틀림.");
            return false;
        }
    }
    {
        console.log("닉네임이 비었습니다.");
        return false;
    }
}

async function IDCheck(ID) {
    console.log(`ID : ${ID}`);
    if (!spacePattern.test(ID)) { // 공백 체크 공백 들어가면 false 안들어가면 true
        if (idPattern.test(ID)) {   
            if(!duplicationPattern.test(ID)){
                if(await consecutiveLetterCheck(ID)){
                    return true;
                }
                else{
                    console.log('같은 패턴입니다.');
                    return false;
                }
            }
            else{
                console.log('같은문자가 3개 이상입니다.');
                return false;
            }
        }
        else {
            console.log("아이디 패턴 틀림.");
            return false;
        }
    }
    {
        console.log("아이디가 비었습니다.");
        return false;
    }
}

async function PWCheck(PW) {
    console.log(`PW : ${PW}`);
    if (!spacePattern.test(PW)) { // 공백 체크 공백 들어가면 false 안들어가면 true
        if (pwPattern.test(PW)) {
            // console.log("성공")
            return true;
        }
        else {
            console.log("패스워드 패턴 다름")
            return false;
        }
    }
    else{
        console.log("공백")
        return false;
    }
}
//#endregion


const successResponse = (code, data) =>{
    return({
      code: code,
      data: data,
    })
  }
  
  const failResponse = (code, message) =>{
    return({
      code: code,
      message: message,
    })
  }
  

module.exports = {clients, arrayList, userList, nodeIdToMonitor, runState, systemLog, accountCheck, nickNameCheck, IDCheck, PWCheck, successResponse, failResponse, publicKey, privateKey};