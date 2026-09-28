import { useEffect, useState } from "react";
import styled from "styled-components";
import { wizardGenerating } from "@/resources/assets/illustrations/timetable";
import { WizardBottomCTA } from "@/components/mobile/timetable/wizard/ui";
import { typo } from "@/components/mobile/timetable/wizard/ui/tokens";

interface WizardGeneratingScreenProps {
  onCancel: () => void;
}

const ROTATING_SUBTITLES = [
  "조건에 맞는 강의를 찾고 있어요",
  "시간이 겹치지 않는 조합을 계산하고 있어요",
  "선호 조건에 가까운 시간표를 고르고 있어요",
];

// Figma: 시간표 마법사 / 생성중 (3057:9468)
const WizardGeneratingScreen = ({ onCancel }: WizardGeneratingScreenProps) => {
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSubtitleIndex((i) => (i + 1) % ROTATING_SUBTITLES.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Wrapper>
      <Loading role="status" aria-live="polite">
        <Illustration src={wizardGenerating} alt="" />
        <Copy>
          <Title>시간표를 조합하는 중</Title>
          <Subtitle>{ROTATING_SUBTITLES[subtitleIndex]}</Subtitle>
        </Copy>
      </Loading>
      <WizardBottomCTA onClick={onCancel}>취소</WizardBottomCTA>
    </Wrapper>
  );
};

export default WizardGeneratingScreen;

const Wrapper = styled.div`
  flex: 1;
  width: 100%;
  min-height: calc(100dvh - var(--header-height, 56px));
  display: flex;
  flex-direction: column;
`;

const Loading = styled.div`
  flex: 1;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

// 원본 일러스트는 세로로 길어 위아래를 15%씩 잘라 260×300 틀에 맞춘다(시안 동일)
const Illustration = styled.img`
  width: 260px;
  height: 300px;
  object-fit: cover;
`;

const Copy = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
`;

const Title = styled.p`
  margin: 0;
  color: var(--text-primary, #191f28);
  ${typo.title2}
`;

/* body/1 — Regular 16/1.6 */
const Subtitle = styled.p`
  margin: 0;
  color: var(--text-secondary, #333d4b);
  font-size: 16px;
  line-height: 1.6;
`;
