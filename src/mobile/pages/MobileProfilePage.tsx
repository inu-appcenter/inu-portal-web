import styled from "styled-components";
import UserInfo from "mobile/containers/mypage/UserInfo";
import UserModify from "mobile/containers/mypage/UserModify";
import useUserStore from "stores/useUserStore";
import MobileHeader from "../containers/common/MobileHeader.tsx";

export default function MobileProfilePage() {
  const { userInfo } = useUserStore();

  return (
    <MobileProfilePageWrapper>
      <MobileHeader title={"프로필 수정"} />
      <Background />
      <UserWrapper>{userInfo.id && <UserInfo />}</UserWrapper>
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
  padding-top: 72px;

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
