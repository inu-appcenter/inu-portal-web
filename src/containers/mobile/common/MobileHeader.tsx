import { ROUTES } from "@/constants/routes";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import intipLogo from "@/resources/assets/intip-logo.svg";
import { useLocation, useNavigate } from "react-router-dom";
import UpperBackgroundImg from "@/resources/assets/mobile-common/upperBackgroundImg.svg";

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
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  const handleLogoClick = () => {
    // [수정] 하드코딩된 '/home' -> 상수 교체
    navigate(ROUTES.HOME);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY.current && currentY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <MobileHeaderWrapper $visible={showHeader}>
      <MainHeaderWrapper>
        <UpperBackground src={UpperBackgroundImg} alt="background" />
        {title ? (
          <TitleArea>
            {hasback && (
              <BackButtonWrapper onClick={handleBack}>
                <BackButton />
              </BackButtonWrapper>
            )}

            <Title title={title} />
          </TitleArea>
        ) : (
          <img className="logo" onClick={handleLogoClick} src={intipLogo} />
        )}

        <ProfileMenuWrapper>
          {showAlarm && <NotificationBell hasNew={false} />}
          {menuItems && <TopRightDropdownMenu items={menuItems} />}
        </ProfileMenuWrapper>
      </MainHeaderWrapper>
    </MobileHeaderWrapper>
  );
}

const MobileHeaderWrapper = styled.header<{ $visible: boolean }>`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  z-index: 2;

  transition: transform 0.3s ease;
  transform: ${({ $visible }) =>
    $visible ? "translateY(0)" : "translateY(-72px)"};
`;
const MainHeaderWrapper = styled.div`
  width: 100%;
  height: 56px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  .logo {
    height: 100%;
    cursor: pointer;
    padding: 4px 0;
    margin-left: 24px;
    box-sizing: border-box;
  }
`;

const UpperBackground = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
`;

const ProfileMenuWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: 24px;
`;

const BackButtonWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
`;

const TitleArea = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
`;
