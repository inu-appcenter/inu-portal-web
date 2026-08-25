import styled from "styled-components";

/**
 * 약관·개인정보 처리방침 링크만 보여주는 안내 문구.
 *
 * 실제 동의(체크) 절차는 최초 로그인 후 프로필 설정 화면의 TermsAgreement에서
 * 받는다. 여기서는 로그인 전에도 내용을 확인할 수 있도록 링크만 제공한다.
 */
export default function TermsLinks() {
  return (
    <Wrapper>
      <PolicyLink
        href="/terms-of-use.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        이용약관
      </PolicyLink>
      <Separator aria-hidden="true">·</Separator>
      <PolicyLink
        href="/privacy-policy.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        개인정보 처리방침
      </PolicyLink>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
`;

const PolicyLink = styled.a`
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  color: var(--text-tertiary, #8b95a1);
  text-decoration: underline;
`;

const Separator = styled.span`
  font-size: 12px;
  color: var(--text-tertiary, #8b95a1);
`;
