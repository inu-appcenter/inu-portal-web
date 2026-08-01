import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

interface WizardGeneratingScreenProps {
  onCancel: () => void;
}

const ROTATING_SUBTITLES = [
  "조건에 맞는 강의를 찾고 있어요",
  "시간이 겹치지 않는 조합을 계산하고 있어요",
  "선호 조건에 가까운 시간표를 고르고 있어요",
];

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
      <Center>
        <Spinner />
        <Title>시간표를 조합하는 중</Title>
        <Subtitle>{ROTATING_SUBTITLES[subtitleIndex]}</Subtitle>
      </Center>
      <CancelArea>
        <CancelButton type="button" onClick={onCancel}>
          취소
        </CancelButton>
      </CancelArea>
    </Wrapper>
  );
};

export default WizardGeneratingScreen;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-base, #ffffff);
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 24px;
`;

const Spinner = styled.div`
  width: 56px;
  height: 56px;
  border: 4px solid var(--border-default, #e5e8eb);
  border-top-color: var(--interactive-primary, #3b82f6);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Title = styled.h1`
  margin: 0;
  color: var(--text-secondary, #333d4b);
  font-size: 18px;
  font-weight: 700;
  line-height: 27px;
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  line-height: 21px;
  text-align: center;
`;

const CancelArea = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px 0 calc(24px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
`;

const CancelButton = styled.button`
  min-width: 120px;
  height: 44px;
  padding: 0 24px;
  border-radius: 999px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  color: var(--text-secondary, #333d4b);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;
