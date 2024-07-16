import styled from 'styled-components';
// import ModifyInfo from '../components/mypage/Password/modify';
import { useSelector } from 'react-redux';
import UserInfo from '../containers/mypage/UserInfo';
import UserModify from '../containers/mypage/UserModify';

interface loginInfo {
  user: {
    token: string;
  };
}



export default function MobileProfilePage() {
  const token = useSelector((state: loginInfo) => state.user.token);

  return (
    <MobileWritePageWrapper>
       <UserWrapper>
            {token && <UserInfo/>}
        </UserWrapper>
      <UserModify/>
    </MobileWritePageWrapper>
  );
}

const MobileWritePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 16px 0 16px;
  height: 96%;
  width: 100%;
`;

const UserWrapper = styled.div`
    position: absolute;
    top:0;
    width:100%;
    height: 30%;
    background: #A1C3FF;
    z-index:10;
    display: flex;
    justify-content: center;
`

