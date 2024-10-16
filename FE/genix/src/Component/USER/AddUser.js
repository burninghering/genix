import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Instance from "../../Variable/Instance.js";

const BaseContainer = styled.div`
    width: 30vmax;
    border: 0.05vmax solid white;
    border-radius: 1vmax;
    margin-left: 1vmax;
    background: linear-gradient(to bottom, #2888CA 3%, #006AB3 13%, #002E4D 88%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: baseline;
`
const TitleText = styled.div`
    font-family: 'Pretendard', sans-serif;
    font-size: 1.8vmax;
    font-weight: 600;
    color: white;
    margin-top: 2vmax;
    margin-bottom: 2vmax;
`
const ContentContainer = styled.div`
    width: 100%;
    height: 20vmax;
    display: flex;
    flex-direction: row;
    justify-content: center;
`
const LeftContainer = styled.div`
    width: 30%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: baseline;
    margin-bottom: 1.3vmax;
`
const RightContainer = styled.div`
    width: 60%;
    height: 100%;
    margin-left: 1.5vmax;
    display: flex;
    flex-direction: column;
    justify-content: baseline;
    margin-bottom: 1.3vmax;
`
const LeftRowContainer = styled.div`
    width: 100%;
    height: 3vmax;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;

`
const RightRowContainer = styled.div`
    width: 100%;
    height: 3vmax;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: baseline;

`
const SubTitleText = styled.div`
    font-family: 'Pretendard', sans-serif;
    font-size: 1vmax;
    font-weight: 600;
    color: white;
`
const TitleSymbol = styled.div`
    font-family: 'Pretendard', sans-serif;
    font-size: 0.7vmax;
    font-weight: 600;
    color: white;
`
const IDinput = styled.input`
    width: 45%;
    height: 2vmax;
    border: none;
    border-radius: 0.5vmax;
    background-color: #011428;
    color: white;
    font-size: 0.7vmax;
    padding-left: 1vmax;
    padding-right: 1vmax;
`
const CommonInput = styled.input`
    width: 80%;
    height: 2vmax;
    border: none;
    border-radius: 0.5vmax;
    background-color: #011428;
    color: white;
    font-size: 0.7vmax;
    padding-left: 1vmax;
    padding-right: 1vmax;
`
const IDConfirmBtn = styled.button`
    padding: 0.5vmax 1vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.7vmax;
    font-weight: 500;
    border: 0.03vmax solid #BDBDBD;
    border-radius: 0.5vmax;
    color: lightgray;
    background-color: #262626;
    cursor: pointer;
    margin-left: 1vmax;

    &:hover {
      background-color: #4E4E4E;
    }
`
const AdminBtn = styled.button`
    min-width: 70px;
    padding: 0.3vmax 0.8vmax;
    min-width: 80px;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.8vmax;
    font-weight: 500;
    border: 0.03vmax solid #BDBDBD;
    border-radius: 0.5vmax;
    color: lightgray;
    background-color: #262626;
    cursor: pointer;
    margin-right: 12.7vmax;
    &:hover {
      background-color: #4E4E4E;
    }
`
const BottomBtnContainer = styled.div`
    width: 60%;
    height: 10%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 7vmax;
`
const CommitBtn = styled.button`
    width: 45%;
    height: 70%;
    background: linear-gradient(to bottom, #56B4FF 0%, #0088F4 100%);
    border-radius: 0.5vmax;
    padding: 0.5vmax;
    font-family: 'Pretendard', sans-serif;
    font-weight: 700;
    font-size: 1.2vmax;
    color: white;
    cursor: pointer;
    border: none;
    &:hover {
        background: linear-gradient(to bottom, #067EDE 0%, #0862A9 100%);
    }
`
const CancelBtn = styled.button`
    width: 45%;
    height: 70%;
    background: none;
    border: 0.05vmax solid white;
    border-radius: 0.5vmax;
    padding: 0.5vmax;
    font-family: 'Pretendard', sans-serif;
    font-weight: 700;
    font-size: 1.2vmax;
    color: white;
    cursor: pointer;
    &:hover {
        background-color: #1E2C35;
    }
`
const ErrorMessage = styled.div`
  color: #ff1212;
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 0.9vmax;
  margin-top: 1vmax;
`


