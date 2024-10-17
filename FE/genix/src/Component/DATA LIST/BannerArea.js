import React from "react";
import styled from "styled-components";

import BannerBG from "../../images/BannerImg.png"

const BaseContainer = styled.div`
    width: 82.5vmax;
    height: 4.8vmax;
    background-image: url(${BannerBG});
    background-size: 100%;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: baseline;
    margin-bottom: 0.8vmax;
`
const TextContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: baseline;
    margin-left: 2vmax;
`
const MainText = styled.div`
    font-family: 'Pretendard', sans-serif;
    font-size: 2vmax;
    font-weight: 600;
    color: white;
`
const SubText = styled.div`
    font-family: 'Pretendard', sans-serif;
    font-size: 0.9vmax;
    font-weight: 200;
    color: lightgray;
    margin-left: 1vmax;
    margin-top: 1vmax;
`
const ItemContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: baseline;
    margin-left: 28vmax;
`
const Item = styled.div`
    width: 10vmax;
    height: 2.8vmax;
    background-color: #002E4D;
    border: 0.05vmax solid white;
    border-radius: 0.5vmax;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-left: 1vmax;
`
const ItemMainText = styled.div`
    height: fit-content;
    font-family: 'Pretendard', sans-serif;
    font-size: 1vmax;
    font-weight: 600;
    color: white;
    margin-right: 3vmax;
`
const ItemSubText = styled.div`
    font-family: 'Pretendard', sans-serif;
    font-size: 1vmax;
    font-weight: 300;
    color: white;
`

function BannerArea () {
    return (
        <BaseContainer>
            <TextContainer>
                <MainText>디바이스 상태</MainText>
                <SubText>Device Status</SubText>
            </TextContainer>
            <ItemContainer>
                {/* <Item><ItemMainText>MQTT</ItemMainText><ItemSubText>0/8</ItemSubText></Item>
                <Item><ItemMainText>UART</ItemMainText><ItemSubText>0/1</ItemSubText></Item>
                <Item><ItemMainText>OPC-UA</ItemMainText><ItemSubText>0/1</ItemSubText></Item> */}
            </ItemContainer>
        </BaseContainer>
    )
}

export default BannerArea;