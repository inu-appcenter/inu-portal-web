import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import intipLogo from "@/resources/assets/intip-logo.webp";
import { useNavigate } from "react-router-dom";

import { Bell } from "lucide-react";
import BackButton from "@/components/mobile/login/BackButton";
import Title from "@/components/mobile/mypage/Title";
import TopRightDropdownMenu from "@/components/desktop/common/TopRightDropdownMenu";
import { useHeaderConfig } from "@/context/HeaderContext";

const NotificationBell = ({ hasNew }: { hasNew: boolean }) => {
  const navigate = useNavigate();
  const handleNotiBtnClick = () => {
    navigate(ROUTES.BOARD.ALERT);
  };

  return (
    <BellWrapper>
      <Bell size={24} onClick={handleNotiBtnClick} />
      {hasNew && <Badge />}
    </BellWrapper>
  );
};

const BellWrapper = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
`;

const Badge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background-color: #ffd60a;
  border-radius: 50%;
`;

// [변경] targetPath를 필수 props로 받음
interface MobileHeaderProps {
  targetPath?: string;
}

export default function MobileHeader({ targetPath }: MobileHeaderProps) {
  // [변경] 현재 URL이 아닌, 전달받은 targetPath의 설정을 가져옴
  const {
    title,
    hasback,
    backPath,
    onBack,
    showAlarm,
    menuItems,
    visible,
    subHeader,
    floatingSubHeader,
    isScrolled,
  } = useHeaderConfig(targetPath);

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate(ROUTES.HOME);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backPath) {
      navigate(backPath);
      return;
    }
    navigate(-1);
  };

  if (visible === false) return null;

  return (
    <MobileHeaderWrapper $visible={true}>
      <MainHeaderWrapper $isScrolled={isScrolled}>
        {title ? (
          <TitleArea>
            {hasback && (
              <IconBackgroundWrapper $isScrolled={isScrolled} $isCircle={true}>
                <BackButton onClick={handleBack} />
              </IconBackgroundWrapper>
            )}
            <TitleWrapper $isScrolled={isScrolled} $hasBack={hasback ?? false}>
              <Title title={title} />
            </TitleWrapper>
          </TitleArea>
        ) : (
          <img className="logo" onClick={handleLogoClick} src={intipLogo} />
        )}

        {(showAlarm || menuItems) && (
          <IconBackgroundWrapper
            $isScrolled={isScrolled}
            $isCircle={!(showAlarm && menuItems)}
            $marginRight="16px"
          >
            {showAlarm && <NotificationBell hasNew={false} />}
            {menuItems && <TopRightDropdownMenu items={menuItems} />}
          </IconBackgroundWrapper>
        )}
      </MainHeaderWrapper>

      {subHeader && (
        <SubHeaderWrapper>
          {floatingSubHeader ? (
            <FloatingWrapper>{subHeader}</FloatingWrapper>
          ) : (
            subHeader
          )}
        </SubHeaderWrapper>
      )}
    </MobileHeaderWrapper>
  );
}

const APP_MAX_WIDTH = "768px";

const MobileHeaderWrapper = styled.header<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  width: 100%;
  max-width: ${APP_MAX_WIDTH};
  padding-top: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  pointer-events: none;
`;

const MainHeaderWrapper = styled.div<{ $isScrolled: boolean }>`
  width: 100%;
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  .logo {
    pointer-events: auto;
    height: auto;
    width: 100px;
    cursor: pointer;
    padding: 4px 0;
    margin-left: 36px;
    opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
    visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};
    transition:
      opacity 0.15s ease,
      visibility 0s linear
        ${({ $isScrolled }) => ($isScrolled ? "0.15s" : "0s")};
  }
`;

const SubHeaderWrapper = styled.div`
  width: 100%;
  pointer-events: auto;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
  pointer-events: auto;
  gap: 0;
`;

const TitleWrapper = styled.div<{ $isScrolled: boolean; $hasBack: boolean }>`
  pointer-events: none;
  opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
  visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};
  max-width: ${({ $isScrolled }) => ($isScrolled ? "0px" : "300px")};
  overflow: hidden;
  white-space: nowrap;
  min-width: 200px;
  margin-left: -4px; /* 타이틀을 버튼 쪽으로 조금 더 당김 */
  transition:
    all 0.2s ease-in-out,
    visibility 0s linear ${({ $isScrolled }) => ($isScrolled ? "0.2s" : "0s")};
`;

const IconBackgroundWrapper = styled.div<{
  $isScrolled: boolean;
  $isCircle: boolean;
  $marginRight?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 50px;
  margin-right: ${({ $marginRight }) => $marginRight ?? "0"};
  padding: ${({ $isCircle }) => ($isCircle ? "0" : "0 20px")}; /* 상하 패딩 제거 */
  width: ${({ $isCircle }) => ($isCircle ? "48px" : "auto")};
  height: 48px;
  pointer-events: auto;
  box-sizing: border-box;

  /* 스크롤 시에만 배경과 그림자 적용 (기존 BackButton 수치 복구) */
  background: ${({ $isScrolled }) =>
    $isScrolled ? "rgba(255, 255, 255, 0.7)" : "transparent"};
  box-shadow: ${({ $isScrolled }) =>
    $isScrolled ? "0 2px 4px 0 rgba(0, 0, 0, 0.15)" : "none"};
  backdrop-filter: blur(${({ $isScrolled }) => ($isScrolled ? "5px" : "0px")});
  -webkit-backdrop-filter: blur(
    ${({ $isScrolled }) => ($isScrolled ? "5px" : "0px")}
  );

  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  /* 내부 요소(버튼, 아이콘)들의 강제 중앙 정렬 */
  & > * {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: transparent !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: ${({ $isCircle }) => ($isCircle ? "100%" : "auto")} !important;
    height: 100% !important;
  }
`;

const FloatingWrapper = styled.div`
  padding: 4px 16px;
  margin: 0 16px;
  border-radius: 50px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  min-height: 36px;
`;
