import styled from "styled-components";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../reducer/userSlice";
import AppcenterLogo from "../../resource/assets/appcenter-logo.svg";

export default function Headerbar() {
  const nickname = useSelector((state: any) => state.user.nickname);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    dispatch(logoutUser());
    navigate("/");
  };

  return (
    <React.Fragment>
      <Header>
        <div>
          <NavItem onClick={() => navigate("/m/home")}>모바일</NavItem>
          <img
            src={AppcenterLogo}
            onClick={() => window.open("https://home.inuappcenter.kr/")}
            alt="Appcenter"
          />
        </div>
        {nickname ? (
          <div>
            <NavItem>{nickname}</NavItem>
            <NavItem onClick={handleLogout}>로그아웃</NavItem>
          </div>
        ) : (
          <NavItem onClick={() => navigate("/login")}>로그인</NavItem>
        )}
      </Header>
    </React.Fragment>
  );
}

const Header = styled.header`
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  top: 0;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  background: linear-gradient(to right, #9cafe2 0%, #aac9ee 100%);
  div {
    display: flex;
    align-items: center;
    img {
      height: 30px;
    }
  }
`;

const NavItem = styled.span`
  font-size: 18px;
  font-weight: 300;
  color: #ffffff;
  text-decoration: none;
  cursor: url("/pointers/cursor-pointer.svg"), pointer;
  margin: 0 20px;
`;
