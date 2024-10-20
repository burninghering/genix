import React from "react";
import styled from "styled-components";
import { useState } from "react";

import UserImg from "../../images/UserImg.svg";
import CloseIcon from "../../images/icon/icon_close.svg"

import DataSetModal from "./DataSetModal";
import Instance from "../../Variable/Instance.js";
import { useNavigate } from "react-router-dom";

// 모달창 뒤 반투명 검정 배경
const ModalBackground = styled.div`
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
// 모달창 백그라운드
const BaseContainer = styled.div`
    background: radial-gradient(ellipse at top, #0088F4 0%, #00508D 22%, #002E4D 100%);
    width: 22%;
    min-height: 65%;
    max-height: 90%;
    padding: 1.5vmax;
    border: 0.05vmax solid white;
    border-radius: 1vmax;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: baseline;
`
// 모달창 닫기 버튼 영역
const CloseBtnArea = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: end;
`
// 모달창 닫기 버튼
const CloseButton = styled.button`
    width: 8%;
    background: none;
    border: none;
    cursor: pointer;

    img {
        width: 100%;
        height: 100%;
    }
`
// 모달창 내 유저 이미지
const UserImage = styled.div`
    margin-top: 1.5vmax;
    margin-bottom: 2vmax;

    img{
        width: 100%;
        height: 100%;
    }
`
// '아이디' '닉네임' 부분 왼쪽 전체 영역
const LeftContainer = styled.div`
    width: 23%;
    display: flex;
    flex-direction: column;
    justify-content: baseline;
`
// 데이터 부분 오른쪽 전체 영역
const RightContainer = styled.div`
    width: 77%;
    display: flex;
    flex-direction: column;
    justify-content: end;
`
// '아이디' '닉네임' 
const UserDataArea = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
`
const Title = styled.div`
    display: flex;
    align-items: center;
    height: 2vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 1vmax;
    font-weight: 500;
    color: white;
    margin-bottom: 1vmax;
`
const Text = styled.div`
    display: flex;
    align-items: center;
    height: 2vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 1vmax;
    font-weight: 300;
    background-color: #011428;
    border-radius: 0.3vmax;
    text-align: left;
    color: white;
    margin-bottom: 1vmax;
    padding-left: 1vmax;
`
const BtnContainer = styled.div`
    width: 90%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top:0.7vmax;
`
const ChangeBtn = styled.button`
    width: 45%;
    height: 100%;
    background: none;
    border: 0.05vmax solid white;
    border-radius: 0.5vmax;
    padding: 0.5vmax;
    font-family: 'Pretendard', sans-serif;
    font-weight: 700;
    font-size: 1.1vmax;
    color: white;
    cursor: pointer;
    &:hover {
        background-color: #456C86;
    }
`
const LogoutBtn = styled.button`
    width: 45%;
    height: 100%;
    background: none;
    border: 0.05vmax solid white;
    border-radius: 0.5vmax;
    padding: 0.5vmax;
    font-family: 'Pretendard', sans-serif;
    font-weight: 700;
    font-size: 1.1vmax;
    color: white;
    cursor: pointer;
    &:hover {
        background-color: #456C86;
    }
`
function UserInfoModal({ isOpen, onClose }) {
    const [isChangeOpen, setIsChangeOpen] = useState(false);
    const navigate = useNavigate();

    const handleChangeOpen = () => {
        setIsChangeOpen(true);
    }
    const handleChangeClose = () => {
        setIsChangeOpen(false);
    }

    function OnClickLogout()
    {
        localStorage.removeItem('AutoLogin')
        //localStorage.removeItem('currentView');
        localStorage.setItem('currentView', 'datalist'); 
        localStorage.removeItem('Tokens');
        Instance.myRole = '정보없음';
        
        fetch(`${Instance.SVR_URL}/login/logout`, {
            method: "post",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                ID: Instance.myID
            })
        }).then(response => {
            if(response.status===200)
                {
                    navigate("/");
                }
                else{
                    console.log(`로그아웃에 실패`); 
                }
        });
        
    }

    if (!isOpen) return null;

    return (
        <ModalBackground>
            <BaseContainer>
                <CloseBtnArea>
                    <CloseButton 
                        onClick={() => {
                            onClose();
                            handleChangeClose();
                        }}
                        >
                        <img className="closebutton" src={CloseIcon} alt="CLOSE"/>
                    </CloseButton>
                </CloseBtnArea>
                <UserImage><img className="userImage" src={UserImg} alt="USER"/></UserImage>
                <UserDataArea>
                    <LeftContainer>
                        <Title>아이디</Title>
                        <Title>닉네임</Title>
                    </LeftContainer>
                    <RightContainer>
                        <Text>{Instance.myID}</Text>
                        <Text>{Instance.myNN}</Text>
                    </RightContainer>
                </UserDataArea>
                <BtnContainer>
                    <ChangeBtn onClick={handleChangeOpen}>내 정보 변경</ChangeBtn>
                    <LogoutBtn onClick={OnClickLogout}>로그아웃</LogoutBtn>
                </BtnContainer>
            </BaseContainer>
            {isChangeOpen && <DataSetModal offChange = {handleChangeClose}/>}
        </ModalBackground>
    );
}

export default UserInfoModal;
