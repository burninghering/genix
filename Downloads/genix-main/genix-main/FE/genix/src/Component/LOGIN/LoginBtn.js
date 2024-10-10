import React from "react";
import styled from "styled-components";

import GlobalStyles from "../../styles/fonts/GlobalStyles";

const Btn = styled.button`
    width: 23vmax;
    height: 3.5vmax;
    border: none;
    border-radius: 0.3vmax;
    background-color: #0088F4;
    font-family: 'Pretendard', sans-serif;
    font-weight: 700;
    font-size: 1.5vmax;
    color: white;
    margin-top: 12px;
    cursor: pointer;
    &:hover {
        transform: scale(1.03);
        transition: 0.2s;
    }
`

function LoginButton ({onClick}) {
    return (
        <Btn onClick={onClick}>
            <GlobalStyles />
            로그인
        </Btn>
    );
}

export default LoginButton;