import styled from "styled-components";
import { WizardResultCard } from "@/components/mobile/timetable/wizard/ui";
import { typo } from "@/components/mobile/timetable/wizard/ui/tokens";
import type { WizardCandidate } from "@/types/timetableWizard";

interface WizardResultsScreenProps {
  candidates: WizardCandidate[];
  onSelectCandidate: (id: string) => void;
}

// Figma: 시간표 마법사 / 추천결과 (3237:9770)
const WizardResultsScreen = ({ candidates, onSelectCandidate }: WizardResultsScreenProps) => (
  <Body>
    <Hero>
      <HeroTitle>
        조건에 맞는
        <br />
        시간표 {candidates.length}개를 찾았어요!
      </HeroTitle>
      <HeroCaption>카드를 눌러 자세히 확인해 보세요.</HeroCaption>
    </Hero>

    <CardList>
      {candidates.map((candidate) => (
        <WizardResultCard
          key={candidate.id}
          name={candidate.label}
          recommended={candidate.recommended}
          totalCredits={candidate.totalCredit}
          courseCount={candidate.courses.length}
          courseNames={candidate.courses.map((course) => course.title)}
          tags={candidate.reasons.flatMap((reason) =>
            reason.tag ? [reason.tag] : [],
          )}
          onClick={() => onSelectCandidate(candidate.id)}
        />
      ))}
    </CardList>
  </Body>
);

export default WizardResultsScreen;

const Body = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--text-secondary, #333d4b);
`;

const HeroTitle = styled.h1`
  margin: 0;
  ${typo.title2}
`;

const HeroCaption = styled.p`
  margin: 0;
  ${typo.body2}
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
