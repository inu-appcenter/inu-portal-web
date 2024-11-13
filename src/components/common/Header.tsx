import styled from "styled-components";
import useUserStore from "stores/useUserStore";
import { useNavigate } from "react-router-dom";
import AppcenterLogo from "resources/assets/appcenter-logo.svg";

export default function Header() {
  const { userInfo, setUserInfo } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("tokenInfo");
    setUserInfo({ id: 0, nickname: "", fireId: 0 });
    navigate("/");
  };

  return (
    <StyledHeader>
      <div>
        <button onClick={() => navigate("/m")}>모바일</button>
        <img
          src={AppcenterLogo}
          onClick={() => window.open("https://home.inuappcenter.kr/")}
          alt="Appcenter"
        />
      </div>
      <div>
        {userInfo.nickname ? (
          <>
            <button>{userInfo.nickname}</button>
            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <button onClick={handleLogin}>로그인</button>
          </>
        )}
      </div>
    </StyledHeader>
  );
}

const StyledHeader = styled.header`
  padding: 0 32px;
  height: 32px;
  background: linear-gradient(90deg, #9cafe2 0%, #aac9ee 100%);
  display: flex;
  justify-content: space-between;

  div {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 32px;
  }

  img {
    height: 100%;
  }

  button {
    font-size: 20px;
    line-height: 20px;
    background-color: transparent;
    border: none;
    color: white;
    padding: 0;
  }
`;
