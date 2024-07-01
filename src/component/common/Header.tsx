import styled from 'styled-components';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../reducer/userSlice';

export default function Headerbar() {
  const nickname = useSelector((state: any) => state.user.nickname);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <React.Fragment>
      <Header>
        <NavItem onClick={() => navigate('/m/home')}>모바일</NavItem>
        {nickname ? (
          <div> 
            <NavItem>{nickname}</NavItem>
            <NavItem onClick={handleLogout}>로그아웃</NavItem>
          </div>
        ) : (
          <NavItem onClick={() => navigate('/login')} >로그인</NavItem>
        )} 
      </Header>
    </React.Fragment>
  )
}

const Header = styled.header`
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  top:0;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  background: linear-gradient(to right, #9CAFE2 0%, #AAC9EE 100%);
`;

const NavItem = styled.span`
  font-size: 17px;
  font-weight: 300;
  line-height: 20px;
  color: #FFFFFF;
  text-decoration: none;
  cursor: url('/pointers/cursor-pointer.svg'), pointer;
  margin: 0 20px;
`;
