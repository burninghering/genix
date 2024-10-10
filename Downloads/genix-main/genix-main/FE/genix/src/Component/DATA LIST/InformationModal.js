import styled from "styled-components";

import PopUpImg from "../../images/PopUpImg.svg"
import React, { useState,useEffect } from "react";
import Instance from '../../Variable/Instance.js';
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
const BaseBG = styled.div`
    width: 100%;
    height: 20%;
    background-color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 1vmax;
    padding-bottom: 1vmax;
`
const TopContainer = styled.div`
    width: 60%;
    height: 70%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`
const BottomContainer = styled.div`
    width: 55%;
    height: 30%;
    display: flex;
    align-items: center;
    justify-content: center;

`
const TopImgContainer = styled.div`
    width: 10%;
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        width: 150%;
        height: 150%;
    }
`
const TextContainer = styled.div`
    margin-left: 1.5vmax;
    display: flex;
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: baseline;
`
const GuideText = styled.div`
    font-family: 'Pretendard', sans-serif;
    font-size: 1.3vmax;
    font-weight: 400;
    color: white;
    margin-top: 0.5vmax;
    margin-bottom: 0.5vmax;
`
const OkayBtn = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 15%;
    height: 90%;
    background: linear-gradient(to bottom, #56B4FF 0%, #0088F4 100%);
    border-radius: 0.5vmax;
    padding: 0.5vmax;
    font-family: 'Pretendard', sans-serif;
    font-weight: 700;
    font-size: 1.4vmax;
    color: white;
    cursor: pointer;
    border: none;
    &:hover {
        background: linear-gradient(to bottom, #067EDE 0%, #0862A9 100%);
    }
`
function InformationModal ({onClickCloseButton}) {
    const [msg, setMSG] = useState('');
    useEffect(() => {
        setMSG(Instance.InformationMSG);
    }, []);
    return (
        <BlackBG>
            <BaseBG>
                <TopContainer>
                    <TopImgContainer>
                        <img className="PopUp" src={PopUpImg} alt="POPUP"/>
                    </TopImgContainer>
                    <TextContainer>
                        <GuideText>{msg}</GuideText>
                    </TextContainer>
                </TopContainer>
                <BottomContainer>
                    <OkayBtn onClick = {onClickCloseButton}>확인</OkayBtn>
                </BottomContainer>
            </BaseBG>
        </BlackBG>
    )
}

export default InformationModal;
