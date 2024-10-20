import React, { useState, useCallback } from "react";
import styled from "styled-components";
import DropdownBox from "./DropBox";
import Instance from "../../Variable/Instance.js";
import InformationModal from "./InformationModal.js";

const NewModalBG = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 반투명한 검정 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1; /* 모달보다 위에 위치 */
`;
const NewModalContainer = styled.div`
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
const NewModalContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const NewModalTitle = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 1.8vmax;
  color: white;
  margin-bottom: 2vmax;
`;
const NewDataContainer = styled.div`
  width: 100%;
  height: 2.3vmax;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5vmax;
`;
const NewDataName = styled.div`
  display: flex;
  column-gap: 2.5px;
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 1.1vmax;
  color: white;
  min-width: 120px;
`;
const NewDataInput = styled.input`
  width: 68%;
  height: 100%;
  padding-left: 1vmax;
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
const NewBtnContainer = styled.div`
  width: 60%;
  height: 10%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5vmax;
`;
const NewSaveBtn = styled.button`
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
    opacity: 0.8;
  }
`;
const NewCancelBtn = styled.button`
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
    opacity: 0.8;
  }
`;

const Required = styled.span`
  display: flex;
  color: red;
`;

const NewModal = ({ onModalClose }) => {
  const [devType, setDevType] = useState("");
  const [devName, setDevName] = useState("");
  const [devDetail, setDevDetail] = useState("");
  const [senCnt, setSenCnt] = useState("");
  const [locLati, setLocLati] = useState("");
  const [locLong, setLocLong] = useState("");
  const [locAddr, setLocAddr] = useState("");
  const [devEndpoint, setDevEndpoint] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleOpenInformationModal = (value) => {
    Instance.InformationMSG = value;
    setIsInfoModalOpen(true);
  };

  const handleCloseInfomationModal = () => {
    setIsInfoModalOpen(false);
  };

  var dev_type = 1;

  const MAX_VALUE = 50;
  const MIN_VALUE = 1;

  const isValid = useCallback(() => {
    // devType은 디폴트로 '' 상태에서 1로 변경되므로 체크 로직에서 생략
    if (
      devName === "" ||
      devDetail === "" ||
      senCnt === "" ||
      devEndpoint === ""
    ) {
      return false;
    }
    return true;
  }, [devName, devDetail, senCnt, devEndpoint]);

  const isValidEndpoint = useCallback(() => {
    const regex =
      /(mqtt|opc\.tcp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regex.test(devEndpoint);
  });

  function onClickSave() {
    console.log(devType);
    if (!isValid()) {
      handleOpenInformationModal("필수 항목을 입력해주세요.");
      return false;
    }
    if (!isValidEndpoint()) {
      handleOpenInformationModal("네트워크 주소를 올바르게 입력하세요.");
      return;
    }
    switch (devType) {
      case "MQTT":
        dev_type = 1;
        break;
      case "UART":
        dev_type = 2;
        break;
      case "OPC-UA":
        dev_type = 3;
        break;
      default:
        dev_type = 1;
    }
    console.log(`dev_type : ${dev_type} / devName : ${devName} / devDetail : ${devDetail} / senCnt : ${senCnt} / locLati : ${locLati} / 
            locLong : ${locLong} / locAddr : ${locAddr} / devEndpoint : ${devEndpoint} / `);
    fetch(`${Instance.SVR_URL}/device/addDevice`, {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        DEV_TYPE_ID: dev_type,
        DEV_NAME: devName,
        DEV_DETAIL: devDetail,
        SEN_CNT: senCnt,
        LOC_LATI: locLati,
        LOC_LONG: locLong,
        LOC_ADDR: locAddr,
        DEV_ENDPOINT: devEndpoint,
      }),
    })
      .then((respon) => respon.text())
      .then((data) => {
        if (data === "success") {
          //onClose();
          window.location.reload();
        }
        Instance.selectedID = null;
      });
  }

  function changeCnt(value) {
    if (value > 50) {
      setSenCnt(MAX_VALUE);
    } else if (value < 1) {
      setSenCnt(MIN_VALUE);
    } else {
      setSenCnt(value);
    }
  }

  return (
    <NewModalBG>
      <NewModalContainer>
        <NewModalContent>
          <NewModalTitle>장치 추가</NewModalTitle>
          <NewDataContainer>
            <NewDataName>
              장치 구분<Required>*</Required>
            </NewDataName>
            <DropdownBox
              onChange={(e) => setDevType(e.target.value)}
              value={devType}
            />
          </NewDataContainer>
          <NewDataContainer>
            <NewDataName>
              장치명<Required>*</Required>
            </NewDataName>
            <NewDataInput
              onChange={(e) => setDevName(e.target.value)}
              value={devName}
            />
          </NewDataContainer>
          <NewDataContainer>
            <NewDataName>
              장치 정보<Required>*</Required>
            </NewDataName>
            <NewDataInput
              onChange={(e) => setDevDetail(e.target.value)}
              value={devDetail}
            />
          </NewDataContainer>
          <NewDataContainer>
            <NewDataName>
              센서 수량<Required>*</Required>
            </NewDataName>
            <NewDataInput
              type="number"
              onChange={(e) => {
                setSenCnt(e.target.value);
                changeCnt(e.target.value);
              }}
              value={senCnt}
              min="1"
              max="50"
            />
          </NewDataContainer>
          <NewDataContainer>
            <NewDataName>위도</NewDataName>
            <NewDataInput
              onChange={(e) => setLocLati(e.target.value)}
              value={locLati}
            />
          </NewDataContainer>
          <NewDataContainer>
            <NewDataName>경도</NewDataName>
            <NewDataInput
              onChange={(e) => setLocLong(e.target.value)}
              value={locLong}
            />
          </NewDataContainer>
          <NewDataContainer>
            <NewDataName>위치</NewDataName>
            <NewDataInput
              onChange={(e) => setLocAddr(e.target.value)}
              value={locAddr}
            />
          </NewDataContainer>
          <NewDataContainer>
            <NewDataName>
              네트워크 주소<Required>*</Required>
            </NewDataName>
            <NewDataInput
              onChange={(e) => setDevEndpoint(e.target.value)}
              value={devEndpoint}
            />
          </NewDataContainer>
          <NewBtnContainer>
            <NewSaveBtn onClick={onClickSave}>Save</NewSaveBtn>
            <NewCancelBtn onClick={onModalClose}>Cancel</NewCancelBtn>
          </NewBtnContainer>
        </NewModalContent>
      </NewModalContainer>
      {isInfoModalOpen && (
        <InformationModal onClickCloseButton={handleCloseInfomationModal} />
      )}
    </NewModalBG>
  );
};

export default NewModal;
