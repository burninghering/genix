import React, {useState} from "react";
import styled from "styled-components";

import iconSearch from '../../images/icon/icon_search.svg'
import iconMan from "../../images/icon/icon_man.svg"

import UserInfoModal from "../USER/UserInfoModal";
import Instance from "../../Variable/Instance";
const HeaderContainer = styled.div`
    width: 100%;
    height: 10%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: baseline;
`
const SearchContainer = styled.div`
    width: 90%;
    height: 2.5vmax;
    display: flex;
    justify-content: baseline;
    align-items: center;
    // background-color: #002E4D;
    position: relative;
    border-radius: 0.3vmax;
`
const SearchInput = styled.input`
    width: 100%;
    height: 2.5vmax;
    padding-left: 4.5vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 1vmax;
    font-weight: 300;
    color: white;
    background: none;
    border: none;
    &::placeholder {
        color: lightgray;
    }
`
const SearchIcon = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    left: 2vmax;
    top: 8%;
    transform: translate(-50%);
    width: 2vmax;
    height: 2vmax;
    img {
        width: 50%;
        height: 50%;
    }
`
const Admin = styled.button`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5vmax;
    height: 2.5vmax;
    border-radius: 50%;
    border-color: transparent;
    background-color: transparent;
    margin-left: 1vmax;
    cursor: pointer;
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 50%;
        padding: 0.07vmax; /* Adjust padding to control border thickness */
        background: linear-gradient(to bottom, #0088F4 0%, #ffffff 100%);
        mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
        -webkit-mask:
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
        mask-composite: exclude;
        -webkit-mask-composite: destination-out;
    }
    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
    img{
        width: 50%;
        height: 50%;
    }
`;

const UserNickname = styled.div`
    min-width: 5vmax;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.8vmax;
    font-weight: 500;
    color: white;
    margin-left: 8px;
    margin-right: 1.5vmax;
    margin-top: 4px;
`

function HeaderArea() {
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);

    const openUserInfoModal = () => {
        setIsUserInfoModalOpen(true);
    };

    const closeUserInfoModal = () => {
        setIsUserInfoModalOpen(false);
    };

    return (
        <HeaderContainer>
            <SearchContainer>
                {/* <SearchIcon>
                    <img className="iconSearch" src={iconSearch} alt="SEARCH"/>
                </SearchIcon>
                <SearchInput placeholder="Search"/> */}
            </SearchContainer>
            <Admin onClick={openUserInfoModal}>
                <img className="iconMan" src={iconMan} alt="MEN" />
            </Admin>
            <UserNickname>
                {Instance.myNN}
            </UserNickname>

            <UserInfoModal isOpen={isUserInfoModalOpen} onClose={closeUserInfoModal} />
        </HeaderContainer>
    );
}


export default HeaderArea;