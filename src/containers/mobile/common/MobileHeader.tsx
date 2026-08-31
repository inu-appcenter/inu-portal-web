import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
// import { intipLogoMascot as intipLogo } from "@/resources/assets/illustrations/brand";
import { intipLogoWordmark as intipLogo } from "@/resources/assets/illustrations/brand";
import { useNavigate } from "react-router-dom";
import { forwardRef } from "react";
import { useCustomNavigate } from "@/hooks/useCustomNavigate";

import { Bell } from "lucide-react";
import BackButton from "@/components/mobile/login/BackButton";
import TopRightDropdownMenu from "@/components/desktop/common/TopRightDropdownMenu";
import { useHeaderConfig } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { mixpanelTrack } from "@/utils/mixpanel";
import Ripple from "@/components/common/Ripple";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useUnreadNotification } from "@/hooks/useUnreadNotification";

const NotificationBell = ({ hasNew }: { hasNew: boolean }) => {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();

  const handleNotiBtnClick = () => {
    mixpanelTrack.featureClicked("Notification Bell", "Header");
    if (!tokenInfo.accessToken) {
      alert("로그인해주세요.");
      navigate(ROUTES.LOGIN);
      return;
    }

    navigate(ROUTES.BOARD.ALERT);
  };

  return (
    <BellWrapper onClick={handleNotiBtnClick}>
      <Ripple />
      <Bell size={24} />
      {hasNew && <Badge />}
    </BellWrapper>
  );
};

const BellWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  overflow: hidden;
`;

const Badge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  width: 8px;
  height: 8px;
  background-color: #ffd60a;
  border-radius: 50%;
  pointer-events: none;
`;

interface MobileHeaderProps {
  targetPath?: string;
  contained?: boolean;
}

