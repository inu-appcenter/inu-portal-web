import styled from "styled-components";
import { Check } from "lucide-react";
import { safeLocalStorage } from "@/utils/safeStorage";

/**
 * 이용약관(EULA) 명시적 동의 UI.
 *
 * App Store 가이드라인 1.2(UGC)는 사용자가 "불쾌한 콘텐츠와 악성 사용자에 대한
 * 무관용 원칙"이 명시된 약관에 **동의하는 행위**를 하도록 요구한다. 문구만
 * 표시하고 "동의한 것으로 간주"하는 방식으로는 충족되지 않는다.
 *
 * 동의는 최초 로그인 직후 학과·닉네임을 설정하는 프로필 화면에서 받는다.
 * (RootLayout이 학과 미등록 또는 약관 미동의 상태의 사용자를 그 화면으로 보낸다.)
 */

/** 약관 개정 시 올린다. 버전이 다르면 다시 동의를 받는다. */
export const TERMS_VERSION = "2026-08-20";

/** 동의 시각 기록 키 */
export const TERMS_AGREED_STORAGE_KEY = "termsAgreement";

interface StoredAgreement {
  version: string;
  agreedAt: string;
}

/**
 * 현재 버전 약관에 동의한 이력이 있는지.
 *
 * 서버에 동의 여부를 저장하는 API가 아직 없어 기기 단위로 보관한다.
 * 기기를 바꾸거나 앱을 재설치하면 다시 동의를 받는다.
 */
export function hasAgreedToTerms(): boolean {
  const stored = safeLocalStorage.getItem(TERMS_AGREED_STORAGE_KEY);
  if (!stored) return false;

  try {
    const parsed = JSON.parse(stored) as Partial<StoredAgreement>;
    return parsed.version === TERMS_VERSION;
  } catch {
    return false;
  }
}

/**
 * 동의 이력을 지운다.
 *
 * 회원 탈퇴·로그아웃 시 호출한다. 다른 계정으로 로그인하거나 탈퇴 후 다시
 * 가입한 사용자에게 약관 동의를 새로 받기 위함이다.
 * (토큰 만료로 인한 자동 로그아웃에서는 호출하지 않는다.)
 */
export function clearTermsAgreement(): void {
  safeLocalStorage.removeItem(TERMS_AGREED_STORAGE_KEY);
}

/** 동의 이력을 기록한다. */
export function recordTermsAgreement(): void {
  const agreement: StoredAgreement = {
    version: TERMS_VERSION,
    agreedAt: new Date().toISOString(),
  };

  safeLocalStorage.setItem(TERMS_AGREED_STORAGE_KEY, JSON.stringify(agreement));
}

interface TermsAgreementProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function TermsAgreement({
  checked,
  onChange,
}: TermsAgreementProps) {
  return (
    <Wrapper>
      <CheckRow
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <CheckBox $checked={checked} aria-hidden="true">
          <Check size={14} strokeWidth={3} />
        </CheckBox>
        <CheckLabel>
          <strong>(필수)</strong> 이용약관 및 개인정보 처리방침에 동의합니다.
        </CheckLabel>
      </CheckRow>

      <PolicyNote>
        INTIP은 욕설·혐오·성적 표현 등 부적절한 콘텐츠와 악성 사용자에 대해{" "}
        <strong>무관용 원칙</strong>을 적용합니다. 위반 시 게시물이 삭제되고
        계정 이용이 제한될 수 있습니다.
      </PolicyNote>

      <LinkRow>
        <PolicyLink
          href="/terms-of-use.html"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          이용약관 보기
        </PolicyLink>
        <Separator aria-hidden="true">·</Separator>
        <PolicyLink
          href="/privacy-policy.html"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          개인정보 처리방침 보기
        </PolicyLink>
      </LinkRow>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  text-align: left;
`;

const CheckRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
`;

const CheckBox = styled.span<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 6px;
  box-sizing: border-box;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
  border: 1.5px solid
    ${({ $checked }) =>
      $checked ? "var(--border-brand, #0061ff)" : "var(--border-default, #e5e8eb)"};
  background-color: ${({ $checked }) =>
    $checked ? "var(--border-brand, #0061ff)" : "var(--bg-base, #ffffff)"};
  color: #ffffff;

  svg {
    opacity: ${({ $checked }) => ($checked ? 1 : 0)};
  }
`;

const CheckLabel = styled.span`
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary, #191f28);

  strong {
    color: var(--text-brand, #0061ff);
    font-weight: 600;
  }
`;

const PolicyNote = styled.p`
  margin: 0;
  padding-left: 30px;
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-tertiary, #8b95a1);
  word-break: keep-all;

  strong {
    color: var(--text-secondary, #333d4b);
    font-weight: 600;
  }
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 30px;
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
