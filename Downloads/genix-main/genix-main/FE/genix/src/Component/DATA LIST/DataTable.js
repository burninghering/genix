import React, { useEffect, useState } from "react";
import styled from "styled-components";
import io from 'socket.io-client';
import Modal from "./Modal";
import Instance from "../../Variable/Instance.js";
import { initializeSocket, disconnectSocket } from '../../utils/socketUtils.js';

const WholeContainer = styled.div`
`
const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 81vmax;
    height: 23vmax;
    background-color: #002E4D;
    border-radius: 1vmax;
    padding-left: 1vmax;
    padding-right: 0.5vmax;
    padding-top: 0.6vmax;
    padding-bottom: 1vmax;
`
const ListHeader = styled.div`
    width: 77.2vmax;
    height: 0.3vmax;
    display: flex;
    position: sticky;
    top: 0;
    z-index: 1;
    align-items: center;
    justify-content: space-between;
    padding: 1vmax;
    background-color: #001421;
    color: white;
    font-family: 'Pretendard', sans-serif;
    font-size: 1vmax;
    font-weight: 500;
    border-radius: 0.5vmax;
    margin-bottom: 0.5vmax;
    
`
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
`
const ContentWrapper = styled.div`
    height: 21vmax;
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
`
const ListItem = styled.div`
    width: 78.1vmax;
    height: 0.3vmax;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 0.01vmax solid white;
    border-radius: 0.5vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.9vmax;
    font-weight: 300;
    color: white;
    margin-bottom: 0.5vmax;
    padding: 1vmax 0.5vmax;
    background-color: ${({ $isSelected}) => ($isSelected ? 'rgba(0, 136, 244, 1)' : 'transparent')};
    cursor: pointer;
    &:hover {
      background-color: ${({ $isSelected}) => ($isSelected ? 'rgba(0, 136, 244, 1)' : 'rgba(255, 255, 255, 0.05)')};
    }
`

const ListItemFieldTitle = styled.div`
    text-align: center;
    margin: 0 4px;
`

const ListItemField = styled.div`
    text-align: center;
    /* 아래는 ellipsis 처리 */
    white-space: nowrap;
    overflow: hidden; 
    text-overflow: ellipsis; 
    margin: 0 4px;
`
const Titlewidths = {
    id: '2%',
    deviceType: '8%',
    status: '8%',
    deviceName: '9%',
    deviceInfo: '18%',
    sensorCount: '8%',
    latitude: '10%',
    longitude: '10%',
    location: '29%',
}
const widths = {
    id: '2%',
    deviceType: '8%',
    status: '8%',
    deviceName: '9%',
    deviceInfo: '18%',
    sensorCount: '8%',
    latitude: '10%',
    longitude: '10%',
    location: '29%',
}
const fields = [
    { name: 'ID', key: 'id', width: Titlewidths.id },
    { name: '장치 구분', key: 'deviceType', width: Titlewidths.deviceType },
    { name: '상태', key: 'status', width: Titlewidths.status },
    { name: '장치명', key: 'deviceName', width: Titlewidths.deviceName },
    { name: '장치 정보', key: 'deviceInfo', width: Titlewidths.deviceInfo },
    { name: '센서 수량', key: 'sensorCount', width: Titlewidths.sensorCount },
    { name: '위도', key: 'latitude', width: Titlewidths.latitude },
    { name: '경도', key: 'longitude', width: Titlewidths.longitude },
    { name: '위치', key: 'location', width: Titlewidths.location },
]

