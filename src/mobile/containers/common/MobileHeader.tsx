import styled from "styled-components";
import intipLogo from "resources/assets/intip-logo.svg";
import ProfileImage from "mobile/components/common/ProfileImage";
import ProfileNickname from "mobile/components/common/ProfileNickname";
import MenuButton from "mobile/components/common/MenuButton";
import LoginNavigateButton from "mobile/components/common/LoginNavigateButton";
import useUserStore from "stores/useUserStore";
import { useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

export default function MobileHeader() {
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();

  const handleClick = () => {
    if (window.AndroidBridge && window.AndroidBridge.navigateTo) {
      window.AndroidBridge.navigateTo("home", "/home");
    } else {
      navigate(`${isAppUrl}/home`);
    }
  };

  return (
    <MobileHeaderWrapper>
      <img onClick={handleClick} src={intipLogo} />
      <ProfileMenuWrapper>
        {userInfo.nickname ? (
          <>
            <ProfileImage fireId={userInfo.fireId} />
            <ProfileNickname nickname={userInfo.nickname} />
          </>
        ) : (
          <>
            <LoginNavigateButton />
          </>
        )}
        <MenuButton />
      </ProfileMenuWrapper>
    </MobileHeaderWrapper>
  );
}

const MobileHeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  padding: 0 24px;
  position: relative;
  z-index: 20;
`;

const ProfileMenuWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
