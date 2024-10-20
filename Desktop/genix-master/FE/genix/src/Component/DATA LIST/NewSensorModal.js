import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import DropdownBox from "./DropBox";
import Instance from "../../Variable/Instance.js";
import InformationModal from "./InformationModal.js";
import { SquareMinus, SquarePlus } from 'lucide-react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const sensorSchema = z.object({
  SEN_ID: z.number({
    required_error: '센서ID는 필수항목입니다.',
    invalid_type_error: '센서ID는 숫자로 입력하세요.'
  }).min(0, { message: '센서 카운트는 0부터 입력해주세요.' }),
  SEN_NAME: z.string({ message: '센서명을 입력하세요.'}).nonempty({ message: '센서명은 필수항목입니다.' }),
});

const sensorsSchema = z.object({
  sensors: z.array(sensorSchema),
})

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
const NewModalForm = styled.form`
  width: 30%;
  height: 43%;
  max-height: 45%;
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
  height: 100%;
  display: grid;
  grid-template-rows: 60px auto 44px;
`;
const NewModalTitle = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  text-align: center;
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
`;
const NewDataContainerGroup = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: auto 64px;
  background: #dfe3e724;
  border-radius: 6px;
  padding: 0.8vmax;
  box-sizing: border-box;
  &:not(:first-child) {
    margin: 0.8vmax 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
  `;
const FlexWrapWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 6px;
  align-items: center;
`;
const FlexWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
`;
const FlexWrapperButton = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: right;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    opacity: 0.8;
  }
`;
const InvalidMessage = styled.div`
  display: flex;  
  font-size: 14px;
  font-weight: 600;
  color: red;
  width: 100%;
  height: 100%;
  padding-left: 1vmax;
  margin-left: 1vmax;
`;
const NewDataName = styled.div`
  display: flex;
  column-gap: 2.5px;
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 1.1vmax;
  color: white;
  min-width: 90px;
`;
const NewDataInput = styled.input`
  width: 68%;
  height: 100%;
  padding-left: 1vmax;
  margin-left: 1vmax;
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
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
  line-height: 0.8vmax;
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
  line-height: 0.8vmax;
  &:hover {
    opacity: 0.8;
  }
`;

const NewInputFields = styled.div`
  overflow-y: auto;
  padding-right: 0.4vmax;
  margin-bottom: 14px;
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

const Required = styled.span`
  display: flex;
  color: red;
`;

