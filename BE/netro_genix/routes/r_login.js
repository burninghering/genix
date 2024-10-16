import express from "express";
import db_manager from '../functions/db_manager.js';
import Instance from '../variable/Instance.js';
import TokenUtils from '../utils/tokenUtils.js';
const jwt = require('jsonwebtoken'); //# jsonwebtoken(jwt) import

var router = express.Router();

router.post('/', async function (req, res) {
  if (req.header.AccessToken && req.header.RefreshToken) {
    const accessToken = req.headers["AccessToken"];
    const refreshToken = req.headers["RefreshToken"];
    const authResult = TokenUtils.verify(accessToken);
    const decoded = jwt.decode(accessToken);

    // 디코딩 결과가 없으면 권한이 없음을 응답.
    if (!decoded) {
      res.status(401).send("No authorized!");
    }
    // access 토큰 만료 시
    if (authResult.ok === false && authResult.message === "jwt expired") {
      // 1. access token이 만료되고, refresh token도 만료 된 경우 => 새로 로그인해야합니다.
      const refreshResult = db_manager.RefreshToken(refreshToken, decoded.id);//await TokenUtils.refreshVerify(refreshToken, decoded.id);

      if (refreshResult === false) {


        res.status(401).send("No authorized! 다시 로그인해주세요.");
      } else {
        res.set('Access-Control-Expose-Headers');
        // 2. access token이 만료되고, refresh token은 만료되지 않은 경우 => 새로운 access token을 발급
        const newAccessToken = await TokenUtils.makeToken({ id: decoded.id });
        res.set('Access-Control-Expose-Headers', 'AccessToken').header({ 'AccessToken': newAccessToken }).send('asdas');
        //res.setHeader('accessToken',newAccessToken).status(200).send();//JSON.stringify({accessToken: newAccessToken,refreshToken:refreshToken,userId:userID})).send();

        // ,Instance.successResponse(
        //     200, {
        //     accessToken: newAccessToken,
        //     refreshToken,
        // }
        // ));
      }
    }
    else {
      // 3. access token이 만료되지 않은경우 => refresh 할 필요가 없습니다.
      res.status(400).send("Acess token is not expired!");
    }
  }
  else {
    // access token 또는 refresh token이 헤더에 없는 경우
    var userID = req.body.ID;
    var userPW = req.body.PW;
    //console.log("LOGIN @ "+"userID : " + userID + " / userPW : " + userPW);
    // console.log(`userID `, userID);
    // console.log(`userPW `, userPW);
    if (userID != null && userPW != null)
      db_manager.Login(userID, userPW, res);
    //res.status(401).send(Instance.failResponse(400,"Access token and refresh token are need for refresh!"));
  }
  // var userID = req.get('ID');
  // var userPW = req.get('PW');


  //return res.send("OK");
});

router.post('/refresh', async function (req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  // access, refresh 토큰이 헤더에 담겨 온 경우
  if (req.header('AccessToken') && req.header('RefreshToken')) {
    const accessToken = req.header("AccessToken")
    const refreshToken = req.header("RefreshToken");
    //const userID = req.header("ID");
    //if(db_manager.GetToken()){
    // access token 검증 -> expired여야 함.
    const authResult = await TokenUtils.verify(accessToken);
    // console.log(`authok : ${authResult.ok} / authID : ${authResult.id} / authmessage : ${authResult.message}`);
    // access token 디코딩하여 userId를 가져온다.
    const decoded = jwt.decode(accessToken);

    // 디코딩 결과가 없으면 권한이 없음을 응답.
    if (!decoded) {
      res.status(401).send("No authorized!");
      return;
    }
    const refreshResult = await db_manager.RefreshToken(decoded.id, refreshToken);
    //console.log('refreshResult', refreshResult)
    if (refreshResult !== true) {
      res.status(401).send("No authorized! 다시 로그인해주세요.");
      return;
    } 
    else {
      // access 토큰 만료 시
      if (authResult.ok === false && authResult.message === "jwt expired") {
        // 1. access token이 만료되고, refresh token도 만료 된 경우 => 새로 로그인해야합니다.
        const refreshResult = await db_manager.RefreshToken(decoded.id, refreshToken);
        console.log('refreshResult', refreshResult)
        if (refreshResult === false) {
          res.status(401).send("No authorized! 다시 로그인해주세요.");
        }
        else {
          // 2. access token이 만료되고, refresh token은 만료되지 않은 경우 => 새로운 access token을 발급
          const newAccessToken = TokenUtils.makeToken({ id: decoded.id });

          // res.set('AccessToken', `${newAccessToken}`);
          // res.set('RefreshToken', `${refreshToken}`);

          console.log(`newAccessToken : ${newAccessToken}`);
          // res.set('Access-Control-Expose-Headers');
          res.set('Access-Control-Expose-Headers', 'AccessToken').header({ 'AccessToken': newAccessToken }).send();
          // console.log(`newAccessToken : ${newAccessToken} / refreshResult : ${refreshToken}`);
          // res.status(200).send();
        }
      } else {
        // 3. access token이 만료되지 않은경우 => refresh 할 필요가 없습니다.
        // res.status(200).send("Acess token is not expired!");
        res.set('Access-Control-Expose-Headers', 'AccessToken').header({ 'AccessToken': accessToken }).send();

      }
    }
    //}
  } else {
    // access token 또는 refresh token이 헤더에 없는 경우
    res.status(401).send("Access token and refresh token are need for refresh!");
  }
});