const MobileHeader = forwardRef<HTMLElement, MobileHeaderProps>(
  function MobileHeader(
    { targetPath, contained = false }: MobileHeaderProps,
    ref,
  ) {
    const {
      title,
      hasback,
      backPath,
      onBack,
      showAlarm,
      menuItems,
      rightArea,
      visible,
      subHeader,
      floatingSubHeader,
      isScrolled,
      rightAreaNotCircle,
      noBlur,
    } = useHeaderConfig(targetPath);

    const navigate = useCustomNavigate();
    const { hasUnreadNotification } = useUnreadNotification();
    const hasMenuItems = (menuItems?.length ?? 0) > 0;

    const handleLogoClick = () => {
      mixpanelTrack.featureClicked("Logo", "Header");
      navigate(ROUTES.HOME);
    };

    const handleBack = () => {
      mixpanelTrack.featureClicked("Back Button", "Header");
      if (onBack) {
        onBack();
        return;
      }
      if (backPath) {
        navigate(backPath, { replace: true });
        return;
      }
      navigate(-1);
    };

    const hasTitle = Boolean(title);

    if (visible === false) return null;

    return (
      <MobileHeaderWrapper
        ref={ref}
        $contained={contained}
        $visible={true}
      >
        <MainHeaderWrapper
          $isScrolled={isScrolled}
          $hasBack={(hasback && !!title) ?? false}
          $hasTitle={hasTitle}
          $noBlur={Boolean(noBlur)}
        >
          {title ? (
            <TitleArea>
              {hasback && (
                <IconBackgroundWrapper
                  $isScrolled={isScrolled}
                  $isCircle={true}
                >
                  <BackButton onClick={handleBack} />
                </IconBackgroundWrapper>
              )}
              <TitleWrapper
                $isScrolled={isScrolled}
                $hasBack={hasback ?? false}
              >
                <HeaderTitle $hasBack={hasback ?? false}>{title}</HeaderTitle>
              </TitleWrapper>
            </TitleArea>
          ) : (
            <TitleArea>
              <TitleWrapper $isScrolled={isScrolled} $hasBack={false}>
                <img
                  className="logo"
                  onClick={handleLogoClick}
                  src={intipLogo}
                />
              </TitleWrapper>
            </TitleArea>
          )}

          {(showAlarm || hasMenuItems || rightArea) && (
            <IconBackgroundWrapper
              $isScrolled={isScrolled}
              $isCircle={
                rightAreaNotCircle
                  ? false
                  : [showAlarm, hasMenuItems, rightArea].filter(Boolean).length ===
                    1
              }
              $marginRight={MOBILE_PAGE_GUTTER}
            >
              {rightArea}
              {showAlarm && <NotificationBell hasNew={hasUnreadNotification} />}
              {hasMenuItems && <TopRightDropdownMenu items={menuItems!} />}
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
  z-index: 1000;
  display: flex;
  flex-direction: column;
  pointer-events: none;
`;

const MainHeaderWrapper = styled.div<{
  $isScrolled: boolean;
  $hasBack: boolean;
  $hasTitle: boolean;
  $noBlur?: boolean;
}>`
  position: relative;
  z-index: 2;
  width: 100%;
  height: calc(64px + var(--native-safe-area-inset-top));
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  pointer-events: none;

  padding-top: calc(12px + var(--native-safe-area-inset-top));
  padding-bottom: 8px;
  padding-left: ${({ $hasBack }) => ($hasBack ? "12px" : "20px")};
  padding-right: ${({ $hasBack }) => ($hasBack ? "16px" : "20px")};

  background: ${({ $isScrolled, $hasTitle, $noBlur }) =>
    $noBlur || $isScrolled || !$hasTitle
      ? "transparent"
      : "var(--bg-blur, rgba(255, 255, 255, 0.6))"};
  backdrop-filter: ${({ $isScrolled, $hasTitle, $noBlur }) =>
    $noBlur || $isScrolled || !$hasTitle ? "none" : "blur(10px)"};
  -webkit-backdrop-filter: ${({ $isScrolled, $hasTitle, $noBlur }) =>
    $noBlur || $isScrolled || !$hasTitle ? "none" : "blur(10px)"};
  box-shadow: ${({ $isScrolled, $hasTitle, $noBlur }) =>
    $noBlur || $isScrolled || !$hasTitle
      ? "none"
      : "0px 4px 12px 0px rgba(0, 0, 0, 0.08)"};
  border-bottom-left-radius: ${({ $isScrolled, $hasTitle, $noBlur }) =>
    $noBlur || $isScrolled || !$hasTitle ? "0px" : "32px"};
  border-bottom-right-radius: ${({ $isScrolled, $hasTitle, $noBlur }) =>
    $noBlur || $isScrolled || !$hasTitle ? "0px" : "32px"};

  transition:
    background 0.25s ease,
    backdrop-filter 0.25s ease,
    box-shadow 0.25s ease,
    border-radius 0.25s ease;

  .logo {
    pointer-events: auto;
    height: auto;
    width: 100px;
    cursor: pointer;
    margin-left: 0;
    opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
    visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};
    transition:
      opacity 0.15s ease,
      visibility 0s linear
        ${({ $isScrolled }) => ($isScrolled ? "0.15s" : "0s")};
  }

  @media ${DESKTOP_MEDIA} {
    padding-left: ${({ $hasBack }) => ($hasBack ? "12px" : "20px")};
    padding-right: ${({ $hasBack }) => ($hasBack ? "16px" : "20px")};

    .logo {
      width: 124px;
      margin-left: 0;
    }
  }
`;

const SubHeaderWrapper = styled.div<{ $floating: boolean }>`
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding: 0 ${MOBILE_PAGE_GUTTER};
  box-sizing: border-box;
  pointer-events: none;
  overflow: visible;
  margin-top: 12px;

  @media ${DESKTOP_MEDIA} {
    padding: 0;
  }
`;

const IconBackgroundWrapper = styled.div<{
  $isScrolled: boolean;
  $isCircle: boolean;
  $marginRight?: string;
}>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 999px;
  box-sizing: border-box;

  padding: ${({ $isCircle }) => ($isCircle ? "0" : "0 12px")};
  width: ${({ $isCircle }) => ($isCircle ? "40px" : "auto")};
  height: 40px;
  pointer-events: auto;

  /* 스크롤 시에만 배경, 그림자, 테두리, 블러 적용 */
  ${({ $isScrolled }) =>
    $isScrolled
      ? `
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid var(--border-default, #e5e8eb);
        box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      `
      : `
        background: transparent;
        border: 1px solid transparent;
        box-shadow: none;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      `}

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

const TitleArea = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  margin-left: 0;
  pointer-events: none;
  gap: 4px;
`;

const TitleWrapper = styled.div<{ $isScrolled: boolean; $hasBack: boolean }>`
  flex: 1;
  width: 100%;
  min-width: 0;
  pointer-events: none;

  opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
  visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};

  overflow: hidden;
  white-space: nowrap;

  transition:
    opacity 0.2s ease-in-out,
    visibility 0s linear ${({ $isScrolled }) => ($isScrolled ? "0.2s" : "0s")};
`;

const HeaderTitle = styled.div<{ $hasBack?: boolean }>`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: ${({ $hasBack }) => ($hasBack ? "18px" : "20px")};
  font-weight: ${({ $hasBack }) => ($hasBack ? "600" : "700")};
  line-height: 28px;
  letter-spacing: ${({ $hasBack }) => ($hasBack ? "0px" : "-0.2px")};
  color: var(--text-secondary, #333d4b);
`;

const FloatingWrapper = styled.div`
  width: fit-content;
  max-width: 100%;
  padding: 0;
  border-radius: 100px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  min-height: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  overflow: hidden;
  pointer-events: auto;
`;
