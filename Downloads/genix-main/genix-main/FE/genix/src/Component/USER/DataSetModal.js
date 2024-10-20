import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Instance from "../../Variable/Instance.js";

// 정보 변경창 백그라운드
const BaseBG = styled.div`
    width: 25%;
    height: 35%;
    min-height: 17vmax;
    background: radial-gradient(ellipse at top, #0088F4 0%, #00508D 22%, #002E4D 100%);
    border: 0.05vmax solid white;
    padding: 1.5vmax;
    border-radius: 1vmax;
    margin-left: 1vmax;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: baseline;
`
const ContentContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 1vmax;
`
// '닉네임 ... 비밀번호 확인' 왼쪽 전체 영역
const LeftContainer = styled.div`
    width: 30%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: baseline;
`
// 데이터 부분 오른쪽 전체 영역
const RightContainer = styled.div`
    width: 70%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: baseline;
`
// '닉네임 ... 비밀번호 확인' 텍스트
const Title = styled.div`
    display: flex;
    align-items: center;
    height: 2vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 1vmax;
    font-weight: 400;
    color: white;
    margin-bottom: 1vmax;
`
// 유저 정보 변경사항 입력 인풋
const DataInput = styled.input`
    display: flex;
    height: 1.9vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.8vmax;
    font-weight: 300;
    background-color: #011428;
    border-radius: 0.3vmax;
    text-align: left;
    color: white;
    margin-bottom: 1vmax;
    padding-left: 1vmax;
    border: none;
`
const ErrContainer = styled.div`
    width: 100%;
    height: 8%;
    display: flex;
    align-items: center;
    justify-content: center;
`

const BtnContainer = styled.div`
    width: 100%;
    height: 13%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 15px;
`
const CommitBtn = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30%;
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
    width: 30%;
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
`
function DataSetModal({ offChange }) {

    var [nickname, setNN] = useState(`${Instance.myNN}`);
    const [curpw, setCURPW] = useState('');
    const [npw, setNPW] = useState('');
    const [ncpw, setNCPW] = useState('');
    const [errorMsg, setErrorMsg] = useState(' ');

    //nickname = Instance.myNN;
    useEffect(() => {
        setErrorMsg(' ');
    }, []);

    async function ChangeMyInfo() {
        console.log(`npw : ${npw} / cpw : ${curpw}`)
        if (npw === ncpw) {
            if (Instance.nickNameCheck(nickname)) {
                const { isValid: isPasswordValid, message: invalidPWMessage } = await Instance.PWCheck(npw);
                if (isPasswordValid) {
                    const encCurPW = await Instance.RSAESEncryptionString(curpw);
                    const encNewPW = await Instance.RSAESEncryptionString(npw);
                    fetch(`${Instance.SVR_URL}/user/modify_myinfo`, {
                        method: "post",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({
                            ID: Instance.myID,
                            CPW: encCurPW,
                            NPW: encNewPW,
                            NICKNAME: nickname
                        })
                    }).then(res => res.text())
                    .then(data => {
                        if (data === "MODIFY SUCCESS") {
                            //onClose();
                            window.location.reload();
                        }
                        else{
                            setErrorMsg(data);
                        }
                        Instance.selectedID = null;
                        console.log(`${data}`);
                    });
                    //window.location.reload();
                }
                else {
                    setErrorMsg(invalidPWMessage);
                    console.log(`패스워드가 유효성검사를 실패하였습니다.`)
                }
            }
            else {
                setErrorMsg(`닉네임이 잘못되었습니다.`);
                console.log(`닉네임이 유효성검사를 넘지 못하였음`);
            }
        }
        else {
            setErrorMsg(`패스워드가 다릅니다.`);
            console.log(`패스워드가 틀립니다.`)
        }
    }
    return (
        <BaseBG>
            <ContentContainer>
                <LeftContainer>
                    <Title>닉네임</Title>
                    <Title>현재 비밀번호</Title>
                    <Title>새 비밀번호</Title>
                    <Title>비밀번호 확인</Title>
                </LeftContainer>
                <RightContainer>
                    <DataInput onChange={(e) => setNN(e.target.value)} value={nickname} />
                    <DataInput type="password" onChange={(e) => setCURPW(e.target.value)} value={curpw} />
                    <DataInput type="password" onChange={(e) => setNPW(e.target.value)} value={npw} />
                    <DataInput type="password" onChange={(e) => setNCPW(e.target.value)} value={ncpw} />
                </RightContainer>
            </ContentContainer>
            <ErrContainer>
                <ErrorMessage>{errorMsg}</ErrorMessage>
            </ErrContainer>
            <BtnContainer>
                <CommitBtn onClick={ChangeMyInfo}>저장</CommitBtn>
                <CancelBtn onClick={offChange}>취소</CancelBtn>
            </BtnContainer>
        </BaseBG>
    )
}

export default DataSetModal;