import styled from "styled-components";
import UserInfo from "@/containers/mobile/mypage/UserInfo";
import UserModify from "@/containers/mobile/mypage/UserModify";
import useUserStore from "@/stores/useUserStore";
import { useHeader } from "@/context/HeaderContext";

export default function MobileProfilePage() {
  const { userInfo } = useUserStore();

  // 헤더 설정 주입
  useHeader({
    title: "프로필 수정",
  });

  return (
    <MobileProfilePageWrapper>
      <Background>
        <UserWrapper>{userInfo.id && <UserInfo />}</UserWrapper>
      </Background>
      <UserModify />
    </MobileProfilePageWrapper>
  );
}

const MobileProfilePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  //padding: 0 16px 0 16px;
  box-sizing: border-box;

  height: 96%;
  width: 100%;
`;

const Background = styled.div`
  background-color: #a1c3ff;
  height: 200px;
  top: 0;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const UserWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  //margin-top: 32px;
`;
