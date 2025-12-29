import styled from "styled-components";
import useUserStore from "@/stores/useUserStore";
import { useNavigate } from "react-router-dom";
import AppcenterLogo from "@/resources/assets/appcenter-logo.webp";

export default function Header() {
  const { userInfo, setUserInfo, setTokenInfo } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUserInfo({ id: 0, nickname: "", role: "", fireId: 0, department: "" });
    setTokenInfo({
      accessToken: "",
      accessTokenExpiredTime: "",
      refreshToken: "",
      refreshTokenExpiredTime: "",
    });
    localStorage.removeItem("tokenInfo");
    navigate("/");
  };

  return (
    <StyledHeader>
      <div>
        {/* <button onClick={() => navigate("/m")}>모바일</button> */}
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
            <button className="mobile" onClick={() => navigate("/m/login")}>
              로그인
            </button>
            <button className="desktop" onClick={() => navigate("/login")}>
              로그인
            </button>
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

  .mobile {
    @media (min-width: 1024px) {
      display: none;
    }
  }

  .desktop {
    @media (max-width: 1024px) {
      display: none;
    }
  }
`;