function AddUser() {
    const [idText, setID] = useState('');
    const [pwText, setPW] = useState('');
    const [pwConfirm, setPWC] = useState('');
    const [nickName, setNN] = useState('');
    const [role, setRole] = useState('사용자');
    const [dupCheck, setDup] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');

    async function OnClickAddButton() {
        console.log(`idText : ${idText} / pwText :${pwText} / pwConfirm :${pwConfirm} / nickName :${nickName} / role :${role}`);

        if (dupCheck === true) {
            if (pwText === pwConfirm) {
                const { isValid: isAccountValid, message } = await Instance.accountCheck(idText, pwText); 
                const { isValid: isNicknameValid, message: invalidNicknameMessage} = await Instance.nickNameCheck(nickName);
                if (isAccountValid && isNicknameValid) {
                    var roleNumber = 0;
                    switch (role) {
                        case '관리자':
                            roleNumber = 1;
                            break;
                        case '사용자':
                            roleNumber = 2;
                            break;
                        default:
                            roleNumber = 2;
                            break;
                    }
                    const encID = await Instance.RSAESEncryptionString(idText);
                    const encPW = await Instance.RSAESEncryptionString(pwText);
                    const encRole = await Instance.RSAESEncryptionString(roleNumber);
          
                    fetch(`${Instance.SVR_URL}/user/regist_user`, {
                        method: "post",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({
                            ID: encID,
                            PW: encPW,
                            NICKNAME: nickName,
                            ROLE: encRole
                        })
                    }).then(res => res.text()).then(data =>
                    {
                        if (data === "SUCCESS") {
                            window.location.reload();
                        }
                        else{
                            setErrorMsg(data);

                        }
                    });
                }
                else {
                    const validationMessage = !isAccountValid ? message : ( !isNicknameValid ? invalidNicknameMessage : '') 
                    setErrorMsg(validationMessage);
                    console.log("유효성검사 실패하였습니다. ", validationMessage);
                }

            }
            else {
                setErrorMsg("패스워드가 일치하지 않습니다.");
                console.log("패스워드가 일치하지 않습니다.");
            }
        }
        else if(idText=='' || pwText =='' || pwConfirm=='' || nickName){
            console.log("중복된 ID존재");
            setErrorMsg("필수 항목을 모두 입력해 주세요.");
        }
        else {
            console.log("중복된 ID존재");
            setErrorMsg("중복된 ID가 존재합니다.");

        }
    }

    function OnClickCancelButton() {
        setID('');
        setPW('');
        setPWC('');
        setNN('');
        setRole('사용자');
    }

    async function onClickChkDup() {
        const { isValid: isIDValid, message: invalidIdMessage } = await Instance.IDCheck(idText)
        if (isIDValid) {
            fetch(`${Instance.SVR_URL}/user/check_dup`, {
                method: "post",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    ID: idText,
                })
            })
            .then(res => {
                if (res.status === 200) {
                    setDup(true);
                }
                else {
                    setDup(false);
                    console.log('이미 존재하는 ID 입니다.');
                }
                return res.text();
            }).then(data => {setErrorMsg(data);});
        }
        else {
            setErrorMsg(invalidIdMessage);
        }
    }

    function onClickAdmin() {
        if (role === '사용자') {
            setRole('관리자');
        }
        else {
            setRole('사용자');
        }
    }

    return (
        <BaseContainer>
            <TitleText>사용자 등록</TitleText>
            <ContentContainer>
                <LeftContainer>
                    <LeftRowContainer><TitleSymbol>＊</TitleSymbol><SubTitleText>&nbsp;&nbsp;아이디</SubTitleText></LeftRowContainer>
                    <LeftRowContainer><TitleSymbol>＊</TitleSymbol><SubTitleText>&nbsp;&nbsp;비밀번호</SubTitleText></LeftRowContainer>
                    <LeftRowContainer><TitleSymbol>＊</TitleSymbol><SubTitleText>&nbsp;&nbsp;비밀번호 확인</SubTitleText></LeftRowContainer>
                    <LeftRowContainer><TitleSymbol>＊</TitleSymbol><SubTitleText>&nbsp;&nbsp;닉네임</SubTitleText></LeftRowContainer>
                    <LeftRowContainer><SubTitleText>권한</SubTitleText></LeftRowContainer>
                </LeftContainer>
                <RightContainer>
                    <RightRowContainer>
                        <IDinput onChange={(e) => {setID(e.target.value); setDup(false)}} value={idText} />
                        <IDConfirmBtn onClick={onClickChkDup}>중복 확인</IDConfirmBtn></RightRowContainer>
                    <RightRowContainer><CommonInput type="password" onChange={(e) => setPW(e.target.value)} value={pwText} /></RightRowContainer>
                    <RightRowContainer><CommonInput type="password" onChange={(e) => setPWC(e.target.value)} value={pwConfirm} /></RightRowContainer>
                    <RightRowContainer><CommonInput onChange={(e) => setNN(e.target.value)} value={nickName} /></RightRowContainer>
                    <RightRowContainer><AdminBtn onClick={onClickAdmin}>{role}</AdminBtn></RightRowContainer>
                </RightContainer>
            </ContentContainer>
            {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
            <BottomBtnContainer>
                <CommitBtn onClick={() => { OnClickAddButton(); }}>등록</CommitBtn>
                <CancelBtn onClick={() => { OnClickCancelButton(); }}>취소</CancelBtn>
            </BottomBtnContainer>
        </BaseContainer>
    )
}

export default AddUser;