import styled from "styled-components";
import useUserStore from "stores/useUserStore";
import { useState } from "react";
import loginImg from "resources/assets/login/login-modal-logo.svg";
import { MyPageActive, MyPageCategory } from "resources/strings/m-mypage";
import useMobileNavigate from "hooks/useMobileNavigate";
import UserInfo from "mobile/containers/mypage/UserInfo";
import arrowImg from "resources/assets/mobile-mypage/arrow.svg";

export default function MobileMyPage() {
  const { userInfo, setUserInfo, setTokenInfo } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const mobileNavigate = useMobileNavigate();

  const handleLogout = () => {
    setUserInfo({ id: 0, nickname: "", role: "", fireId: 0 });
    setTokenInfo({
      accessToken: "",
      accessTokenExpiredTime: "",
      refreshToken: "",
      refreshTokenExpiredTime: "",
    });
    localStorage.removeItem("tokenInfo");
    if (window.AndroidBridge && window.AndroidBridge.handleLogout) {
      window.AndroidBridge.handleLogout();
    } else {
      mobileNavigate(`/home`);
    }
  };

  const handleLogoutModalClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleClick = (title: string) => {
    switch (title) {
      case "내가 쓴 글":
        mobileNavigate(`/mypage/post`);
        break;
      case "좋아요 한 글":
        mobileNavigate(`/mypage/like`);
        break;
      case "작성한 댓글":
        mobileNavigate(`/mypage/comment`);
        break;
      case "프로필 편집":
        mobileNavigate(`/mypage/profile`);
        break;
      case "스크랩":
        mobileNavigate(`/save`);
        break;
      case "로그아웃":
        handleLogoutModalClick();
        break;
      case "회원탈퇴":
        mobileNavigate(`/mypage/delete`);
        break;

      default:
        break;
    }
  };

  return (
    <>
      {userInfo.id ? (
        <MyPageWrapper>
          <Background />
          <TopBackground />
          <UserWrapper>{userInfo.id && <UserInfo />}</UserWrapper>
          <ActiveWrapper>
            {MyPageActive.map((active, index) => (
              <div key={index} onClick={() => handleClick(active.title)}>
                <img src={active.image} />
                <p>{active.title}</p>
              </div>
            ))}
          </ActiveWrapper>
          <CategoryWrapper>
            {MyPageCategory.map((category, index) => (
              <div key={index} onClick={() => handleClick(category.title)}>
                <span>
                  <img src={category.image} />
                  <p>{category.title}</p>
                </span>
                <Arrow src={arrowImg} />
              </div>
            ))}
          </CategoryWrapper>
          {isModalOpen && (
            <ModalOverlay>
              <ModalContent>
                <Title>
                  INTIP에서 <br />
                  로그아웃 하시겠어요?
                </Title>
                <ButtonContainer>
                  <CancelButton onClick={handleModalClose}>취소</CancelButton>
                  <Divider />
                  <LogoutButton
                    onClick={() => {
                      handleModalClose();
                      handleLogout();
                    }}
                  >
                    확인
                  </LogoutButton>
                </ButtonContainer>
              </ModalContent>
            </ModalOverlay>
          )}
        </MyPageWrapper>
      ) : (
        <ErrorWrapper>
          <LoginImg src={loginImg} alt="횃불이 로그인 이미지" />
          <div className="error">로그인이 필요합니다!</div>
        </ErrorWrapper>
      )}
    </>
  );
}

const MyPageWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Background = styled.div`
  position: fixed;
  z-index: -2;
  width: 100%;
  height: 100svh;
  background: #f3f7fe;
`;

const TopBackground = styled.div`
  background-color: #a1c3ff;
  height: 310px;
  position: absolute;
  top: -72px;
  width: 100%;
  z-index: -1;
`;

const UserWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 32px;
`;

const ActiveWrapper = styled.div`
  margin-top: 40px;
  box-sizing: border-box;
  background-color: #fff;
  padding: 27px 38px;
  padding-bottom: 11px;
  bottom: -55px;
  height: 110px;
  display: flex;
  gap: 30px;
  border-radius: 10px;
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    img {
      width: 20px;
      height: 20px;
    }
    p {
      padding: 0;
      margin: 0;
    }
  }
`;

const CategoryWrapper = styled.div`
  display: flex;
  margin-top: 40px;
  border-radius: 10px;
  flex-direction: column;
  align-items: center;
  width: 80%;
  gap: 16px;
  div {
    width: calc(100% - 32px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    padding: 10px 16px 10px 16px;
    border-radius: 10px;
    span {
      display: flex;
      align-items: center;
      gap: 18px;
      img {
        width: 36px;
        height: 36px;
      }
    }
  }
  padding-bottom: 16px;
`;

const Arrow = styled.img`
  width: 8px;
`;

const ModalOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 300px;
  max-width: 90%;
  padding-top: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: bold;

  text-align: center;
  height: 70px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  justify-content: space-evenly;
  height: 50px;
  border-top: 1px solid #d9d9d9;
`;

const CancelButton = styled.div`
  cursor: pointer;
  font-size: 14px;
  font-family: Roboto;
  color: #0e4d9d;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
`;

const LogoutButton = styled.div`
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: #0056b3;
  }
`;

const Divider = styled.div`
  height: 50px;
  width: 1px;
  background: #d9d9d9;
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  margin-top: 100px;
  div {
    font-size: 20px;
  }
`;

const LoginImg = styled.img`
  width: 150px;
`;
