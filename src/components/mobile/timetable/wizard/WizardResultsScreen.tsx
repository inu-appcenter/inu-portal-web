import styled from "styled-components";
import WizardMiniTimetable from "@/components/mobile/timetable/wizard/WizardMiniTimetable";
import type { WizardCandidate } from "@/types/timetableWizard";

interface WizardResultsScreenProps {
  candidates: WizardCandidate[];
  onSelectCandidate: (id: string) => void;
}

const WizardResultsScreen = ({ candidates, onSelectCandidate }: WizardResultsScreenProps) => (
  <ScrollContent>
    <Heading>조건에 맞는 시간표 {candidates.length}개를 찾았어요</Heading>

    {candidates.map((candidate) => (
      <ResultCard key={candidate.id} $recommended={!!candidate.recommended}>
        <CardHeader>
          <CandidateLabel>{candidate.label}</CandidateLabel>
          {candidate.recommended && <RecommendedBadge>추천</RecommendedBadge>}
          <Spacer />
          <SummaryText>
            {candidate.totalCredit}학점 · {candidate.courses.length}과목
          </SummaryText>
        </CardHeader>

        <WizardMiniTimetable courses={candidate.courses} />

        <Divider />

        <ReasonList>
          {candidate.reasons.map((reason, index) => (
            <ReasonItem key={index}>
              <ReasonIcon $met={reason.met}>{reason.met ? "✓" : "!"}</ReasonIcon>
              <ReasonHeadline $met={reason.met}>{reason.headline}</ReasonHeadline>
            </ReasonItem>
          ))}
        </ReasonList>

        <FooterButton type="button" onClick={() => onSelectCandidate(candidate.id)}>
          자세히 보기
        </FooterButton>
      </ResultCard>
    ))}
    <BottomSpacer />
  </ScrollContent>
);

export default WizardResultsScreen;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
`;

const Heading = styled.h1`
  margin: 0;
  color: var(--text-primary, #191f28);
  font-size: 15px;
  font-weight: 700;
  line-height: 23px;
`;

const ResultCard = styled.div<{ $recommended: boolean }>`
  background: var(--bg-base, #ffffff);
  border-width: ${({ $recommended }) => ($recommended ? "1.5px" : "1px")};
  border-style: solid;
  border-color: ${({ $recommended }) =>
    $recommended ? "var(--interactive-primary, #3b82f6)" : "var(--border-default, #e5e8eb)"};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CandidateLabel = styled.span`
  color: var(--text-primary, #191f28);
  font-size: 16px;
  font-weight: 700;
`;

const RecommendedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--bg-brand, #eff6ff);
  color: var(--interactive-primary, #3b82f6);
  font-size: 11px;
  font-weight: 700;
`;

const Spacer = styled.div`
  flex: 1;
`;

const SummaryText = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  font-weight: 400;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-default, #e5e8eb);
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ReasonItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const ReasonIcon = styled.span<{ $met: boolean }>`
  color: ${({ $met }) => ($met ? "#16a34a" : "#d97706")};
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
  width: 12px;
  flex-shrink: 0;
`;

const ReasonHeadline = styled.span<{ $met: boolean }>`
  color: ${({ $met }) => ($met ? "var(--text-secondary, #333d4b)" : "#d97706")};
  font-size: 13px;
  line-height: 20px;
`;

const FooterButton = styled.button`
  height: 41px;
  border-radius: 10px;
  border: none;
  background: var(--bg-subtle, #f8f9fb);
  color: var(--interactive-primary, #3b82f6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;

const BottomSpacer = styled.div`
  height: 24px;
  flex-shrink: 0;
`;
