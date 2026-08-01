import styled from "styled-components";
import CapsuleButton from "@/components/common/CapsuleButton";
import 안내횃불이 from "@/resources/assets/book/안내횃불이.png";
import type { WizardConflictItem } from "@/types/timetableWizard";

interface WizardEmptyStateProps {
  conflicts: WizardConflictItem[];
  onRelax: () => void;
}

export function WizardEmptyState({ conflicts, onRelax }: WizardEmptyStateProps) {
  return (
    <Wrapper>
      <Body>
        <Illustration src={안내횃불이} alt="" />
        <Title>조건에 맞는 시간표를 못 찾았어요</Title>
        <Subtitle>조건을 조금만 풀면 결과가 나올 수 있어요</Subtitle>

        {conflicts.length > 0 && (
          <ConflictCard>
            <ConflictHead>⚠ 서로 충돌하는 조건</ConflictHead>
            <ConflictList>
              {conflicts.map((c, index) => (
                <ConflictItem key={index}>· {c.label}</ConflictItem>
              ))}
            </ConflictList>
            <ConflictFootnote>이 조건들을 동시에 만족하는 조합이 없어요.</ConflictFootnote>
          </ConflictCard>
        )}
      </Body>
      <BottomArea>
        <CapsuleButton variant="primary" fullWidth onClick={onRelax}>
          조건 완화하기
        </CapsuleButton>
      </BottomArea>
    </Wrapper>
  );
}

interface WizardErrorStateProps {
  onRetry: () => void;
}

export function WizardErrorState({ onRetry }: WizardErrorStateProps) {
  return (
    <Wrapper>
      <Body>
        <ErrorIllustration>!</ErrorIllustration>
        <Title>시간표를 만들지 못했어요</Title>
        <Subtitle>네트워크 상태를 확인하고 다시 시도해주세요</Subtitle>
      </Body>
      <BottomArea>
        <CapsuleButton variant="primary" fullWidth onClick={onRetry}>
          다시 시도
        </CapsuleButton>
      </BottomArea>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  min-height: calc(100vh - var(--header-height));
  width: 100%;
  box-sizing: border-box;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 16px 24px;
  gap: 8px;
`;

const Illustration = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 16px;
`;

const ErrorIllustration = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--bg-error, #fff0f0);
  color: var(--text-error, #ef4444);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  margin: 0;
  color: var(--text-secondary, #333d4b);
  font-size: 19px;
  font-weight: 700;
  line-height: 27px;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0 0 16px;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  line-height: 21px;
  text-align: center;
`;

const ConflictCard = styled.div`
  width: 100%;
  background: var(--bg-error, #fff0f0);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
`;

const ConflictHead = styled.span`
  color: var(--text-error, #ef4444);
  font-size: 15px;
  font-weight: 700;
`;

const ConflictList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ConflictItem = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  line-height: 20px;
`;

const ConflictFootnote = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  line-height: 18px;
`;

const BottomArea = styled.div`
  padding: 16px 20px calc(24px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
`;
