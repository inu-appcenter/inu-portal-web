import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import { useState } from "react";
import loginImg from "@/resources/assets/login/login-modal-logo.svg";
import {
  MyPageActive,
  MyPageCategoryCommon,
  MyPageCategoryLoggeedIn,
} from "@/resources/strings/m-mypage";
import arrowImg from "@/resources/assets/mobile-mypage/arrow.svg";
import UserInfo from "../../containers/mobile/mypage/UserInfo.tsx";
import { useHeader } from "@/context/HeaderContext.tsx";
import { deleteFcmToken } from "@/apis/members";

export default function MobileMyPage() {
  const { userInfo, setUserInfo, setTokenInfo } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const fcmToken = localStorage.getItem("fcmToken");

    if (fcmToken) {
      try {
        await deleteFcmToken(fcmToken);
      } catch (error) {
        console.error("FCM 토큰 삭제 실패:", error);
      }
    }

    setUserInfo({ id: 0, nickname: "", role: "", fireId: 0, department: "" });
    setTokenInfo({
      accessToken: "",
      accessTokenExpiredTime: "",
      refreshToken: "",
      refreshTokenExpiredTime: "",
    });
    localStorage.removeItem("tokenInfo");

    navigate(`/home`);

    // if (window.AndroidBridge && window.AndroidBridge.handleLogout) {
    //   window.AndroidBridge.handleLogout();
    // } else {
    //   navigate(`/home`);
    // }
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
        navigate(`/mypage/post`);
        break;
      case "좋아요 한 글":
        navigate(`/mypage/like`);
        break;
      case "작성한 댓글":
        navigate(`/mypage/comment`);
        break;
      case "프로필 수정":
        navigate(`/mypage/profile`);
        break;
      case "스크랩":
        navigate(`/save`);
        break;
      case "로그아웃":
        handleLogoutModalClick();
        break;
      case "회원탈퇴":
        navigate(`/mypage/delete`);
        break;

      case "알림 설정 확인":
        navigate(ROUTES.MYPAGE.FCM);
        break;

      case "관리자 페이지":
        navigate("/admin");
        break;

      case "문의하기":
        window.open(
          "https://docs.google.com/forms/d/e/1FAIpQLSc1DAOC2N_HVzsMa6JMoSOqckpkX39SkHbrZD_eKTtr2cfKqA/viewform",
        );
        break;
      case "인천대학교 앱센터":
        window.open("https://home.inuappcenter.kr");
        break;

      default:
        break;
    }
  };

  useHeader({
    title: "마이페이지",
    subHeader: null,
    hasback: false,
  });

  return (
    <MyPageWrapper>
      {/*<Background />*/}
      <TopBackground>
        <UserWrapper>
          {userInfo.id !== 0 && <UserInfo />}
          {!userInfo.id && (
            <ErrorWrapper>
              <LoginImg src={loginImg} alt="횃불이 로그인 이미지" />
              <div className="error">
                로그인이 필요합니다!
                <LoginButton
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  로그인
                </LoginButton>
              </div>
            </ErrorWrapper>
          )}
        </UserWrapper>
        <ActiveWrapper>
          {MyPageActive.map((active, index) => (
            <div
              className="item"
              key={index}
              onClick={() => handleClick(active.title)}
            >
              <img src={active.image} />
              <p>{active.title}</p>
            </div>
          ))}
          {!userInfo.id && <Overlay />} {/* 로그인 안 됐으면 오버레이 */}
        </ActiveWrapper>
      </TopBackground>

      <CategoryWrapper>
        {userInfo.id !== 0 &&
          MyPageCategoryLoggeedIn.map((category, index) => (
            <div
              className="item"
              key={index}
              onClick={() => handleClick(category.title)}
            >
              <span>
                <img src={category.image} />

                <div>
                  {category.title}
                  {category.description && (
                    <div className="description">{category.description}</div>
                  )}
                </div>
              </span>
              <Arrow src={arrowImg} />
            </div>
          ))}
        {/* admin role일 경우 관리자 페이지 추가 */}
        {userInfo.role === "admin" && (
          <div className="item" onClick={() => handleClick("관리자 페이지")}>
            <span>
              <img src={/* 관리자 아이콘 이미지 */ ""} />
              <div>관리자 페이지</div>
            </span>
            <Arrow src={arrowImg} />
          </div>
        )}
        {MyPageCategoryCommon.map((category, index) => (
          <div
            className="item"
            key={index}
            onClick={() => handleClick(category.title)}
          >
            <span>
              <img src={category.image} />
              <div>
                <div>{category.title}</div>
                <div className="description">{category.description}</div>
              </div>
            </span>
            <Arrow src={arrowImg} />
          </div>
        ))}{" "}
        <div className="item" onClick={() => handleClick("알림 설정 확인")}>
          <span>
            <img src={""} alt="" />
            <div>
              <div>알림 설정 확인 (디버그)</div>
              <div className="description">FCM 토큰 및 전송 상태 확인</div>
            </div>
          </span>
          <Arrow src={arrowImg} />
        </div>
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
  );
}

const MyPageWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100svh;
  background: #f8faff; /* 헤더와 일치하는 배경색 */
`;

const TopBackground = styled.div`
  /* 투명하게 설정하여 MyPageWrapper의 배경이 보이도록 함 */
  background: transparent;
  height: fit-content;
  padding: 32px 0 80px;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UserWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 1;
  padding: 0 24px;
  box-sizing: border-box;
`;

const ActiveWrapper = styled.div`
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 85%;
  max-width: 320px;
  box-sizing: border-box;
  background-color: #fff;
  padding: 16px 24px;
  height: fit-content;
  display: flex;
  justify-content: space-between;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  .item {
    cursor: pointer;
    transition: opacity 0.2s;
    &:active {
      opacity: 0.7;
    }
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: fit-content;

    img {
      width: 24px;
      height: 24px;
    }

    p {
      padding: 0;
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: #495057;
    }
  }
`;

const CategoryWrapper = styled.div`
  display: flex;
  margin-top: 56px;
  border-radius: 10px;
  flex-direction: column;
  align-items: center;
  width: 85%;
  max-width: 320px;
  gap: 12px;

  .item {
    width: 100%;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    padding: 12px 16px;
    border-radius: 12px;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    cursor: pointer;
    transition: all 0.2s;

    &:active {
      background-color: #f8f9fa;
      transform: scale(0.99);
    }

    word-break: keep-all;

    span {
      display: flex;
      align-items: center;
      gap: 16px;

      div {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 15px;
        font-weight: 600;
        color: #212529;
      }

      img {
        width: 32px;
        height: 32px;
      }

      .description {
        font-size: 11px;
        color: #adb5bd;
        font-weight: 500;
        white-space: pre-line;
      }
    }
  }

  padding-bottom: 40px;
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
  //justify-content: center;
  justify-content: space-evenly;
  height: 50px;
  border-top: 1px solid #d9d9d9;
  text-align: center;
  font-size: 14px;
`;

const CancelButton = styled.div`
  cursor: pointer;
  //width: 100%;
  height: 100%;
  flex: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  //&:hover {
  //    background: #0056b3;
  //}
`;

const LogoutButton = styled.div`
  cursor: pointer;
  font-weight: 600;
  line-height: 20px;
  color: #0e4d9d;
  //width: 100%;
  height: 100%;

  flex: 1;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const Divider = styled.div`
  height: 50px;
  width: 1px;
  background: #d9d9d9;
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;

  background: #ffffff;
  border-radius: 12px;
  padding: 24px 16px;
  padding-right: 32px;
  box-sizing: border-box;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);

  div {
    font-size: 18px;
    font-weight: 600;
    color: #333;

    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
    align-items: center;
    text-align: center;
    word-break: keep-all;
  }
`;

const LoginImg = styled.img`
  width: 90px;
  height: 90px;
  object-fit: contain;
`;

const LoginButton = styled.button`
  width: 100%;
  height: fit-content;
  padding: 8px 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #7a6dd0; // 기존 보라보다 화면과 조화로운 톤
  color: white;
  font-weight: 600;
  font-size: 16px;
  border-radius: 25px / 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &:hover {
    background: linear-gradient(
      90deg,
      #6b5ec7,
      #8a79e0
    ); // 자연스러운 호버 그라데이션
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6); // 반투명 흰색
  z-index: 10;
  cursor: not-allowed;
`;
