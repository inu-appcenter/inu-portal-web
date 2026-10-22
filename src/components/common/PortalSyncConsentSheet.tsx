import { useEffect, useState } from "react";
import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import Icon from "@/components/common/Icon";
import PortalSyncTermDetail from "@/components/common/PortalSyncTermDetail";
import WizardBottomCTA from "@/components/mobile/timetable/wizard/ui/WizardBottomCTA";
import WizardCheckbox from "@/components/mobile/timetable/wizard/ui/WizardCheckbox";
import {
  PORTAL_SYNC_POLICY_NOTE,
  PORTAL_SYNC_TERMS,
  type PortalSyncTermKey,
} from "@/constants/portalSyncTerms";
import { typography } from "@/styles/typography";
import {
  setPortalSyncConsentHostMounted,
  settlePortalSyncConsentRequest,
  usePortalSyncConsentStore,
} from "@/utils/portalSyncConsent";

/** 포털 계정 등록 모달(Modal z-index 20000) 위에서도 보이도록 */
const SHEET_Z_INDEX = 20010;

const UNCHECKED: Record<PortalSyncTermKey, boolean> = { portal: false, ai: false };

interface PortalSyncConsentSheetProps {
  open: boolean;
  onAgree: (result: { ai: boolean }) => void;
  onDismiss: () => void;
}

/**
 * 포털 정보 불러오기 동의 시트 (Figma 6431:20082, 가입 약관 시트와 같은 틀).
 * 항목 오른쪽 › 를 누르면 시트 안에서 상세 약관으로 바뀌어, 체크 상태를 잃지 않는다.
 */
export function PortalSyncConsentSheet({
  open,
  onAgree,
  onDismiss,
}: PortalSyncConsentSheetProps) {
  const [checked, setChecked] = useState(UNCHECKED);
  const [detailKey, setDetailKey] = useState<PortalSyncTermKey | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  // 시트를 다시 열 때마다 체크와 화면을 처음으로 돌린다(렌더 중 prop 변화 감지 패턴).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setChecked(UNCHECKED);
      setDetailKey(null);
    }
  }

  const allChecked = PORTAL_SYNC_TERMS.every(({ key }) => checked[key]);
  const requiredChecked = PORTAL_SYNC_TERMS.filter((t) => t.required).every(
    ({ key }) => checked[key],
  );
  const detailTerm = PORTAL_SYNC_TERMS.find((t) => t.key === detailKey);

  const toggle = (key: PortalSyncTermKey) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss();
      }}
      handle="compact"
      zIndex={SHEET_Z_INDEX}
    >
      {detailTerm ? (
        <Content>
          <PortalSyncTermDetail term={detailTerm} onBack={() => setDetailKey(null)} />
          <WizardBottomCTA
            placement="sheet"
            onClick={() => {
              setChecked((prev) => ({ ...prev, [detailTerm.key]: true }));
              setDetailKey(null);
            }}
          >
            {checked[detailTerm.key] ? "확인" : "동의하기"}
          </WizardBottomCTA>
        </Content>
      ) : (
        <Content>
          <Terms>
            <AllBox>
              <Row
                type="button"
                role="checkbox"
                aria-checked={allChecked}
                onClick={() =>
                  setChecked({ portal: !allChecked, ai: !allChecked })
                }
              >
                <ControlSlot>
                  <WizardCheckbox checked={allChecked} />
                </ControlSlot>
                <AllLabel>전체 동의 (선택 포함)</AllLabel>
              </Row>
            </AllBox>

            {PORTAL_SYNC_TERMS.map(({ key, label }) => (
              <ItemRow key={key}>
                <Row
                  type="button"
                  role="checkbox"
                  aria-checked={checked[key]}
                  onClick={() => toggle(key)}
                >
                  <ControlSlot>
                    <WizardCheckbox checked={checked[key]} />
                  </ControlSlot>
                  <ItemLabel>{label}</ItemLabel>
                </Row>
                <DetailButton
                  type="button"
                  onClick={() => setDetailKey(key)}
                  aria-label={`${label} 자세히 보기`}
                >
                  <Icon name="chevron-right" size={20} />
                </DetailButton>
              </ItemRow>
            ))}

            <PolicyNote>{PORTAL_SYNC_POLICY_NOTE}</PolicyNote>
          </Terms>

          <WizardBottomCTA
            placement="sheet"
            disabled={!requiredChecked}
            onClick={() => onAgree({ ai: checked.ai })}
          >
            동의하고 연결하기
          </WizardBottomCTA>
        </Content>
      )}
    </BottomSheet>
  );
}

/**
 * 앱 어디서든 requestPortalSyncConsent()가 불리면 동의 시트를 띄운다. RootLayout에 하나만 둔다.
 */
export default function PortalSyncConsentHost() {
  const requestOpen = usePortalSyncConsentStore((s) => s.requestOpen);

  useEffect(() => {
    setPortalSyncConsentHostMounted(true);
    return () => setPortalSyncConsentHostMounted(false);
  }, []);

  return (
    <PortalSyncConsentSheet
      open={requestOpen}
      onAgree={({ ai }) => settlePortalSyncConsentRequest({ agreed: true, ai })}
      onDismiss={() => settlePortalSyncConsentRequest({ agreed: false })}
    />
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

const AllLabel = styled.span`
  flex: 1 0 0;
  min-width: 0;
  /* Figma 'Agree_All' 라벨(18/700). 같은 크기의 텍스트 토큰이 없어 가입 약관 시트와 같은 값을 쓴다. */
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

const DetailButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: var(--text-primary);
  cursor: pointer;
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
