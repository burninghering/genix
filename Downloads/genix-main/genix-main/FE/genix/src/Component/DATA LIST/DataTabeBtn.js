import React, { useCallback, useState, useEffect } from "react";
import styled from "styled-components";
import Instance from "../../Variable/Instance.js";
import NewModal from "./NewModal.js";
import NewSensorModal from "./NewSensorModal.js";
import DeviceDeleteModal from "./DeviceDeleteModal.js";
import InformationModal from "./InformationModal.js";

const ButtonContainer = styled.div`
    width: 82.4vmax;
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5vmax;
    margin-bottom: 0.5vmax;
    z-index: 1;
`
const Button = styled.button`
    margin-left: 0.5vmax;
    padding: 0.5vmax 1.5vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.7vmax;
    font-weight: 500;
    border: none;
    border-radius: 0.5vmax;
    color: white;
    cursor: pointer;
`
const RunButton = styled(Button)`
    background-color: #52AE0A;
    &:hover {
        background-color: #448E09;
    }
`
const StopButton = styled(Button)`
    background-color: #AE3B0A;
    &:hover {
        opacity: 0.8;
    }
`
const AddButton = styled(Button)`
    background-color: #0088F4;
    &:hover {
        opacity: 0.8;
    }
`
const DeleteButton = styled(Button)`
    background-color: #FFA24C;
    &:hover {
        opacity: 0.8;
    }
`
const SensorButton = styled(Button)`
    background-color: #6482AD;
    padding: 0.5vmax 1vmax;
    &:hover {
        opacity: 0.8;
    }
`

function DataTableBtn() {

  const [isSensorCreateModalOpen, setIsSensorCreateModalOpen] = useState(false);
 
  const [isInfoModalOpen,setIsInfoModalOpen] = useState(false);
  const handleOpenInformationModal=(value) =>{
    Instance.InformationMSG = value;
    setIsInfoModalOpen(true);
  }
  const handlecloseInfomationModal=() =>{
    setIsInfoModalOpen(false);
  }

    //#region NewModal
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    const handleOpenNewModal = () => {
        setIsNewModalOpen(true);
    }

    const handleClickMappingSensor = useCallback(() => {
      console.log(Instance.selectedID)
      if (Instance.selectedID !== null) {
        setIsSensorCreateModalOpen(true);
      }
      else
      {
        Instance.InformationMSG = '센서를 추가할 장치를 선택해 주세요.';
        setIsInfoModalOpen(true);
      }
    }, [setIsSensorCreateModalOpen]);

    const handleCloseNewModal = () => {
        setIsNewModalOpen(false);
    }

    const handleCloseNewSensorModal = useCallback(() => {
      setIsSensorCreateModalOpen(false);
    }, [setIsSensorCreateModalOpen]);
    //#endregion
    //#region DeviceDeleteModal

    const [isDeviceDeleteModalOpen, setIsDeviceDeleteModalOpen] = useState(false);

    const handleOpenDeviceDeleteModal = () => {
      if (Instance.selectedID !== null) {
        setIsDeviceDeleteModalOpen(true);
      }
      else
      {
        Instance.InformationMSG = '삭제할 장치를 선택해 주세요.';
        setIsInfoModalOpen(true);
      }
    };
  
    const handleCloseDeviceDeleteModal = () => {
      setIsDeviceDeleteModalOpen(false);
    };
    //#endregion
    const [isListSelected, setIsListSelected] = useState(false);
  
    useEffect(() => {
      if (Instance.selectedID === null) {
        setIsListSelected(false);
      } else {
        setIsListSelected(true);
      }
    }, [Instance.selectedID]);

    function RunDevice() {
        console.log("Run");
        fetch(`${Instance.SVR_URL}/device/run`, {
            method: "post",
            headers: { "content-type": "application/json" },
        })
        .then((response) => {
          if (response.status !== 200) {
            return response.text().then((data) => {
              throw new Error(data || "서버측에서 에러가 발생하였습니다.");
            });
          }
          const successMessage = '데이터 수집이 시작되었습니다.';
          handleOpenInformationModal(successMessage);
        })
        .catch((error) => {
          if (error.message) {
            handleOpenInformationModal(error.message);
          }
        });
    }

    function StopDevice() {
        console.log("Stop");
        fetch(`${Instance.SVR_URL}/device/stop`, {
            method: "post",
            headers: { "content-type": "application/json" },
        })        
        .then((response) => {
          if (response.status !== 200) {
            return response.text().then((data) => {
              throw new Error(data || "서버측에서 에러가 발생하였습니다.");
            });
          }
          const successMessage = '데이터 수집이 종료되었습니다.';
          handleOpenInformationModal(successMessage);
        })
        .catch((error) => {
          if (error.message) {
            handleOpenInformationModal(error.message);
          }
        });
    }

    function OnClickDeleteButton() {
        console.log("DELETE");
        fetch(`${Instance.SVR_URL}/device/deleteDevice`, {
          method: "post",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            DEV_ID: Instance.selectedID,
          }),
        })
          .then((response) => response.text())
          .then((data) => {
            if (data === "success") {
              window.location.reload();
            }
            Instance.selectedID = null;
          });
        handleCloseDeviceDeleteModal();
      }

    return (
        <ButtonContainer>
            {isNewModalOpen && <NewModal onModalClose={handleCloseNewModal} />}
            {isSensorCreateModalOpen && <NewSensorModal onModalClose={handleCloseNewSensorModal} />}
            {isListSelected && isDeviceDeleteModalOpen && (
                <DeviceDeleteModal
                    onDeleteClick={OnClickDeleteButton}
                    onDeviceDeleteModalClose={handleCloseDeviceDeleteModal}
                />
            )}
            <RunButton onClick={RunDevice}>Run</RunButton>
            <StopButton onClick={StopDevice}>Stop</StopButton>
            <AddButton onClick={handleOpenNewModal}>Add</AddButton>
            <DeleteButton onClick={handleOpenDeviceDeleteModal}>Delete</DeleteButton>
            <SensorButton onClick={handleClickMappingSensor}>Add Sensor</SensorButton>
            {isInfoModalOpen && <InformationModal onClickCloseButton={handlecloseInfomationModal}/>}

        </ButtonContainer>
    )
}

export default DataTableBtn;