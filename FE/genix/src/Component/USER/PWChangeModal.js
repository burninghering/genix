import React,{useState} from "react";
import styled from "styled-components";
import Instance from "../../Variable/Instance.js";

const BlackBG = styled.div`
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5); /* 반투명한 검정 배경 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* 모달보다 위에 위치 */
    display: flex;
    flex-direction: row;
`
const BaseBackGroond = styled.div`
    width: 30%;
    height: 24%;
    background-color: black;
    border-radius: 1vmax;
    display: flex;
    flex-direction: column;
    align-self: center;
    justify-content: baseline;
    padding: 1vmax;
`
const TitleContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.3vmax;
`
const TitleSubContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-left: 1vmax;
    margin-right: 1vmax;
`
const WhiteText = styled.div`
    color: white;
    font-family: 'Pretendard', sans-serif;
    font-size: 1vmax;
    font-weight: 500;
`
const BlueText = styled.div`
    color: #0088F4;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.9vmax;
    font-weight: 300;
    margin-left: 6px;
`
const Content = styled.div`
    width: 100%;
    height: 58%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`
const LeftContent = styled.div`
    width: 35%;
    height: 80%;
    display: flex;
    flex-direction: column;
    align-items: end;
    justify-content: center;
`
const RightContent = styled.div`
    width: 65%;
    height: 80%;
    display: flex;
    flex-direction: column;
    align-items: end;
    justify-content: center;
`
const LContentItem = styled.div`
    width: 100%;
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: end;
`
const RContentItem = styled.div`
    width: 100%;
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: baseline;
`
const InfoInput = styled.input`
    width: 70%;
    height: 1.5vmax;
    background-color: #B6B6B7;
    border: none;
    border-radius: 0.3vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.8vmax;
    color: black;
    text-align: left;
    padding-left: 0.7vmax;
    margin-left: 1vmax;
`
const BtnContainer = styled.div`
    width: 100%;
    height: 20%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 1vmax;
`
const OKBtn = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 25%;
    height: 100%;
    background: linear-gradient(to bottom, #56B4FF 0%, #0088F4 100%);
    border-radius: 0.5vmax;
    padding: 0.5vmax;
    font-family: 'Pretendard', sans-serif;
    font-weight: 700;
    font-size: 1.2vmax;
    color: white;
    margin-left: 1vmax;
    margin-right: 1vmax;
    cursor: pointer;
    border: none;
    &:hover {
        background: linear-gradient(to bottom, #067EDE 0%, #0862A9 100%);
    }
`
const CancelBtn = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 25%;
    height: 100%;
    background: none;
    border: 0.05vmax solid white;
    border-radius: 0.5vmax;
    padding: 0.5vmax;
    font-family: 'Pretendard', sans-serif;
    font-weight: 700;
    font-size: 1.2vmax;
    color: white;
    margin-left: 1vmax;
    margin-right: 1vmax;
    cursor: pointer;
    &:hover {
        background-color: #456C86;
    }
`
const ErrorMessage = styled.div`
  color: #ff1212;
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 0.9vmax;
  text-align: center;
  white-space: pre-line;
  margin-bottom: 8px;
`

function PWChangeModal({ onClickChangePWD, onClose }) {
  const [id,setid] = useState('');
  const [nickname,setnickname] = useState('');
  const [pwd,setpwd] = useState('');
  const [pwdc,setpwdc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

    return (
      <BlackBG>
        <BaseBackGroond>
          <TitleContainer>
            <TitleSubContainer>
              <WhiteText>아이디</WhiteText><BlueText>{Instance.selectedUserID}</BlueText>
            </TitleSubContainer>
            <TitleSubContainer>
              <WhiteText>닉네임</WhiteText><BlueText>{Instance.selectedUserNickname}</BlueText>
            </TitleSubContainer>
          </TitleContainer>
          <Content>
            <LeftContent>
              <LContentItem><WhiteText>비밀번호</WhiteText></LContentItem>
              <LContentItem><WhiteText>비밀번호 확인</WhiteText></LContentItem>
            </LeftContent>
            <RightContent>
              <RContentItem><InfoInput type="password" onChange={(e) => setpwd(e.target.value)} value={pwd}/></RContentItem>
              <RContentItem><InfoInput type="password" onChange={(e) => setpwdc(e.target.value)} value={pwdc}/></RContentItem>
            </RightContent>
          </Content>
          {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
          <BtnContainer>
            <OKBtn onClick={async () => {
              if (pwd === pwdc) {
                const { isValid: isPasswordValid, message: invalidPWMessage } = await Instance.PWCheck(pwd);
                if ( isPasswordValid ) {
                  Instance.selectedUserPW = pwd;
                  onClickChangePWD();
                }
                else {
                  setErrorMsg(invalidPWMessage)
                }
              }
              else {
                setErrorMsg('패스워드가 다릅니다.')
              }

              }}>변경</OKBtn>
            <CancelBtn onClick={onClose}>취소</CancelBtn>
          </BtnContainer>
        </BaseBackGroond>
      </BlackBG>
    );
  }

export default PWChangeModal;