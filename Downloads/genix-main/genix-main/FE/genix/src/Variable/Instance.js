
var selectedID = null;
var SVR_URL = process.env.REACT_APP_SERVER_URL;//"https://192.168.0.231:3000";
// var SVR_URL =  "https://192.168.0.231:3000";
var loginstate  = false;

var mqttAll = 0;
var opcuaAll = 0;
var mqttRun = 0;
var opcuaRun = 0;

var selectedUserID = '123';
var selectedUserPW = '';
var selectedUserNickname = 'asd';

var myID = '정보없음';
var myNN = '정보없음';
var myRole = '정보없음';

var idInvalidMessage = '아이디는 8~16자의 영문자, 숫자, 특수문자 조합으로 입력하세요.';
var passwordInvalidMessage = '비밀번호는 8~15자의 영문자, 숫자, 특수문자 조합으로 입력하세요.';

var InformationMSG = '정보없음';
var RealData;
var DeviceState;
//#region 유효성 패턴
//영어 숫자로만 된 8~16 글자
const idPattern = /^[A-Za-z0-9]{8,16}$/;
//영어,특수문자,숫자가 최소 1개 이상 포함된 8~15글자
const pwPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
const spacePattern = /\s/;
const duplicationPattern = /(.+?)\1{2,}/;
const nicknamePattern = /^[ㄱ-ㅎ가-힣a-zA-Z0-9]{2,16}$/;
//#endregion

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
  const isValidID = idPattern.test(id)
  const isValidPW = pwPattern.test(pw)
  console.log(isValidID, isValidPW)
  if (isValidID && isValidPW) {
      if (!spacePattern.test(id) && !spacePattern.test(pw)) {
          if (!duplicationPattern.test(id) && !duplicationPattern.test(pw)) {
              if (await consecutiveLetterCheck(id) && await consecutiveLetterCheck(pw)) {
                  return {
                    isValid: true,
                    message: '유효성 검사를 통과하였습니다.',
                  };
              } else {
                  return {
                    isValid: false,
                    message: '연속된 문자가 3자 이상 포함되어 있습니다.'
                  };
              }
          } else {
            return {
              isValid: false,
              message: '동일한 문자가 3자 이상 포함되어 있습니다.'
            };
          }
      } else {
          return {
            isValid: false,
            message: '공백이 있습니다'
          };
      }
  } else {
      console.log('ID, PW 패턴이 맞지않습니다.');
      return {
        isValid: false,
        message: !isValidID ? idInvalidMessage : passwordInvalidMessage
      };
  }
}

async function nickNameCheck(nickname) {
    if (!spacePattern.test(nickname)) { // 공백 체크 공백 들어가면 false 안들어가면 true
        if (nicknamePattern.test(nickname)) {
          return {
            isValid: true,
            message: '유효성 검사를 통과하였습니다.',
          };
        }
        else {
          return {
            isValid: false,
            message: '닉네임은 2~16자리의 한글, 영어, 숫자를 사용하세요.'
          };
        }
    }
    else {
        return {
          isValid: false,
          message: '닉네임에 공백이 포함되어 있습니다.'
        };
    }
}

async function IDCheck(ID) {
    // console.log(`ID : ${ID}`);
    if (!spacePattern.test(ID)) { // 공백 체크 공백 들어가면 false 안들어가면 true
        if (idPattern.test(ID)) {
            if (!duplicationPattern.test(ID)) {
                if (await consecutiveLetterCheck(ID)) {
                    return {
                      isValid: true,
                      message: '유효성 검사를 통과하였습니다.',
                    };
                }
                else {
                  return {
                    isValid: false,
                    message: '아이디에 연속된 문자가 3자 이상 포함되어 있습니다.'
                  };
                }
            }
            else {
                return {
                  isValid: false,
                  message: '아이디에 동일한 문자가 3자 이상 포함되어 있습니다.'
                };
            }
        }
        else {
            return {
              isValid: false,
              message: '아이디는 8~16자리의 영어, 숫자를 사용하세요.'
            };
        }
    }
    else {
        return {
          isValid: false,
          message: '아이디에 공백이 포함되어 있습니다.'
        };
    }
}

async function PWCheck(PW) {
    if (!spacePattern.test(PW)) { // 공백 체크 공백 들어가면 false 안들어가면 true
        if (pwPattern.test(PW)) {
          if (!duplicationPattern.test(PW)) {
              if (await consecutiveLetterCheck(PW)) {
                return {
                  isValid: true,
                  message: '유효성 검사를 통과하였습니다.',
                };
              } else {
                  //연속된 문자 3개 이상
                  console.log('연속된 문자 3개 이상');
                  return {
                    isValid: false,
                    message: '연속된 문자가 3개 이상 있습니다.'
                  };
              }
          } else {
              //같은 문자 3개 이상
              console.log('같은 문자 3개 이상');
              return {
                isValid: false,
                message: '같은 문자가 3개 이상 있습니다'
              };
          }
        }
        else {
            console.log("패스워드 패턴 다름")
            return {
              isValid: false,
              message: passwordInvalidMessage
            };
        }
    }
    else {
      //공백 확인
      console.log('공백 ', `PW:${PW}`);
      return {
        isValid: false,
        message: '공백이 있습니다'
      };
    }
}
//#endregion


//#region CRYPTO
async function RSAESEncryptionString(str) {
    try {
      const publicKey = await GetPublicKey(); // 공개 키 가져오기
      if (!publicKey) {
        throw new Error('Failed to get public key');
      }
  
      const textEncoder = new TextEncoder();
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP'
        },
        publicKey,
        textEncoder.encode(str)
      );
  
      // Uint8Array를 Base64 문자열로 변환
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const base64String = arrayBufferToBase64(encryptedArray);
      return base64String;
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }
  
  // ArrayBuffer를 Base64 문자열로 변환하는 함수
  function arrayBufferToBase64(buffer) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);
  }
  
  // 공개 키 가져오기 함수
  async function GetPublicKey() {
    try {
      const response = await fetch(`${SVR_URL}/login/getpublicKey`, {
        method: "post",
        headers: { "content-type": "application/json" },
      });
      const publicKeyPEM = await response.text();
      const publicKey = await importPublicKey(publicKeyPEM);
      return publicKey;
    } catch (error) {
      console.error('Failed to fetch public key:', error);
      return null;
    }
  }
  
  // PEM 문자열을 CryptoKey 객체로 변환하는 함수
  async function importPublicKey(pemKey) {
    const pemString = pemKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s/g, ''); // 공백 및 줄바꿈 제거
  
    const binaryString = window.atob(pemString);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; ++i) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  
    // console.log(`byte`,bytes);
    return await window.crypto.subtle.importKey(
      'spki',
      bytes.buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
  }
  //#endregion

module.exports = { selectedID, SVR_URL, mqttRun, opcuaRun, mqttAll, opcuaAll, accountCheck, nickNameCheck, IDCheck, PWCheck, selectedUserID, selectedUserNickname, selectedUserPW, myID, myNN, myRole, idInvalidMessage, passwordInvalidMessage, loginstate,RSAESEncryptionString,InformationMSG };