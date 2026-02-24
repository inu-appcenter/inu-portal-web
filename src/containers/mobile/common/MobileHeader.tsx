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
      <Bell size={22} onClick={handleNotiBtnClick} />
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
              <BackButton onClick={handleBack} $isScrolled={isScrolled} />
            )}
            <TitleWrapper $isScrolled={isScrolled} $hasBack={hasback ?? false}>
              <Title title={title} />
            </TitleWrapper>
          </TitleArea>
        ) : (
          <img className="logo" onClick={handleLogoClick} src={intipLogo} />
        )}

        {(showAlarm || menuItems) && (
          <MenuBackgroundWrapper $isScrolled={isScrolled} $marginRight="16px">
            {showAlarm && <NotificationBell hasNew={false} />}
            {menuItems && <TopRightDropdownMenu items={menuItems} />}
          </MenuBackgroundWrapper>
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
`;

const TitleWrapper = styled.div<{ $isScrolled: boolean; $hasBack: boolean }>`
  pointer-events: none;
  opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
  visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};
  max-width: ${({ $isScrolled }) => ($isScrolled ? "0px" : "300px")};
  overflow: hidden;
  white-space: nowrap;
  min-width: 200px;
  transition:
    all 0.2s ease-in-out,
    visibility 0s linear ${({ $isScrolled }) => ($isScrolled ? "0.2s" : "0s")};
`;

const MenuBackgroundWrapper = styled.div<{
  $isScrolled: boolean;
  $marginRight?: string;
}>`
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 50px;
  margin-right: ${({ $marginRight }) => $marginRight ?? "0"};
  padding: 12px 16px;
  pointer-events: auto;

  background: ${({ $isScrolled }) =>
    $isScrolled ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0)"};
  box-shadow: ${({ $isScrolled }) =>
    $isScrolled ? "0 2px 8px rgba(0, 0, 0, 0.15)" : "none"};
  backdrop-filter: blur(${({ $isScrolled }) => ($isScrolled ? "10px" : "0px")});
  -webkit-backdrop-filter: blur(
    ${({ $isScrolled }) => ($isScrolled ? "10px" : "0px")}
  );

  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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
