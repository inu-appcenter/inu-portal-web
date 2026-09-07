import styled from "styled-components";

/**
 * 약관·개인정보 처리방침 링크만 보여주는 안내 문구.
 *
 * 실제 동의(체크) 절차는 최초 로그인 후 프로필 설정 화면의 TermsAgreement에서
 * 받는다. 여기서는 로그인 전에도 내용을 확인할 수 있도록 링크만 제공한다.
 */
export default function TermsLinks() {
  return (
    <Sentence>
      로그인 시{" "}
      <PolicyLink
        href="/terms-of-use.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        이용약관
      </PolicyLink>{" "}
      및{" "}
      <PolicyLink
        href="/privacy-policy.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        개인정보 처리방침
      </PolicyLink>
      에 동의한 것으로 간주됩니다.
    </Sentence>
  );
}

const Sentence = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--text-tertiary, #8b95a1);
`;

const PolicyLink = styled.a`
  color: var(--text-brand, #0061ff);
  text-decoration: none;
`;
