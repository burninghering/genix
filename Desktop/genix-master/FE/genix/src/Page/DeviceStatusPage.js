import React, { useEffect, useReducer, useState } from "react";
import styled, { css } from "styled-components";

import SystemLogo from "../images/Logo_Simple.svg";
import DataList from "../Component/DATA LIST/DataList";
import RealTimeData from "../Component/DATA LIST/RealTimeData";
import UserManage from "../Component/USER/UserManage";
import HeaderArea from "../Component/DATA LIST/HeaderArea";

import { verifyTokens } from "../utils/tokenUtils.js";
import { useNavigate } from "react-router-dom";

import Instance from "../Variable/Instance.js";
import GetUserList from "../Component/USER/UserList.js";
import base64 from "base-64";

const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #011428;
`;
const Sidebar = styled.aside`
  width: 15%;
  height: 99%;
  background-color: #002f55;
  display: flex;
  flex-direction: column;
  position: sticky;
  align-items: center;
  padding-top: 0.5vmax;
  border-radius: 0 3vmax 3vmax 0;
  background: radial-gradient(ellipse at top, #0088f4 0%, #00508d 22%, #002e4d 100%);
`;
const Logo = styled.div`
  width: 100%;
  height: 3vmax;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 3vmax;
  margin-bottom: 4vmax;
  img {
    width: 75%;
    height: auto;
  }
`;
const SideItem = styled.button`
  width: 12vmax;
  height: 3.7vmax;
  font-family: 'Pretendard', sans-serif;
  font-size: 1.3vmax;
  font-weight: 500;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5vmax;
  background-color: #002e4d;
  border: 0.06vmax solid;
  border-radius: 0.5vmax;
  cursor: pointer;
  outline: none;
  &:hover {
    font-weight: 700;
    background-color: #456c86;
  }

  ${(props) =>
    props.$active &&
    css`
      background: linear-gradient(to bottom, #067ede 0%, #0862a9 100%);
      font-weight: 700;
    `}
`;

const Content = styled.main`
  width: 92vmax;
  padding: 1vmax;
  box-sizing: border-box;
`;

// 초기 상태 및 액션 타입 정의
const initialState = {
  view: localStorage.getItem('currentView') || 'datalist',
};

const SELECT_VIEW = 'SELECT_VIEW';

// reducer 함수 정의
function reducer(state, action) {
  switch (action.type) {
    case SELECT_VIEW:
      return { ...state, view: action.payload };
    default:
      return state;
  }
}

function DeviceStatusPage() {
  const [isManager, setManager] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    async function fetchData() {
      await GetUserList();
      if (localStorage.getItem('loginState') === 'true') {
        verifyTokens(navigate);
      } else {
        navigate('/');
      }

      if (Instance.myRole === "관리자") {
        setManager(true);
      } else {
        setManager(false);
      }
    }
    
    fetchData();
  }, [navigate]);

  async function GetUserList() {
    let flag = false;
    if (!flag) {
      let user_role = null;
      try {
        const response = await fetch(`${Instance.SVR_URL}/user`, {
          method: "post",
          headers: { "content-type": "application/json" },
        });
        const data = await response.json();

        if (localStorage.getItem('Tokens')) {
          
          // const userID = jwt.decoded(JSON.parse(localStorage.getItem('Tokens')).AccessToken).id;//JSON.parse(localStorage.getItem('Tokens')).UserID;
          const accessToken = JSON.parse(localStorage.getItem('Tokens')).AccessToken;
          // console.log('accessToken : ', accessToken);
          let payload = accessToken.substring(accessToken.indexOf(".") + 1, accessToken.lastIndexOf("."));
          //console.log('payload : ', payload);
          let decodingInfo = base64.decode(payload);
          //console.log('decodingInfo : ', decodingInfo);
          const jsonDecodingInfo = JSON.parse(decodingInfo);
          //console.log('userID : ', jsonDecodingInfo.id);
          const userID = jsonDecodingInfo.id;

          data.forEach((user) => {
            switch (user.role) {
              case 1:
                user_role = "관리자";
                break;
              case 2:
                user_role = "사용자";
                break;
              default:
                user_role = "Unknown";
                break;
            }
            if (userID === user.login_id) {
              Instance.myID = user.login_id;
              Instance.myNN = user.nickname;
              Instance.myRole = user_role;
            }
          });
          flag = true;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  // 클릭 이벤트 핸들러
  const handleItemClick = (selectedView) => {
    dispatch({ type: SELECT_VIEW, payload: selectedView });
    localStorage.setItem('currentView', selectedView); // 선택한 뷰를 로컬스토리지에 저장
  };

  // 초기 마운트 시, localStorage에서 뷰 설정
  useEffect(() => {
    const storedView = localStorage.getItem('currentView');
    if (storedView) {
      dispatch({ type: SELECT_VIEW, payload: storedView });
    }
  }, []);


  if (Instance.myID == '정보없음') {
    return null;
  }

  return (
    <Container>
      <Sidebar>
        <Logo>
          <img className="logosimple" src={SystemLogo} alt="Genix" />
        </Logo>
        <SideItem
          onClick={() => handleItemClick('datalist')}
          $active={state.view === 'datalist'}
        >
          데이터 목록
        </SideItem>
        <SideItem
          onClick={() => handleItemClick('realtime')}
          $active={state.view === 'realtime'}
        >
          실시간 데이터
        </SideItem>
        {isManager && (
          <SideItem
            onClick={() => handleItemClick('userManage')}
            $active={state.view === 'userManage'}
          >
            사용자 관리
          </SideItem>
        )}
      </Sidebar>
      <Content>
        <HeaderArea />
        {state.view === 'datalist' && <DataList />}
        {state.view === 'realtime' && <RealTimeData />}
        {state.view === 'userManage' && <UserManage />}
      </Content>
    </Container>
  );
}

export default DeviceStatusPage;
