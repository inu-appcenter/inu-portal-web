import styled from 'styled-components';
import { useSelector } from 'react-redux';
import AppLogo from '../../components/common/AppLogo';
import ProfileImage from '../../components/common/ProfileImage';
import MenuButton from '../../components/common/MenuButton';
import ProfileNickname from '../../components/common/ProfileNickname';
import LoginNavigateButton from '../../components/common/LoginNavigateButton';

export default function MobileHeader() {
  const fireId: number = useSelector((state: any) => state.user.fireId);
  const nickname: string = useSelector((state: any) => state.user.nickname);
  const token: string = useSelector((state: any) => state.user.token);
  return (
    <MobileHeaderWrapper>
      <AppLogoWrapper>
        <AppLogo />
      </AppLogoWrapper>
      <ProfileMenuWrapper>     
        {token ? (
          <>
            <ProfileImage fireId={fireId} />
            <ProfileNickname nickname={nickname} />
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

const MobileHeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  padding: 0 16px;
  position:relative;
    z-index:20;
`;

const AppLogoWrapper = styled.div`
  flex: 1;
`;

const ProfileMenuWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
