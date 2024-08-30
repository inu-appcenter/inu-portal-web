import styled from "styled-components";
// import ModifyInfo from '../components/mypage/Password/modify';
import { useSelector } from "react-redux";
import UserInfo from "../containers/mypage/UserInfo";
import UserModify from "../containers/mypage/UserModify";

interface loginInfo {
  user: {
    token: string;
  };
}

export default function MobileProfilePage() {
  const token = useSelector((state: loginInfo) => state.user.token);

  return (
    <MobileProfilePageWrapper>
      <Background />
      <UserWrapper>{token && <UserInfo />}</UserWrapper>
      <UserModify />
    </MobileProfilePageWrapper>
  );
}

const MobileProfilePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 16px 0 16px;
  height: 96%;
  width: 100%;
`;

const Background = styled.div`
  background-color: #a1c3ff;
  height: 310px;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -1;
`;

const UserWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 32px;
`;
