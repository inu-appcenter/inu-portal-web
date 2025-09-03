import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import intipLogo from "resources/assets/intip-logo.svg";
import MenuButton from "mobile/components/common/MenuButton";
import useMobileNavigate from "hooks/useMobileNavigate";
import { useLocation } from "react-router-dom";
import UpperBackgroundImg from "resources/assets/mobile-common/upperBackgroundImg.svg";

import BackButton from "../../components/mypage/BackButton.tsx";
import Title from "../../components/mypage/Title.tsx";

interface HeaderProps {
  title?: string;
  hasback?: boolean;
  backPath?: string;
}

export default function MobileHeader({
  title,
  hasback = true,
  backPath,
}: HeaderProps) {
  const mobileNavigate = useMobileNavigate();
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();

  const handleLogoClick = () => {
    mobileNavigate(`/home`);
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
      // backPath가 존재하면 우선 이동
      mobileNavigate(backPath);
      return;
    }

    const params = new URLSearchParams(location.search);
    const specialPaths = [
      "/m/home/util",
      "/m/home/council",
      "/m/home/campus",
      "/m/home/tips",
    ];

    const shouldGoHome =
      specialPaths.includes(location.pathname) && [...params].length > 0;

    const isBusInfoPage = location.pathname.includes("m/bus/info");

    if (isBusInfoPage) {
      mobileNavigate("/Bus");
    } else if (shouldGoHome) {
      mobileNavigate("/home");
    } else {
      mobileNavigate(-1);
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
          <MenuButton />
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
  //box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;

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
  //padding: 0 24px;
  box-sizing: border-box;

  .logo {
    //width: 100px;
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
  object-fit: cover; /* 이미지가 부모 영역 꽉 채움 */
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
