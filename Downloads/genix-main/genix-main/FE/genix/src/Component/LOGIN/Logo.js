import React from "react";
import styled from "styled-components";
import GlobalStyles from "../../styles/fonts/GlobalStyles";

import genixlogo from "../../images/Genix_Data Server_logo.svg"

const Box = styled.div`
    width: 50%;
    height: 55vmax;
    display: flex;
    flex-direction: row;
    justify-content: center;
`

const Logo = styled.div`
    position: relative;
    width: 60%;
    height: 60%;
    display: flex;
    flex-direction: column;
    padding-top: 10vmax;
`

const LogoText = styled.div`
    color: white;
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    font-size: 1.1vmax;
    padding-left: 3.6vmax;
    padding-top: 3vmax;

`

function SystemLogo() {

    return (
        <Box>
            <Logo>
                <img className="logoimg" src={genixlogo} alt="Genix"/>
                <GlobalStyles/>
                <LogoText>효율적으로 데이터와 장비를 관리하고 표출하는,<br/>통합 데이터플랫폼</LogoText>
            </Logo>
        </Box>
    )
}

export default SystemLogo;