function DataTable() {
    const [dataSet, setDataSet] = useState([]);
    const [flag, setFlag] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [clickTimeout, setClickTimeout] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
      if (!flag) {
        console.log("Load Devices()");
        fetch(`${Instance.SVR_URL}/device`, {
          method: "post",
          headers: { "content-type": "application/json" },
        })
          .then(res => res.json())
          .then(data => {
            const transformedData = data.map(device => {
              let device_Type = null;
              switch (device.DEV_TYPE_ID) {
                case 1:
                  device_Type = "MQTT";
                  break;
                case 2:
                  device_Type = "UART";
                  break;
                case 3:
                  device_Type = "OPC-UA";
                  break;
                default:
                  device_Type = "Unknown";
                  break;
              }
              let deviceStatus = null;
              switch (device.DEV_STATUS_ID) {
                case 1:
                  deviceStatus = "ON";
                  break;
                case 2:
                  deviceStatus = "OFF";
                  break;
                default:
                  deviceStatus = "Unknown";
                  break;
              }
  
              return {
                id: device.ID,
                deviceType: device_Type,
                status: deviceStatus,
                deviceName: device.DEV_NAME,
                deviceInfo: device.DEV_DETAIL,
                sensorCount: device.SEN_CNT,
                latitude: device.LOC_LATI,
                longitude: device.LOC_LONG,
                location: device.LOC_ADDR,
                endpoint: device.DEV_ENDPOINT
              };
            });
  
            setDataSet(transformedData);
            setFlag(true);
          })
          .catch(error => console.error('Error fetching data:', error));
      }
    }, [flag]);
  
    // useEffect(() => {
    //   const socket = io(`${Instance.SVR_URL}`);
    //   socket.on('sensorState', (updatedStatus) => {
    //     const statusArray = updatedStatus.split(',').map(status => {
    //       switch (status) {
    //         case '1': return 'ON';
    //         case '2': return 'OFF';
    //         default: return 'Unknown';
    //       }
    //     });
  
    //     setDataSet(prevDataSet =>
    //       prevDataSet.map((item, index) => ({
    //         ...item,
    //         status: statusArray[index] || item.status // index에 해당하는 상태가 없으면 기존 상태 유지
    //       }))
    //     );
    //   });
  
    //   return () => {
    //     socket.disconnect();
    //   };
    // }, []);
    useEffect(() => {
      const handleUpdateStateData = (statusArray) => {
          setDataSet(prevDataSet =>
              prevDataSet.map((item, index) => ({
                  ...item,
                  status: statusArray[index] || item.status
              }))
          );
      };

      // Initialize socket connection for device state updates
      initializeSocket(handleUpdateStateData, 'sensorState');

      return () => {
          disconnectSocket();
      };
  }, []);
    const handleItemClick = (item) => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setSelectedItem(item);
        setClickTimeout(null);
        handleItemDoubleClick(item);
        Instance.selectedID = null;
      } else {
        setClickTimeout(
          setTimeout(() => {
            setSelectedItem(item.id);
            setClickTimeout(null);
            Instance.selectedID = item.id;
          }, 200)
        );
      }
    }
    const handleItemDoubleClick = (item) => {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
    const handleCloseModaal = () => {
      setIsModalOpen(false);
    }    

    return (
      <WholeContainer>
        <Container>
          <ListHeader>
            {fields.map((field, index) => (
              <ListItemFieldTitle key={index} style={{ width: field.width }}>
                {field.name}
              </ListItemFieldTitle>
            ))}
          </ListHeader>
          <ListContainer>
            <ContentWrapper>
              {
                dataSet.map((item, index) => (
                  <ListItem
                  key={index}
                  $isSelected={selectedItem === item.id}
                  onClick={()=>{handleItemClick(item);}}>
                    <ListItemField style={{ width: widths.id }}>{item.id}</ListItemField>
                    <ListItemField style={{ width: widths.deviceType }}>{item.deviceType}</ListItemField>
                    <ListItemField style={{ width: widths.status }}>{item.status}</ListItemField>
                    <ListItemField style={{ width: widths.deviceName }}>{item.deviceName}</ListItemField>
                    <ListItemField style={{ width: widths.deviceInfo }}>{item.deviceInfo}</ListItemField>
                    <ListItemField style={{ width: widths.sensorCount }}>{item.sensorCount}</ListItemField>
                    <ListItemField style={{ width: widths.latitude }}>{item.latitude}</ListItemField>
                    <ListItemField style={{ width: widths.longitude }}>{item.longitude}</ListItemField>
                    <ListItemField style={{ width: widths.location }}>{item.location}</ListItemField>
                  </ListItem>
                ))
              }
            </ContentWrapper>
          </ListContainer>
          <Modal isOpen={isModalOpen} onClose={handleCloseModaal} selectedItem={selectedItem}/>
        </Container>
      </WholeContainer>
    );
  }
  
  export default DataTable;