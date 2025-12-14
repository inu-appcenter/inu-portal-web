import { ROUTES } from "@/constants/routes";
import { useEffect, useState } from "react";
import styled from "styled-components";
import intipLogo from "@/resources/assets/intip-logo.svg";
import { useLocation, useNavigate } from "react-router-dom";

import { Bell } from "lucide-react";
import BackButton from "@/components/mobile/login/BackButton";
import Title from "@/components/mobile/mypage/Title";
import TopRightDropdownMenu from "@/components/desktop/common/TopRightDropdownMenu";

// 알림 여부를 prop으로 전달받아서 표시 여부 결정
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
  top: 0px;
  right: 0px;
  width: 8px;
  height: 8px;
  background-color: #ffd60a;
  border-radius: 50%;
`;

interface MenuItemType {
  label: string;
  onClick: () => void;
}
interface HeaderProps {
  title?: string;
  hasback?: boolean;
  backPath?: string;
  showAlarm?: boolean;
  menuItems?: MenuItemType[];
}

export default function MobileHeader({
  title,
  hasback = true,
  backPath,
  showAlarm = false,
  menuItems,
}: HeaderProps) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const handleLogoClick = () => {
    // [수정] 하드코딩된 '/home' -> 상수 교체
    navigate(ROUTES.HOME);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY >= 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
      return;
    }

    const params = new URLSearchParams(location.search);

    // [수정] TS 에러 해결: : string[] 타입을 명시하여 일반 문자열 비교 허용
    const specialPaths: string[] = [
      ROUTES.BOARD.UTIL,
      ROUTES.BOARD.COUNCIL,
      ROUTES.BOARD.CAMPUS,
      ROUTES.BOARD.TIPS,
    ];

    const shouldGoHome =
      specialPaths.includes(location.pathname) && [...params].length > 0;

    // [수정] 하드코딩된 'm/bus/info' -> 상수 교체 (ROUTES.BUS.INFO 사용)
    const isBusInfoPage = location.pathname.includes(ROUTES.BUS.INFO);

    if (isBusInfoPage) {
      navigate(ROUTES.BUS.ROOT);
    } else if (shouldGoHome) {
      navigate(ROUTES.HOME);
    } else {
      navigate(-1);
    }
  };

  return (
    <MobileHeaderWrapper $visible={true}>
      <MainHeaderWrapper $isScrolled={isScrolled}>
        {/*<UpperBackground src={UpperBackgroundImg} alt="background" />*/}
        {title ? (
          <TitleArea>
            {hasback && <BackButton onClick={handleBack} />}
            <Title title={title} />
          </TitleArea>
        ) : (
          <img className="logo" onClick={handleLogoClick} src={intipLogo} />
        )}

        {(showAlarm || menuItems) && (
          <ProfileMenuWrapper $isScrolled={isScrolled}>
            {showAlarm && <NotificationBell hasNew={false} />}
            {menuItems && <TopRightDropdownMenu items={menuItems} />}
          </ProfileMenuWrapper>
        )}
      </MainHeaderWrapper>
    </MobileHeaderWrapper>
  );
}

const MobileHeaderWrapper = styled.header<{ $visible: boolean }>`
  padding-top: 24px;
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  //background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  z-index: 2;

  transition: transform 0.3s ease;
  transform: ${({ $visible }) =>
    $visible ? "translateY(0)" : "translateY(-72px)"};
`;
const MainHeaderWrapper = styled.div<{ $isScrolled: boolean }>`
  width: 100%;
  height: 56px;
  padding-left: 36px;
  padding-right: 16px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  .logo {
    height: 100%;
    cursor: pointer;
    padding: 4px 0;
    //margin-left: 36px;
    box-sizing: border-box;

    opacity: ${({ $isScrolled }) => ($isScrolled ? 0 : 1)};
    visibility: ${({ $isScrolled }) => ($isScrolled ? "hidden" : "visible")};
    transition:
      opacity 0.1s ease,
      transform 0.1s ease,
      visibility 0s linear ${({ $isScrolled }) =>
        $isScrolled ? "0.3s" : "0s"};

`;

const ProfileMenuWrapper = styled.div<{ $isScrolled: boolean }>`
  display: flex;
  justify-content: center;
  align-content: center;

  gap: 16px;
  //margin-right: 16px;
  padding: 16px;

  border-radius: 100%;

  background: ${({ $isScrolled }) =>
    $isScrolled ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0)"};

  box-shadow: ${({ $isScrolled }) =>
    $isScrolled
      ? "0 2px 4px 0 rgba(0, 0, 0, 0.2)"
      : "0 2px 4px 0 rgba(0, 0, 0, 0)"};

  backdrop-filter: blur(${({ $isScrolled }) => ($isScrolled ? "5px" : "0px")});

  transition:
    background 0.1s ease,
    box-shadow 0.1s ease,
    backdrop-filter 0.1s ease;
`;

const TitleArea = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;

  //margin-left: 36px;
`;
