import React, { useEffect, useState } from "react";
import styled from "styled-components";
import DataTableShort from "./DataTableShort";
import SystemLog from "./SystemLog";
import { initializeSocket, disconnectSocket, BroadcastMSG } from '../../utils/socketUtils.js';
import iconOpenBox from '../../images/icon/icon_open_inbox.svg';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const SubContainer = styled.div`
  width: 82.5vmax;
  height: 11.62vmax;
  display: flex;
  background-color: #002E4D;
  border-radius: 1.1vmax;
  margin-top: 1.3vmax;
  margin-bottom: 4.5vmax;
`;

const RealDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 81vmax;
  height: 100%;
  background-color: #002E4D;
  border-radius: 1vmax;
  padding-left: 1vmax;
  padding-right: 0.5vmax;
  padding-top: 0.6vmax;
  padding-bottom: 1vmax;
`;

const ListHeader = styled.div`
  width: 77.2vmax;
  height: 0.3vmax;
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
  align-items: center;
  justify-content: baseline;
  padding: 1vmax;
  background-color: #001421;
  color: white;
  font-family: 'Pretendard', sans-serif;
  font-size: 1vmax;
  font-weight: 500;
  border-radius: 0.5vmax;
  margin-bottom: 0.5vmax;
`;

const ListContainer = styled.div`
  display: flex;
  width: 80.2vmax;
  height: 23vmax;
  flex-grow: 1;
  border-radius: 0.3vmax;
  position: relative;
  flex-direction: column;
  justify-content: baseline;
  overflow-y: hidden;
  position: relative;
`;

const ListEmptyWrapper = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-wrap: wrap;
  justfy-content: center;
  width: 100%;
  `;

const ListEmptyIcon = styled.img`
  position: relative;
  margin: 0 auto;
  width: 26px;
  padding: 0 0 0.6vmax;
  stroke: red;
`;

const ListEmptyLabel = styled.p`
  width: 100%;
  font-size: 13px;
  text-align: center;
  line-height: 1;
  margin: 0px;
  color: #83868c;
`;

const ContentWrapper = styled.div`
  height: 11vmax;
  overflow-y: auto;

  /* 스크롤바 커스텀 */
  &::-webkit-scrollbar {
    width: 0.5vmax;
  }
  &::-webkit-scrollbar-thumb {
    background: #0088F4;
    border-radius: 0.4vmax;
  }
  &::-webkit-scrollbar-track {
    background: #001421;
    border-radius: 0.4vmax;
  }
`;

const ListItem = styled.div`
  width: 78.1vmax;
  height: 0.3vmax;
  display: flex;
  justify-content: baseline;
  align-items: center;
  border: 0.01vmax solid white;
  border-radius: 0.5vmax;
  padding-top: 1vmax;
  padding-bottom: 1vmax;
  font-family: 'Pretendard', sans-serif;
  font-size: 0.9vmax;
  font-weight: 300;
  color: white;
  margin-bottom: 0.5vmax;
  padding-left: 0.5vmax;
`;

const ListItemField = styled.div`
  text-align: center;
`;

const widths = {
  index: '3%',
  time: '16%',
  name: '15%',
  value: '23%',
  empty: '20%',
};

const Headerwidths = {
  index: '2%',
  time: '18%',
  name: '15%',
  value: '25%',
  empty: '40%',
};

var intervalList = [];

function RealTimeData() {
  const [items, setItem] = useState([]);
  const [flag, setFlag] = useState(false);

  function intervalRealData_SocketIO(itemID) {
    let tmr = setInterval(() => {
      BroadcastMSG('reqRealData', itemID);
    }, 1000);
    intervalList.push(tmr);
  }

  function GetRealData_SocketIO(itemID) {
    console.log(`itemID : `, itemID);
    stopRealData();
    BroadcastMSG('reqRealData', itemID);
    intervalRealData_SocketIO(itemID);
  }

  const handleRealData = (realDatas) => {
    setItem(realDatas);
  };

  useEffect(() => {
    initializeSocket(handleRealData, 'realtimeData');

    return () => {
      stopRealData();
      disconnectSocket();
    };
  }, []);

  function stopRealData() {
    intervalList.forEach(timer => {
      clearInterval(timer);
    });
  }

  return (
    <Container>
      <DataTableShort onItemClick={GetRealData_SocketIO} />
      <SubContainer>
        <RealDataContainer>
          <ListHeader>
            <div style={{ width: Headerwidths.index, textAlign: "center", marginLeft: '20px' }}>No.</div>
            <div style={{ width: Headerwidths.time, textAlign: "center", marginLeft: '20px' }}>마지막 시간</div>
            <div style={{ width: Headerwidths.name, textAlign: "center", marginLeft: '20px' }}>센서명</div>
            <div style={{ width: Headerwidths.value, textAlign: "center", marginLeft: '20px' }}>실시간 데이터</div>
            <div style={{ width: Headerwidths.empty }}></div>
          </ListHeader>
          <ListContainer>
            {items.length === 0 ? (
              <ListEmptyWrapper>
                  <ListEmptyIcon src={iconOpenBox} alt="emptyData" />
                  <ListEmptyLabel>해당 디바이스에 표시할 실시간 데이터가 없습니다.</ListEmptyLabel>
              </ListEmptyWrapper>
            ) : (
            <ContentWrapper>
              {items.map((item, index) => (
                <ListItem key={index}>
                  <ListItemField style={{ width: widths.index, textAlign: "center", marginLeft: '20px' }}>{item.index}</ListItemField>
                  <ListItemField style={{ width: widths.time, textAlign: "center", marginLeft: '20px' }}>{item.time}</ListItemField>
                  <ListItemField style={{ width: widths.name, textAlign: "center", marginLeft: '20px' }}>{item.name}</ListItemField>
                  <ListItemField style={{ width: widths.value, textAlign: "center", marginLeft: '20px' }}>{item.value}</ListItemField>
                  <ListItemField style={{ width: widths.empty }}></ListItemField>
                </ListItem>
              ))}
            </ContentWrapper>
            )}
          </ListContainer>
        </RealDataContainer>
      </SubContainer>
      <SystemLog />
    </Container>
  );
}

export default RealTimeData;
