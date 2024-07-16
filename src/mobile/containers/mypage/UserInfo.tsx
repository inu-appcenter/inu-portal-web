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
    margin-top: 70px;
    img {
        width:57px;
        height: 57px;
    }
    
    p {
        font-family: Roboto;
        font-size: 15px;
        font-weight: 700;

        color:white;
    }

`

