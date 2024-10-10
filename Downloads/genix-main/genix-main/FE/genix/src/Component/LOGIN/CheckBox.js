import React from "react";
import styled from "styled-components";
import { useState } from "react";
import GlobalStyles from "../../styles/fonts/GlobalStyles";
import Instance from "../../Variable/Instance.js";

const CheckboxContainer = styled.div`
    width: 10vmax;
    display: flex;
    flex-direction: row;
    margin-right: 12vmax;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
    border: 0;
    clip: rect(0 0 0 0);
    height: 10%;
    margin: -10%;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 10%;
`;

const StyledCheckbox = styled.div`
    display: inline-block;
    width: 1vmax;
    height: 1vmax;
    border-radius: 50%;
    background: transparent;
    border: 0.07vmax solid white;
    transition: all 150ms;
    position: relative;
    cursor: pointer;

    &:after {
        content: '✔';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.6vmax;
        color: white;
    }

    ${HiddenCheckbox}:checked + & {
        background: white;

        &::after {
            color: black;
        }
    }
`;

const Text = styled.div`
    font-family: 'Pretendard', sans-serif;
    font-weight: 200;
    color: white;
    font-size: 0.8vmax;
    user-select: none;
    margin-left: 1vmax;
    cursor: pointer;
`;

const Checkbox = ({ className, checked, onChange }) => (
        <CheckboxContainer onClick={onChange}>
            <HiddenCheckbox checked={checked} readOnly />
            <StyledCheckbox checked={checked} />
            <GlobalStyles/>
            <Text>로그인 상태 유지</Text>
        </CheckboxContainer>
);

function CheckBox () {
    const [checked, setChecked] = useState(false);

    const handleCheckboxChange = () => {
        setChecked(!checked);
        localStorage.setItem('AutoLogin',!checked);
    };

    return (
        <div className="CheckBox">
            <Checkbox checked={checked} onChange={handleCheckboxChange}/>
        </div>
    );
}

export default CheckBox;