import React, { useCallback, useState, useEffect } from "react";
import styled from "styled-components";
import DropdownBox from "./DropBox";
import Instance from "../../Variable/Instance.js";
import InformationModal from "./InformationModal.js";

const ModalBackground = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 반투명한 검정 배경 */
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 모달보다 위에 위치 */
`;
const ModalContainer = styled.div`
  width: 30%;
  min-height: 65%;
  max-height: 90%;
  background: linear-gradient(to bottom, #006ab3 24%, #002e4d 69%);
  padding: 2vmax;
  border-radius: 1vmax;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: baseline;
`;
const ModalContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const ModalTitle = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 1.8vmax;
  color: white;
  margin-bottom: 2vmax;
`;
const DataContainer = styled.div`
  width: 100%;
  height: 2.3vmax;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5vmax;
`;
const DataName = styled.div`
  display: flex;
  column-gap: 2.5px;
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 1.1vmax;
  color: white;
  min-width: 120px;
`;
const DataInput = styled.input`
  width: 68%;
  height: 100%;
  padding-left: 1vmax;
  margin-left: 0.6vmax;
  background-color: #011428;
  display: flex;
  align-items: center;
  justify-content: baseline;
  font-family: "Pretendard", sans-serif;
  font-weight: 300;
  font-size: 1vmax;
  color: white;
  border-radius: 0.4vmax;
  border: none;
`;
const BtnContainer = styled.div`
  width: 60%;
  height: 10%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5vmax;
`;
const SaveBtn = styled.button`
  width: 45%;
  height: 100%;
  background: linear-gradient(to bottom, #56b4ff 0%, #0088f4 100%);
  border-radius: 0.5vmax;
  padding: 0.5vmax;
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 1.2vmax;
  color: white;
  cursor: pointer;
  border: none;
  &:hover {
    background: linear-gradient(to bottom, #067ede 0%, #0862a9 100%);
  }
`;
const CancelBtn = styled.button`
  width: 45%;
  height: 100%;
  background: none;
  border: 0.05vmax solid white;
  border-radius: 0.5vmax;
  padding: 0.5vmax;
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 1.2vmax;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #456c86;
  }
`;

const Required = styled.span`
  display: flex;
  color: red;
`;

const Modal = ({ isOpen, onClose, selectedItem: initialSelectedItem }) => {
  const [selectedItem, setSelectedItem] = useState({
    id: "",
    deviceType: "",
    deviceName: "",
    deviceInfo: "",
    sensorCount: "",
    latitude: "",
    longitude: "",
    location: "",
    endpoint: "",
  });
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleOpenInformationModal = (value) => {
    Instance.InformationMSG = value;
    setIsInfoModalOpen(true);
  };

  const handleCloseInfomationModal = () => {
    setIsInfoModalOpen(false);
  };

  const MAX_VALUE = 50;
  const MIN_VALUE = 1;

  useEffect(() => {
    if (initialSelectedItem) {
      setSelectedItem({
        id: initialSelectedItem.id || "",
        deviceType: initialSelectedItem.deviceType || "",
        deviceName: initialSelectedItem.deviceName || "",
        deviceInfo: initialSelectedItem.deviceInfo || "",
        sensorCount: initialSelectedItem.sensorCount || "",
        latitude: initialSelectedItem.latitude || "",
        longitude: initialSelectedItem.longitude || "",
        location: initialSelectedItem.location || "",
        endpoint: initialSelectedItem.endpoint || "",
      });
    }
  }, [initialSelectedItem]);

  const dropboxChange = (event) => {
    setSelectedItem({
      ...selectedItem,
      deviceType: event.target.value || "",
    });
  };

  const handleDeviceNameChange = (event) => {
    setSelectedItem({
      ...selectedItem,
      deviceName: event.target.value || "",
    });
  };

  const handleDeviceInfoChange = (event) => {
    setSelectedItem({
      ...selectedItem,
      deviceInfo: event.target.value || "",
    });
  };

  const handleSensorCountChange = (event) => {
    setSelectedItem({
      ...selectedItem,
      sensorCount: event.target.value || "",
    });
  };

  // function func_handleSensorCountChange = (event) => {
  //   setSelectedItem({
  //     ...selectedItem,
  //     sensorCount: event.target.value || ""
  //   });
  // };

  const handleLatitudeChange = (event) => {
    setSelectedItem({
      ...selectedItem,
      latitude: event.target.value || "",
    });
  };

  const handleLongitudeChange = (event) => {
    setSelectedItem({
      ...selectedItem,
      longitude: event.target.value || "",
    });
  };

  const handleLocationChange = (event) => {
    setSelectedItem({
      ...selectedItem,
      location: event.target.value || "",
    });
  };

  const handleEndpointChange = (event) => {
    setSelectedItem({
      ...selectedItem,
      endpoint: event.target.value || "",
    });
  };

  if (!isOpen) return null;

  const isValid = () => {
    if (
      selectedItem?.deviceType === "" ||
      selectedItem?.deviceName === "" ||
      selectedItem?.deviceInfo === "" ||
      selectedItem?.sensorCount === "" ||
      selectedItem?.endpoint === ""
    ) {
      return false;
    }
    return true;
  };

  const isValidEndpoint = () => {
    const regex =
      /(mqtt|opc\.tcp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regex.test(selectedItem.endpoint);
  };

  const OnClickSave = () => {
    if (!isValid()) {
      handleOpenInformationModal("필수 항목을 입력해주세요.");
      return false;
    }

    if (!isValidEndpoint()) {
      handleOpenInformationModal("네트워크 주소를 올바르게 입력하세요.");
      return;
    }

    fetch(`${Instance.SVR_URL}/device/modifyDevice`, {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        DEV_TYPE_ID: selectedItem.deviceType,
        DEV_NAME: selectedItem.deviceName,
        DEV_DETAIL: selectedItem.deviceInfo,
        SEN_CNT: selectedItem.sensorCount,
        LOC_LATI: selectedItem.latitude,
        LOC_LONG: selectedItem.longitude,
        LOC_ADDR: selectedItem.location,
        DEV_ID: selectedItem.id,
        DEV_ENDPOINT: selectedItem.endpoint,
      }),
    })
      .then((response) => response.text())
      .then((data) => {
        if (data === "success") {
          window.location.reload();
        }
      });
  };

  function changeCnt(value) {
    if (value > 50) {
      setSelectedItem({
        ...selectedItem,
        sensorCount: MAX_VALUE || "",
      });
    } else if (value < 1) {
      setSelectedItem({
        ...selectedItem,
        sensorCount: MIN_VALUE || "",
      });
    } else {
      setSelectedItem({
        ...selectedItem,
        sensorCount: value || "",
      });
    }
  }

  return (
    <ModalBackground $isOpen={isOpen}>
      <ModalContainer>
        <ModalContent>
          <ModalTitle>장치 수정</ModalTitle>
          <DataContainer>
            <DataName>
              장치 구분<Required>*</Required>
            </DataName>
            <DropdownBox
              value={selectedItem.deviceType}
              onChange={dropboxChange}
            />
          </DataContainer>
          <DataContainer>
            <DataName>
              장치명<Required>*</Required>
            </DataName>
            <DataInput
              value={selectedItem.deviceName}
              onChange={handleDeviceNameChange}
              readOnly={false}
            />
          </DataContainer>
          <DataContainer>
            <DataName>
              장치 정보<Required>*</Required>
            </DataName>
            <DataInput
              value={selectedItem.deviceInfo}
              onChange={handleDeviceInfoChange}
              readOnly={false}
            />
          </DataContainer>
          <DataContainer>
            <DataName>
              센서 수량<Required>*</Required>
            </DataName>
            <DataInput
              type="number"
              value={selectedItem.sensorCount}
              onChange={(e) => {
                handleSensorCountChange(e);
                changeCnt(e.target.value);
              }}
              readOnly={false}
            />
          </DataContainer>
          <DataContainer>
            <DataName>위도</DataName>
            <DataInput
              value={selectedItem.latitude}
              onChange={handleLatitudeChange}
              readOnly={false}
            />
          </DataContainer>
          <DataContainer>
            <DataName>경도</DataName>
            <DataInput
              value={selectedItem.longitude}
              onChange={handleLongitudeChange}
              readOnly={false}
            />
          </DataContainer>
          <DataContainer>
            <DataName>위치</DataName>
            <DataInput
              value={selectedItem.location}
              onChange={handleLocationChange}
              readOnly={false}
            />
          </DataContainer>
          <DataContainer>
            <DataName>
              네트워크 주소<Required>*</Required>
            </DataName>
            <DataInput
              value={selectedItem.endpoint}
              onChange={handleEndpointChange}
              readOnly={false}
            />
          </DataContainer>
          <BtnContainer>
            <SaveBtn onClick={OnClickSave}>Save</SaveBtn>
            <CancelBtn onClick={onClose}>Cancel</CancelBtn>
          </BtnContainer>
        </ModalContent>
      </ModalContainer>
      {isInfoModalOpen && (
        <InformationModal onClickCloseButton={handleCloseInfomationModal} />
      )}
    </ModalBackground>
  );
};

export default Modal;
