import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import intipLogo from "resources/assets/intip-logo.svg";
import ProfileImage from "mobile/components/common/ProfileImage";
import MenuButton from "mobile/components/common/MenuButton";
import LoginNavigateButton from "mobile/components/common/LoginNavigateButton";
import useUserStore from "stores/useUserStore";
import useMobileNavigate from "hooks/useMobileNavigate";
import { ReactSVG } from "react-svg";
import UpperBackgroundImg from "resources/assets/mobile-common/upperBackgroundImg.svg";

export default function MobileHeader() {
  const { userInfo } = useUserStore();
  const mobileNavigate = useMobileNavigate();
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const handleLogoClick = () => {
    mobileNavigate(`/home`);
  };

  const handleProfileClick = () => {
    mobileNavigate("/mypage");
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY.current && currentY > 50) {
        // 아래로 스크롤
        setShowHeader(false);
      } else {
        // 위로 스크롤
        setShowHeader(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <MobileHeaderWrapper $visible={showHeader}>
      <UpperBackground />
      <ReactSVG onClick={handleLogoClick} src={intipLogo} />
      <ProfileMenuWrapper>
        {userInfo.nickname ? (
          <PostInfo onClick={handleProfileClick}>
            <ProfileImage fireId={userInfo.fireId} />
            {userInfo.nickname}
          </PostInfo>
        ) : (
          <LoginNavigateButton />
        )}
        <MenuButton />
      </ProfileMenuWrapper>
    </MobileHeaderWrapper>
  );
}
const MobileHeaderWrapper = styled.header<{ $visible: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  height: 72px;
  padding: 0 24px;
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  z-index: 999;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  transition: transform 0.3s ease;
  transform: ${({ $visible }) =>
    $visible ? "translateY(0)" : "translateY(-100%)"};
`;

const UpperBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-image: url(${UpperBackgroundImg});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  opacity: 1;
  z-index: -1;
`;

const ProfileMenuWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PostInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  background: #ecf4ff;
  font-size: 14px;
  color: #666;
  border-radius: 100px;
  padding: 5px;
  font-weight: 400;
`;
