import React from "react";
import styled from "styled-components";

import UserList from "./UserList";
import AddUser from "./AddUser";

const MainContainer = styled.div`
    display: flex;
    flex-direction: column;
`
const SubContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: 82vmax;
`

function UserManage () {
    
    return (
        <MainContainer>
            <SubContainer>
                <UserList/>
                <AddUser/>
            </SubContainer>
        </MainContainer>
    )
}

export default UserManage;