import React,{useEffect, useState} from "react";
import styled from "styled-components";
import io from 'socket.io-client';
import Instance from "../../Variable/Instance.js";
import { initializeSocket, disconnectSocket } from '../../utils/socketUtils.js';

const SystemLogContainer = styled.div`
    position: relative;
    width: 82.5vmax;
    min-height: 7vmax;
    max-height: 9vmax;
    /* height: 10vmax; */
    display: flex;
    flex-direction: column;
    background: none;
    border-radius: 0 0 0.4vmax 0.4vmax;
    bottom: 1.5vmax;
    z-index: 0;
`
const SystemLogTitle = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 10%;
    height: 2vmax;
    position: relative;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.9vmax;
    font-weight: 600;
    color: white;
    background-color: #002E4D;
    border-radius: 0.4vmax 0.4vmax 0 0;
    padding-top: 0.3vmax;
`
const LogContainer = styled.div`
    width: 81.5vmax;
    height: 100%;
    background-color: #002E4D;
    color: white;
    border-radius: 0 0.4vmax 0.4vmax 0.4vmax;
    padding: 0.5vmax;
`
const LogText = styled.div`
    width: 79.7vmax;
    height: 6vmax;
    color: white;
    background-color: #001421;
    padding: 0.5vmax;
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
function SystemLog() {
    const [sysLog,setLog] = useState(``);

    const handleLogData = (logdata) => {
        setLog(logdata);
    };

    useEffect(() => {
        initializeSocket(handleLogData, 'systemLog')
        return () => {
            disconnectSocket();
        };
    }, []);

    return (
        <SystemLogContainer>
            <SystemLogTitle>System Log</SystemLogTitle>
            <LogContainer>
                <LogText>
                {sysLog.split('\n').map((line,index)=>(
                    <React.Fragment key ={index}>
                        {line}
                        <br />
                    </React.Fragment>
                    ))}
                </LogText>
            </LogContainer>
        </SystemLogContainer>
    )
}

export default SystemLog;