router.post('/logout', function (req, res) {
  const userID = req.body.ID;
  db_manager.Logout(userID, res);
});

router.post('/getpublicKey', function (req, res) {
  //Instance.publicKeyEncoding;
  //console.log(`key : ${Instance.publicKey}`);
  res.status(200).send(Instance.publicKey);
});

/*
const refresh = async (req, res)=>{

    res.set('Access-Control-Allow-Origin', '*');
    //console.log(`header access : ${req.headers.AccessToken} / fresh : ${req.header('RefreshToken')}`);
    // access, refresh 토큰이 헤더에 담겨 온 경우
    if (req.header('AccessToken') && req.header('RefreshToken')){
        const accessToken = req.header["AccessToken"]
        const refreshToken = req.header["RefreshToken"];
        
        // console.log(`accesstoken : ${accessToken}\r\n refreshtoken : ${refreshToken}`)
        // access token 검증 -> expired여야 함.
        const authResult = TokenUtils.verify(accessToken);
 
        // access token 디코딩하여 userId를 가져온다.
        const decoded = jwt.decode(accessToken);

        // 디코딩 결과가 없으면 권한이 없음을 응답.
        if (!decoded) {
            console.log("123");
            res.status(401).send("No authorized!");
            return;
        }
        
        // access 토큰 만료 시
        console.log(`authResult : ${authResult.ok} / authResult : ${authResult.message}`);

        if (authResult.ok === false && authResult.message === "jwt expired") {
          // 1. access token이 만료되고, refresh token도 만료 된 경우 => 새로 로그인해야합니다.
          const refreshResult = await db_manager.RefreshToken(refreshToken, decoded.id);
          if (refreshResult === false) {
            console.log("222");
            res.status(401).send("No authorized! 다시 로그인해주세요.");
          } else {
            // 2. access token이 만료되고, refresh token은 만료되지 않은 경우 => 새로운 access token을 발급
            const newAccessToken = TokenUtils.makeToken({ id: decoded.id });
            
            res.set('AccessToken',`${newAccessToken}`);
            res.set('RefreshToken',`${refreshResult}`);

            res.status(200).send();
          }
        } else {
          // 3. access token이 만료되지 않은경우 => refresh 할 필요가 없습니다.
          res.status(400).send("Acess token is not expired!");
        }
      } else {
        // access token 또는 refresh token이 헤더에 없는 경우
        console.log("333");
        res.status(401).send("Access token and refresh token are need for refresh!");
      }
};


function CheckVerifyPassword(pwd) {
    var validatePattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,20}$/
    if (validatePattern.test(pwd)) {
        if (!/(\w)\1\1/.test(pwd)) {
            var cnt = 0
            var cnt2 = 0
            var tmp = ''
            var tmp2 = ''
            var tmp3 = ''
            for (var i = 0; i < pwd.length; i++) {
                // charAt(): 문자값 반환
                tmp = pwd.charAt(i)
                tmp2 = pwd.charAt(i + 1)
                tmp3 = pwd.charAt(i + 2)

                // charCodeAt(): 유니코드값 반환
                if (tmp.charCodeAt(0) - tmp2.charCodeAt(0) === 1 && tmp2.charCodeAt(0) - tmp3.charCodeAt(0) === 1) {
                    cnt = cnt + 1
                }
                if (tmp.charCodeAt(0) - tmp2.charCodeAt(0) === -1 && tmp2.charCodeAt(0) - tmp3.charCodeAt(0) === -1) {
                    cnt2 = cnt2 + 1
                }
            }
            if (cnt > 0 || cnt2 > 0) {
                // alert('연속된 문자를 3개 이상 사용하실 수 없습니다.\n(ex: 123, 321, abc, cba 포함 불가)');
                return false;
            }
        } else {
            // alert('같은 문자를 3개 이상 사용할 수 없습니다');
            return false;
        }
    } else {
        // alert('비밀번호는 영문자, 숫자, 특수문자 조합의 8~20자리를 사용해야 합니다.');
        return false;
    }
    return true
}
*/

module.exports = router;