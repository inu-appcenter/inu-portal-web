import styled from "styled-components";
import UserInfo from "@/containers/mobile/mypage/UserInfo";
import UserModify from "@/containers/mobile/mypage/UserModify";
import useUserStore from "@/stores/useUserStore";
import { hasAgreedToTerms } from "@/components/common/TermsAgreement";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA } from "@/styles/responsive";

export default function MobileProfilePage() {
  const { userInfo } = useUserStore();
  // 최초 로그인(학과 미등록 + 약관 미동의) 사용자에게는 설정 화면으로 보인다.
  const isInitialSetup =
    userInfo.id !== 0 && !userInfo.department && !hasAgreedToTerms();

  useHeader({
    title: isInitialSetup ? "프로필 설정" : "프로필 수정",
  });

  return (
    <MobileProfilePageWrapper>
      <ContentShell>
        <TopSection>
          <UserWrapper>
            {userInfo.id && <UserInfo clickable={false} />}
          </UserWrapper>
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
