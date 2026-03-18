import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import intipLogo from "@/resources/assets/intip-logo.webp";
import { useNavigate } from "react-router-dom";
import { forwardRef } from "react";

import { Bell } from "lucide-react";
import BackButton from "@/components/mobile/login/BackButton";
import Title from "@/components/mobile/mypage/Title";
import TopRightDropdownMenu from "@/components/desktop/common/TopRightDropdownMenu";
import { useHeaderConfig } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import {
  DESKTOP_MEDIA,
  MOBILE_BACK_ICON_VISUAL_OFFSET,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";

const NotificationBell = ({ hasNew }: { hasNew: boolean }) => {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();

  const handleNotiBtnClick = () => {
    if (!tokenInfo.accessToken) {
      alert("로그인해주세요.");
      navigate(ROUTES.LOGIN);
      return;
    }

    navigate(ROUTES.BOARD.ALERT);
  };

  return (
    <BellWrapper onClick={handleNotiBtnClick}>
      <Bell size={24} />
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
  contained?: boolean;
}

const MobileHeader = forwardRef<HTMLElement, MobileHeaderProps>(
  function MobileHeader(
    { targetPath, contained = false }: MobileHeaderProps,
    ref,
  ) {
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
      <MobileHeaderWrapper ref={ref} $contained={contained} $visible={true}>
        <MainHeaderWrapper $isScrolled={isScrolled}>
          {title ? (
            <TitleArea>
              {hasback && (
                <IconBackgroundWrapper $isScrolled={isScrolled} $isCircle={true}>
                  <BackButton onClick={handleBack} />
                </IconBackgroundWrapper>
              )}
              <TitleWrapper
                $isScrolled={isScrolled}
                $hasBack={hasback ?? false}
              >
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
              $marginRight={MOBILE_PAGE_GUTTER}
            >
              {showAlarm && <NotificationBell hasNew={false} />}
              {menuItems && <TopRightDropdownMenu items={menuItems} />}
            </IconBackgroundWrapper>
          )}
        </MainHeaderWrapper>

        {subHeader && (
          <SubHeaderWrapper $floating={!!floatingSubHeader}>
            {floatingSubHeader ? (
              <FloatingWrapper>{subHeader}</FloatingWrapper>
            ) : (
              subHeader
            )}
          </SubHeaderWrapper>
        )}
      </MobileHeaderWrapper>
    );
  },
);

MobileHeader.displayName = "MobileHeader";

export default MobileHeader;

const MobileHeaderWrapper = styled.header<{
  $visible: boolean;
  $contained: boolean;
}>`
  position: ${({ $contained }) => ($contained ? "relative" : "fixed")};
  top: ${({ $contained }) => ($contained ? "auto" : "0")};
  width: 100%;
  padding-top: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  pointer-events: none;

  @media ${DESKTOP_MEDIA} {
    max-width: none;
    padding-top: 20px;
  }
`;

const MainHeaderWrapper = styled.div<{ $isScrolled: boolean }>`
  width: 100%;
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 0 ${MOBILE_PAGE_GUTTER};

  .logo {
    pointer-events: auto;
    height: auto;
    width: 100px;
    cursor: pointer;
    padding: 4px 0;
    margin-left: ${MOBILE_PAGE_GUTTER};
    opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
    visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};
    transition:
      opacity 0.15s ease,
      visibility 0s linear
        ${({ $isScrolled }) => ($isScrolled ? "0.15s" : "0s")};
  }

  @media ${DESKTOP_MEDIA} {
    padding: 0;

    .logo {
      width: 124px;
      margin-left: 12px;
    }
  }
`;

const SubHeaderWrapper = styled.div<{ $floating: boolean }>`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding: 0 ${MOBILE_PAGE_GUTTER};
  box-sizing: border-box;
  pointer-events: auto;

  @media ${DESKTOP_MEDIA} {
    padding: 0;
  }
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0;
  pointer-events: auto;
  gap: 0;

  @media ${DESKTOP_MEDIA} {
    margin-left: ${MOBILE_BACK_ICON_VISUAL_OFFSET};
  }
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

  @media ${DESKTOP_MEDIA} {
    min-width: 280px;
    max-width: ${({ $isScrolled }) => ($isScrolled ? "0px" : "420px")};
  }
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
  margin-right: 0;
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

  @media ${DESKTOP_MEDIA} {
    margin-right: ${({ $marginRight }) => $marginRight ?? "0"};
  }

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
  width: fit-content;
  max-width: 100%;
  padding: 4px 16px;
  border-radius: 50px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  min-height: 36px;
`;
