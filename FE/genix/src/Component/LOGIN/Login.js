import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import GlobalStyles from "../../styles/fonts/GlobalStyles";

import CheckBox from "./CheckBox";
import LoginButton from "./LoginBtn";
import Instance from "../../Variable/Instance.js";
import { useNavigate } from "react-router-dom";

const Box = styled.div`
  width: 50%;
  height: 65vmax;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
const GradientBorderBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: baseline;
  width: 60%;
  height: 50%;
  border-radius: 5%; // 원하는 둥근 모서리 정도
  position: relative;
  background-color: transparent; // 내부 색상을 투명하게 설정

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    background: linear-gradient(
      to right bottom,
      #ffffff 0%,
      #002f55 39%,
      #ffffff 100%
    );
    z-index: -1; // 부모 요소 뒤로 보내기
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude; // 마스크 복합 방식 설정
    -webkit-mask-composite: destination-out;
    padding: 0.1vmax; // 테두리 두께만큼 패딩 설정
  }
`;
const TitleText = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 2.8vmax;
  color: white;
  padding-top: 3vmax;
  padding-bottom: 2vmax;
  height: 3.5vmax;
`;
const shake = keyframes`
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
`;
const InputWrapper = styled.div`
  width: 74%;
  height: 2.5vmax;
  margin-top: 1vmax;
  margin-bottom: 0.3vmax;
  display: flex;
  align-items: center;
  animation: ${(props) =>
    props.animation &&
    css`
      ${shake} 0.2s linear
    `};
`;

const InputArea = styled.input`
  width: 100%;
  height: 100%;
  border-radius: 0.4vmax;
  background: none;
  border: 0.05vmax solid white;
  cursor: pointer;
  text-align: left;
  font-family: "Pretendard", sans-serif;
  font-weight: 300;
  font-size: 1vmax;
  color: white;
  padding-left: 2vmax;
  &:focus {
    outline: 0.1vmax solid #22c7d1;
  }
  &:hover {
    outline: 0.1vmax solid lightblue;
  }
  &::placeholder {
    color: lightgray;
  }
`;
const ErrorMessage = styled.div`
  color: #ff1212;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 0.9vmax;
  margin-top: 1.5vmax;
`;

const PWDMessage = styled.div`
  color: #0088f4;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 0.85vmax;
  margin: 0.8vmax 0;
  line-height: 1.3vmax;
`;

function LoginArea() {
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setmsg] = useState(
    `아이디 : 8~15자리 영문 대소문자,숫자를 조합\n비밀번호 : 8~16자리 영문 대소문자,숫자,특수문자를 조합\n3자 이상의 동일문자/연속문자를 포함할 수 없음`
  );
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);

  const handleLogin = async () => {
    const {isValid, message} = await Instance.accountCheck(id, password);
    console.log('awefawef', isValid)
    if (isValid) {
      await loginAPI(id, password);
    } else {
      setError(message);
      setShowErrorAnimation(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleAnimationEnd = () => {
    setShowErrorAnimation(false);
  };

  // 로그인 API 호출
  async function loginAPI(id, pw) {
    console.log(pw);
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    const encPW = await Instance.RSAESEncryptionString(pw);
    console.log(`id : ${id} / pw : ${encPW}`);

    fetch(`${Instance.SVR_URL}/login`, {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ID: id,
        PW: encPW,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          localStorage.setItem(
            "Tokens",
            JSON.stringify({
              AccessToken: response.headers.get("AccessToken"),
              RefreshToken: response.headers.get("RefreshToken"),
              UserID: response.headers.get("UserID"),
            })
          );
        } else {
          setError("아이디 혹은 비밀번호를 잘못 입력했습니다");
          setShowErrorAnimation(true);
        }
        return response.text();
      })
      .then((data) => {
        if (data === "login_success") {
          localStorage.setItem("loginState", true);
          navigate("/Device");
        }
      })
      .catch((error) => {
        console.error(`LOGIN ERROR : ${error}`);
      });
  }
  /*
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
      const response = await fetch(`${Instance.SVR_URL}/login/getpublicKey`, {
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
*/

  return (
    <Box>
      <GradientBorderBox>
        <GlobalStyles />
        <TitleText>LOGIN</TitleText>
        <InputWrapper
          animation={showErrorAnimation ? 1 : 0}
          onAnimationEnd={handleAnimationEnd}
        >
          <InputArea
            type="text"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            maxLength={15}
            minLength={8}
            onKeyDown={handleKeyDown}
          />
        </InputWrapper>
        <InputWrapper
          animation={showErrorAnimation ? 1 : 0}
          onAnimationEnd={handleAnimationEnd}
        >
          <InputArea
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </InputWrapper>
        <PWDMessage>
          {msg.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </PWDMessage>
        <CheckBox />
        <LoginButton onClick={handleLogin} />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </GradientBorderBox>
    </Box>
  );
}

export default LoginArea;
