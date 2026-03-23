import styled from "styled-components";
import UserInfo from "@/containers/mobile/mypage/UserInfo";
import UserModify from "@/containers/mobile/mypage/UserModify";
import useUserStore from "@/stores/useUserStore";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA } from "@/styles/responsive";

export default function MobileProfilePage() {
  const { userInfo } = useUserStore();

  useHeader({
    title: "프로필 수정",
  });

  return (
    <MobileProfilePageWrapper>
      <ContentShell>
        <TopSection>
          <UserWrapper>{userInfo.id && <UserInfo clickable={false} />}</UserWrapper>
        </TopSection>

        <FormSection>
          <UserModify />
        </FormSection>
      </ContentShell>
    </MobileProfilePageWrapper>
  );
}

const MobileProfilePageWrapper = styled.div`
  width: 100%;
  min-height: 100%;
`;

const ContentShell = styled.div`
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 16px 16px 32px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    padding-top: 28px;
    padding-bottom: 48px;
  }
`;

const TopSection = styled.section`
  margin-bottom: 16px;

  @media ${DESKTOP_MEDIA} {
    margin-bottom: 20px;
  }
`;

const UserWrapper = styled.div`
  width: 100%;

  > div {
    width: 100%;
    max-width: 100%;
  }
`;

const FormSection = styled.div`
  position: relative;
`;
