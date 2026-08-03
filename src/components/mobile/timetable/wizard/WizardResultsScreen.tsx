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
              <ReasonHeadline>{reason.headline}</ReasonHeadline>
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
  color: var(--text-secondary, #333d4b);
  font-size: 18px;
  font-weight: 700;
  line-height: 23px;
`;

const ResultCard = styled.div<{ $recommended: boolean }>`
  background: var(--bg-base, #ffffff);
  border: 1px solid
    ${({ $recommended }) =>
      $recommended ? "var(--border-brand, #0061ff)" : "var(--border-default, #e5e8eb)"};
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CandidateLabel = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 17px;
  font-weight: 700;
`;

const RecommendedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--bg-brand-subtle, #eff6ff);
  color: var(--text-brand, #0061ff);
  font-size: 12px;
  font-weight: 700;
`;

const Spacer = styled.div`
  flex: 1;
`;

const SummaryText = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-weight: 500;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-default, #e5e8eb);
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ReasonItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const ReasonIcon = styled.span<{ $met: boolean }>`
  color: ${({ $met }) => ($met ? "var(--green-500, #10b981)" : "var(--orange-500, #f59e0b)")};
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  width: 12px;
  flex-shrink: 0;
`;

const ReasonHeadline = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  line-height: 20px;
`;

const FooterButton = styled.button`
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);
  color: var(--text-secondary, #333d4b);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;

const BottomSpacer = styled.div`
  height: 24px;
  flex-shrink: 0;
`;
