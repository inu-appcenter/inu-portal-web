import { useSelector } from 'react-redux';
import ProfileNickname from '../../components/common/ProfileNickname';
import ProfileImage from '../../components/common/ProfileImage';
import styled from 'styled-components';

interface loginInfo {
  user: {
    token: string;
  };
}

export default function UserInfo() {
  const token = useSelector((state: loginInfo) => state.user.token);
  const fireId: number = useSelector((state: any) => state.user.fireId);
  const nickname: string = useSelector((state: any) => state.user.nickname);

  return (
    <UserInfoWrapper>
      {token && (
        <>
          <ProfileImage fireId={fireId} />
          <ProfileNickname nickname={nickname}/>
        </>
      )}
    </UserInfoWrapper>
  );
}

const UserInfoWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-top: 80px;
    width:135px;
    height: 135px;
    img {
      width: 100%;
      height: 100%;
      margin-bottom: 10px;
    }


`

