import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import { useState } from "react";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
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
import {
  DESKTOP_MEDIA,
  DESKTOP_READING_WIDTH,
} from "@/styles/responsive";

export default function MobileMyPage() {
  const { userInfo, setUserInfo, setTokenInfo } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const renderMenuIcon = (image?: string) =>
    image ? (
      <img src={image} alt="" />
    ) : (
      <HiOutlineCog6Tooth className="fallback-icon" aria-hidden="true" />
    );

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
      <DesktopContentGrid>
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
                  {renderMenuIcon(category.image)}

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
            <div
              className="item"
              onClick={() => handleClick("관리자 페이지")}
            >
              <span>
                {renderMenuIcon()}
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
                {renderMenuIcon(category.image)}
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
              {renderMenuIcon()}
              <div>
                <div>알림 설정 확인 (디버그)</div>
                <div className="description">FCM 토큰 및 전송 상태 확인</div>
              </div>
            </span>
            <Arrow src={arrowImg} />
          </div>
        </CategoryWrapper>
      </DesktopContentGrid>
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
  box-sizing: border-box;
  background: transparent;

  @media ${DESKTOP_MEDIA} {
    min-height: auto;
  }
`;

const DesktopContentGrid = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_READING_WIDTH});
    display: grid;
    grid-template-columns: minmax(320px, 380px) minmax(0, 1fr);
    gap: 28px;
    align-items: start;
    margin: 0 auto;
    padding: 24px 0 56px;
  }
`;

const TopBackground = styled.div`
  background: transparent;
  height: fit-content;
  padding: 32px 0 80px;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media ${DESKTOP_MEDIA} {
    gap: 20px;
    padding: 0;
    position: sticky;
    top: 76px;
    align-items: stretch;
  }
`;

const UserWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 1;
  padding: 0 24px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    padding: 0;
  }
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

  > .item {
    cursor: pointer;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.7;
    }
  }

  > .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: fit-content;
  }

  > .item img {
    width: 24px;
    height: 24px;
  }

  > .item p {
    padding: 0;
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #495057;
  }

  @media ${DESKTOP_MEDIA} {
    position: relative;
    inset: auto;
    transform: none;
    width: 100%;
    max-width: none;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    border-radius: 24px;
    border: 1px solid rgba(14, 77, 157, 0.08);
    box-shadow:
      0 14px 32px rgba(15, 36, 71, 0.06),
      0 4px 10px rgba(15, 36, 71, 0.04);
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    > .item {
      min-height: 108px;
      padding: 16px 12px;
      border-radius: 18px;
      background: transparent;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &:active {
        opacity: 1;
        transform: scale(0.98);
      }
    }

    > .item img {
      width: 28px;
      height: 28px;
    }

    > .item p {
      font-size: 14px;
      text-align: center;
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
      flex: 1;
      min-width: 0;

      > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        font-size: 15px;
        font-weight: 600;
        color: #212529;
        min-width: 0;
        min-height: 32px;
      }

      img {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }

      .fallback-icon {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        color: #6c7ea8;
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

  @media ${DESKTOP_MEDIA} {
    margin-top: 0;
    width: 100%;
    max-width: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    align-items: stretch;
    padding-bottom: 56px;

    .item {
      min-height: 88px;
      padding: 16px 20px;
      border-radius: 18px;
      box-shadow:
        0 14px 32px rgba(15, 36, 71, 0.05),
        0 4px 10px rgba(15, 36, 71, 0.03);

      &:hover {
        transform: translateY(-2px);
        box-shadow:
          0 18px 36px rgba(15, 36, 71, 0.08),
          0 6px 12px rgba(15, 36, 71, 0.04);
      }

      &:active {
        transform: scale(0.99);
      }

      span {
        align-items: center;
      }

      span > div {
        gap: 4px;
      }

      span .description {
        font-size: 12px;
        line-height: 1.45;
      }
    }
  }
`;

const Arrow = styled.img`
  width: 8px;

  @media ${DESKTOP_MEDIA} {
    width: 10px;
    opacity: 0.7;
  }
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

  @media ${DESKTOP_MEDIA} {
    width: 100%;
    min-height: 180px;
    justify-content: flex-start;
    padding: 28px;
    gap: 18px;
    border-radius: 24px;

    div {
      align-items: flex-start;
      text-align: left;
    }
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

  @media ${DESKTOP_MEDIA} {
    width: auto;
    min-width: 132px;
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
  border-radius: inherit;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
`;