const NewSensorModal = ({ onModalClose }) => {
  const [isEditMode, setIsEditMode] = useState(false); // 수정 모드인지 boolean 
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(sensorsSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sensors',
  });

  const decorationFields = useCallback((bodyFields) => {
    return bodyFields.map((f, index) => {
      return {
        DEV_ID: Instance.selectedID,
        SEN_ID: f.SEN_ID,
        SEN_NAME: f.SEN_NAME,        
      }
    })
  }, []);

  const handleOpenInformationModal = useCallback((value) => {
    Instance.InformationMSG = value;
    setIsInfoModalOpen(true);
  }, [setIsInfoModalOpen]);

  const handleCloseInfomationModal = () => {
    setIsInfoModalOpen(false);
  };

  const handleSubmitCallback = useCallback(({ status, isEditMode }) => {
    const label = isEditMode ? '수정' : '등록';
    if (status === 200) {
      handleOpenInformationModal(`${label}을 완료하였습니다.`)
      setTimeout(() => {
        handleCloseInfomationModal();
        onModalClose();
      }, 1500);
    } else {
      throw new Error(`${label}에 실패하였습니다.`)
    }
  }, [handleOpenInformationModal]);

  const handleSubmitForm = useCallback((submittedFields) => {
    const sensorFields = decorationFields(submittedFields);
    if (isEditMode) {
      fetch(`${Instance.SVR_URL}/device/updateSensor`, {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sensorFields),
      })
      .then((res) => {
        handleSubmitCallback({ status: res.status, isEditMode});
      })
      .catch(error => console.error('Error Insert data:', error));
    } else {
      fetch(`${Instance.SVR_URL}/device/insertSensor`, {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sensorFields),
      })
      .then((res) => {
        handleSubmitCallback({ status: res.status, isEditMode});
      })
      .catch(error => console.error('Error Update data:', error));
    }
  }, [isEditMode, fields, decorationFields]) 
  
  const onSubmit = (data) => {
    handleSubmitForm(data.sensors);
  }

  useEffect(() => {
    fetch(`${Instance.SVR_URL}/device/getSensor`, {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        DEV_ID: Instance.selectedID,
      }),
    })
      .then(res => res.status === 200 ? res.json() : null)
      .then(sensors => {
        if (sensors === null) {
          setIsEditMode(false);
          reset({
            sensors: [{
              SEN_ID: null,
              SEN_NAME: null,
            }]
          })
          return;
        }
        const sensorFields = sensors.map((sensor) => {
          const { SEN_ID, SEN_NAME } = sensor;
          return {
            SEN_ID,
            SEN_NAME
          };
        });
        setIsEditMode(true);
        reset({
          sensors: sensorFields
        })
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [setIsEditMode, reset]);


  return (
    <NewModalBG>
      <NewModalForm onSubmit={handleSubmit(onSubmit)}>
        <NewModalContent>
          <NewModalTitle>센서 관리</NewModalTitle>
          <NewInputFields>
            {fields.map((f, index) => {
              return (
                <NewDataContainerGroup key={f.id} className="ooooo">
                  <FlexWrapWrapper>
                    <NewDataContainer>
                      <NewDataName>
                        센서 ID<Required>*</Required>
                      </NewDataName>
                      <Controller
                        name={`sensors.${index}.SEN_ID`}
                        control={control}
                        render={({ field }) => (
                          <NewDataInput
                            type="number"
                            min={0}
                            placeholder="예) 1"
                            {...field}
                            { ...register(`sensors.${index}.SEN_ID`, { valueAsNumber: true } ) } 
                          />
                        )}
                      />
                    </NewDataContainer>
                    <NewDataContainer>
                      <NewDataName>
                        센서 명<Required>*</Required>
                      </NewDataName>
                      <Controller
                        name={`sensors.${index}.SEN_NAME`}
                        control={control}
                        render={({ field }) => (
                          <NewDataInput
                            type="text"
                            placeholder="예) TCRT5000"
                            {...field}
                          />
                        )}
                      />
                    </NewDataContainer>
                    {errors && errors.sensors && errors.sensors[index] && (
                      <NewDataContainer>
                        <NewDataName />
                        <InvalidMessage>
                          {errors.sensors[index].SEN_ID && errors.sensors[index].SEN_ID?.message}<br />
                          {errors.sensors[index].SEN_NAME?.message}
                        </InvalidMessage>
                      </NewDataContainer>
                    )}
                  </FlexWrapWrapper>
                  <FlexWrapper style={{ marginLeft: '10px' }}>
                    {index !== 0 && (
                      <FlexWrapperButton onClick={() => {
                        remove(index)
                      }}>
                        <SquareMinus stroke="white" strokeWidth={1.2} />
                      </FlexWrapperButton>
                    )}
                    {index + 1 === fields.length && (
                      <FlexWrapperButton onClick={() => append({ SEN_ID: null, SEN_NAME: null })}>
                        <SquarePlus stroke="white" strokeWidth={1.2} />
                      </FlexWrapperButton>
                    )}
                  </FlexWrapper>
                </NewDataContainerGroup>
              )
            })}
          </NewInputFields>
          <NewBtnContainer>
            <NewSaveBtn type="submit">Save</NewSaveBtn>
            <NewCancelBtn onClick={onModalClose}>Cancel</NewCancelBtn>
          </NewBtnContainer>
        </NewModalContent>
      </NewModalForm>
      {isInfoModalOpen && (
        <InformationModal onClickCloseButton={handleCloseInfomationModal} />
      )}
    </NewModalBG>
  );
};

export default NewSensorModal;
