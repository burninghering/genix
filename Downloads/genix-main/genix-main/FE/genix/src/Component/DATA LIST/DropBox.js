import React from 'react';
import styled from 'styled-components';

const SelectContainer = styled.div`
    position: relative;
    margin-left: 1vmax;
    background-color: #011428;
    border-radius: 0.4vmax;
    display: flex;
`;

const Select = styled.select`
    width: 21.5vmax;
    height: 2.3vmax;
    padding-left: 1vmax;
    padding-right: 3vmax; /* 오른쪽 여백 추가 */
    background-color: #011428;
    font-family: 'Pretendard', sans-serif;
    font-weight: 300;
    font-size: 1vmax;
    color: white;
    border: none;
    border-radius: 0.4vmax;
    appearance: none;
    -webkit-appearance: none; /* 사파리 브라우저 호환성 */
    -moz-appearance: none; /* 파이어폭스 브라우저 호환성 */
`;

const Arrow = styled.div`
    position: absolute;
    top: 50%;
    right: 1vmax;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 0.vmax;
    color: white;
`;

const DropdownBox = ({ value, onChange }) => {
    return (
        <SelectContainer>
            <Select value={value} onChange={onChange}>
                <option value="MQTT">MQTT</option>
                <option value="OPC-UA">OPC-UA</option>
            </Select>
            <Arrow>▼</Arrow>
        </SelectContainer>
    );
};

export default DropdownBox;
