import { useState } from "react";
import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import Icon from "@/components/common/Icon";
import WizardBottomCTA from "@/components/mobile/timetable/wizard/ui/WizardBottomCTA";
import WizardCheckbox from "@/components/mobile/timetable/wizard/ui/WizardCheckbox";
import { typography } from "@/styles/typography";

interface ServiceTermsSheetProps {
  open: boolean;
  /** 저장 중이면 버튼을 막고 "시작하는 중…"으로 바꾼다 */
  submitting: boolean;
  onAgree: () => void;
  onDismiss: () => void;
}

const TERMS = [
  { key: "terms", label: "INTIP 이용약관 필수동의", href: "/terms-of-use.html" },
  { key: "privacy", label: "개인정보 처리방침 필수동의", href: "/privacy-policy.html" },
] as const;

type TermKey = (typeof TERMS)[number]["key"];

/**
 * 가입 약관 동의 시트 (Figma 08-02 6272:18785, 확인 단계 05-3).
 * 이용약관(EULA) 동의는 App Store 가이드라인 1.2(UGC) 때문에 직접 체크하게 받는다.
 */
export default function ServiceTermsSheet({
  open,
  submitting,
  onAgree,
  onDismiss,
}: ServiceTermsSheetProps) {
  const [checked, setChecked] = useState<Record<TermKey, boolean>>({
    terms: false,
    privacy: false,
  });
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setChecked({ terms: false, privacy: false });
  }

  const allChecked = checked.terms && checked.privacy;

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next && !submitting) onDismiss();
      }}
      handle="compact"
      dismissible={!submitting}
    >
      <Content>
        <Terms>
          <AllBox>
            <Row
              type="button"
              role="checkbox"
              aria-checked={allChecked}
              onClick={() => setChecked({ terms: !allChecked, privacy: !allChecked })}
            >
              <ControlSlot>
                <WizardCheckbox checked={allChecked} />
              </ControlSlot>
              <AllLabel>약관 전체 동의</AllLabel>
            </Row>
          </AllBox>

          {TERMS.map((term) => (
            <ItemRow key={term.key}>
              <Row
                type="button"
                role="checkbox"
                aria-checked={checked[term.key]}
                onClick={() =>
                  setChecked((prev) => ({ ...prev, [term.key]: !prev[term.key] }))
                }
              >
                <ControlSlot>
                  <WizardCheckbox checked={checked[term.key]} />
                </ControlSlot>
                <ItemLabel>{term.label}</ItemLabel>
              </Row>
              <DetailLink
                href={term.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${term.label} 보기`}
              >
                <Icon name="chevron-right" size={20} />
              </DetailLink>
            </ItemRow>
          ))}

          <PolicyNote>
            INTIP은 욕설·혐오·성적 표현 등 부적절한 콘텐츠와 악성 사용자에 대해 무관용
            원칙을 적용해요. 위반하면 게시물이 삭제되고 계정 이용이 제한될 수 있어요.
          </PolicyNote>
        </Terms>

        <WizardBottomCTA
          placement="sheet"
          disabled={!allChecked || submitting}
          onClick={onAgree}
        >
          {submitting ? "시작하는 중…" : "동의하고 시작하기"}
        </WizardBottomCTA>
      </Content>
    </BottomSheet>
  );
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
`;

const Terms = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AllBox = styled.div`
  display: flex;
  padding: 4px 0;
  border-radius: 16px;
  background: var(--bg-subtle);
`;

const Row = styled.button`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 0 16px 0 0;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
`;

const ControlSlot = styled.span`
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* Figma Agree_All: 18/26 Bold (텍스트 스타일 없이 값으로 지정돼 있음) */
const AllLabel = styled.span`
  flex: 1 0 0;
  min-width: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
  color: var(--text-primary);
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
`;

const ItemLabel = styled.span`
  flex: 1 0 0;
  min-width: 0;
  ${typography.label1}
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DetailLink = styled.a`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  -webkit-tap-highlight-color: transparent;
`;

const PolicyNote = styled.p`
  margin: 0;
  padding: 16px 20px;
  border-radius: 16px;
  background: var(--bg-subtle);
  ${typography.caption1}
  color: var(--text-primary);
  word-break: keep-all;
`;
