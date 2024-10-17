import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Instance from "../../Variable/Instance.js";
import PWChangeModal from "./PWChangeModal.js";
import DeleteModal from "./UserDeleteModal.js";
import UserInfoModal from "./UserInfoModal.js";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 65%;
    height: 40vmax;
    background-color: #002E4D;
    border-radius: 1vmax;
    align-items: center;
    justify-content: baseline;
`
const ListHeader = styled.div`
    width: 51vmax;
    height: 2.4vmax;
    display: flex;
    align-items: center;
    justify-content: baseline;
    background-color: #001421;
    color: white;
    font-family: 'Pretendard', sans-serif;
    font-size: 1.1vmax; /* 글자 크기 조정 */
    border-radius: 0.8vmax;
    margin: 1vmax;
    padding: 0 1vmax;
    box-sizing: border-box;
    text-align: center;
`

const ListHeaderItem = styled.div`
    text-align: center;
`;

const ListContainer = styled.div`
    width: 51vmax;
    height: 35vmax;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto; /* 세로 스크롤바 */

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
const ListItem = styled.div`
    width: 47vmax;
    height: 3vmax; /* 각 아이템의 높이 조정 */
    display: flex;
    align-items: center;
    justify-content: baseline;
    padding: 1vmax;
    border-bottom: 0.01vmax solid gray;
    color: lightgray;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.9vmax; /* 각 아이템의 글자 크기 조정 */
    font-weight: 300;
    margin-bottom: 0.3vmax;
    margin-right: 1vmax;
    text-align: center;
`
const UserSection = styled.div`
  display: grid;
  grid-template-columns: 28px auto;
  column-gap: 4px;
  align-items: center;
  justify-content: baseline;
  padding: 0 0.4vmax 0 1vmax;
  box-sizing: border-box;
  width: 20%;
`
const UserIcon = styled.div`
  width: 1.6vmax;
  height: 1.6vmax;
  max-width: 26px;
  max-height: 26px;
  background-color: #D9D9D9;
  border-radius: 100%;
  display: flex;
  justify-content: right;
`
const UserText = styled.div`
  font-family: 'Pretendard', sans-serif;
  font-size: 0.8vmax;
  font-weight: 600;
  text-align: left;
  color: white;
  margin-left: 4px;
`
const BtnContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`
const AdminButton = styled.button`
    padding: 0.5vmax 1.8vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.8vmax;
    font-weight: 500;
    border: 0.03vmax solid #BDBDBD;
    border-radius: 0.5vmax;
    color: lightgray;
    background-color: #262626;
    cursor: pointer;
    margin-left: 1vmax;
    margin-right: 1vmax;

    &:hover {
      background-color: #4E4E4E;
    }

    &:disabled {
      cursor: not-allowed;
      background-color: #3e3e3e;
    }

    &:disabled:hover {
      background-color: #3e3e3e;
    }
`
const PasswordButton = styled.button`
    padding: 0.5vmax 1.8vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.8vmax;
    font-weight: 500;
    border: 0.03vmax solid #BDBDBD;
    border-radius: 0.5vmax;
    color: lightgray;
    background-color: #262626;
    cursor: pointer;
    margin-left: 1vmax;
    margin-right: 1vmax;

    &:hover {
      background-color: #4E4E4E;
    }
`
const DeleteButton = styled.button`
    padding: 0.5vmax 1.8vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.8vmax;
    font-weight: 500;
    border: 0.03vmax solid #BDBDBD;
    border-radius: 0.5vmax;
    color: lightgray;
    background-color: #262626;
    cursor: pointer;
    margin-left: 1vmax;
    margin-right: 1vmax;

    &:hover {
      background-color: #4E4E4E;
    }
