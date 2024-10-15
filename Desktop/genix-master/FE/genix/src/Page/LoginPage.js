import React, { useState, useEffect } from "react";
import styled from "styled-components";

import baseImg from "../images/login_bg.png";

import SystemLogo from "../Component/LOGIN/Logo";
import LoginArea from "../Component/LOGIN/Login";
import { verifyTokens } from "../utils/tokenUtils.js";
import { useNavigate } from "react-router-dom";
import Instance from "../Variable/Instance.js";

const Background = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(${baseImg});
    background-size: cover;
    background-repeat: no-repeat;
    background-position: top center;
    background-attachment: fixed;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`

function LoginPage() {
    const navigate = useNavigate();
    useEffect(() => {
        console.log(`AutoLogin : ${localStorage.getItem('AutoLogin')}`);
        if (localStorage.getItem('AutoLogin') === 'true') {
            //console.log(`Instance.loginstate = ${Instance.loginstate}`);

            if (Instance.loginstate === false) {    // autologin O, Login X
                Instance.loginstate = true;
            }
        }
        verifyTokens(navigate);

    }, []);

    return (
        <Background>
            <SystemLogo />
            <LoginArea />
        </Background>
    )
}

export default LoginPage;