`
const Headerwidths = {
  id: '19%',
  nickname: '20%',
  role: '61%',
}

function UserList() {
  //#region PW MODAL
  const [isPWModalOpen, setIsPWModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenPWModal = () => {
    // Instance.selectedUserID = ;
    // Instance.selectedUserNickname = ;
    setIsPWModalOpen(true);
  };

  const handleClosePWModal = () => {
    Instance.selectedUserID = '';
    Instance.selectedUserNickname = '';
    setIsPWModalOpen(false);
  };
  //#endregion

  //#region Delete Modal
  const [isDeleteModalOpen, setIsDeleteModdalOpen] = useState(false);

  const handleDeleteOpenModal = () => {
    setIsDeleteModdalOpen(true);
  };

  const handleDeleteCloseModal = () => {
    setIsDeleteModdalOpen(false);
    Instance.deleteUserID = '';
  };
  //#endregion

  const [users, setUsers] = useState([]);
  const [flag, setFlag] = useState(false);
  let user_role = null;
  useEffect(() => {
    GetUserList();
  }, [flag]);

  function GetUserList() {
    if (!flag) {
      //console.log("Load Users()");
      fetch(`${Instance.SVR_URL}/user`, {
        method: "post",
        headers: { "content-type": "application/json" },
      })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          const transformedData = data.map(user => {
            
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

            return {
              id: user.login_id,
              nickname: user.nickname,
              role: user_role,
            };
            
          });
          
          setUsers(transformedData);
          setFlag(true);
        })
        .catch(error => console.error('Error fetching data:', error));
    }
    // }, [flag]);
  }
  // OnClickDeleteUser(user.id);
  async function DeleteUser() {
    // console.log("123");

    const encID = await Instance.RSAESEncryptionString(Instance.deleteUserID)
    fetch(`${Instance.SVR_URL}/user/unregist_user`, {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ID: encID//Instance.deleteUserID
      })
    })
      .then(res => res.text())
      .then(data => {
        console.log(data=='DELETE SUCCESS');
        if (data === 'DELETE SUCCESS') {
          console.log(`Instance.myID : ${Instance.myID} / Instance.deleteUserID : ${Instance.deleteUserID} `);
          if (Instance.myID === Instance.deleteUserID) {

            localStorage.removeItem('AutoLogin')
            localStorage.removeItem('currentView');
            localStorage.removeItem('Tokens');
            Instance.myRole = '정보없음';

            fetch(`${Instance.SVR_URL}/login/logout`, {
              method: "post",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                ID: Instance.myID
              })
            }).then(response => {
              if (response.status === 200) {
                navigate("/");
              }
              else {
                console.log(`로그아웃에 실패`);
              }
            });
          }
          setFlag(false);

          handleDeleteCloseModal();
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });


  }

  async function ChangePWD() {
    const encID = await Instance.RSAESEncryptionString(Instance.selectedUserID);
    const encPW = await Instance.RSAESEncryptionString(Instance.selectedUserPW);
    fetch(`${Instance.SVR_URL}/user/changePassword`, {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ID: encID,//Instance.selectedUserID,
          PW: encPW //Instance.selectedUserPW
        })
      })
      .then(res => res.text())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    Instance.selectedUserID = '';
    Instance.selectedUserNickname = '';
    Instance.selectedUserPW = '';
    setIsPWModalOpen(false);
  }

  function OnClickRole(user_id, user_curr_role) {
    fetch(`${Instance.SVR_URL}/user/modifyrole_user`, {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ID: user_id,
        ROLE: user_curr_role
      })
    })
      .then(res => res.text())
      .then(data => {
        console.log(data);
        //GetUserList();
        setFlag(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

  }

  return (
    <Container>
      <ListHeader>
        <ListHeaderItem style={{ width: Headerwidths.id }}>ID</ListHeaderItem>
        <ListHeaderItem style={{ width: Headerwidths.nickname }}>닉네임</ListHeaderItem>
        <ListHeaderItem style={{ width: Headerwidths.role }}>권한</ListHeaderItem>
      </ListHeader>
      <ListContainer>
        {users.map(user => (
          <ListItem key={user.id}>
            <div style={{ width: '19%' }}>{user.id}</div>
            <UserSection>
              <div style={{ display: 'flex', justifyContent: 'right' }}>
                <UserIcon />
              </div>
              <UserText>{user.nickname}</UserText>
            </UserSection>
            <div style={{ width: '61%' }}>
              <BtnContainer>
                {/* <AdminButton onClick={() => {() =>{ OnClickRole(user.id, user.role); }} disabled={myID===user.id}}>{user.role}</AdminButton> */}
                <AdminButton onClick={() => { OnClickRole(user.id, user.role); }} disabled={Instance.myID === user.id}>{user.role}</AdminButton>
                <PasswordButton onClick={() => {
                  handleOpenPWModal();
                  Instance.selectedUserID = user.id;
                  Instance.selectedUserNickname = user.nickname;
                }}>비밀번호 변경</PasswordButton>
                <DeleteButton onClick={() => {
                  handleDeleteOpenModal();
                  Instance.deleteUserID = user.id;
                }}>삭제</DeleteButton>
              </BtnContainer>
            </div>
          </ListItem>
        ))}
      </ListContainer>
      {isDeleteModalOpen && <DeleteModal onClickDelete={DeleteUser} onDelelteClose={handleDeleteCloseModal} />}
      {isPWModalOpen && <PWChangeModal onClickChangePWD={ChangePWD} onClose={handleClosePWModal} />}
    </Container>
  );
}

export default UserList;
