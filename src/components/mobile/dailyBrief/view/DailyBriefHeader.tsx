import { useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import Icon from "@/components/common/Icon";

interface DailyBriefHeaderProps {
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  onBack?: () => void;
}

export default function DailyBriefHeader({
  isSpeaking,
  onToggleSpeech,
  onBack,
}: DailyBriefHeaderProps) {
  const currentHour = new Date().getHours();

  const { title, subtitle } = useMemo(() => {
    if (currentHour >= 5 && currentHour < 12) {
      return {
        title: "상쾌한 아침이에요",
        subtitle: "좋은 느낌으로 오늘을 가득 채워 보세요.",
      };
    } else if (currentHour >= 12 && currentHour < 18) {
      return {
        title: "활기찬 오후예요",
        subtitle: "남은 하루도 기분 좋은 일들로 가득하길 바라요.",
      };
    } else if (currentHour >= 18 && currentHour < 22) {
      return {
        title: "편안한 저녁이에요",
        subtitle: "오늘 하루도 정말 수고 많으셨어요.",
      };
    } else {
      return {
        title: "고요한 밤이에요",
        subtitle: "편안한 휴식과 함께 내일을 준비해 보세요.",
      };
    }
  }, [currentHour]);

  return (
    <HeaderContainer>
      {onBack && (
        <TopNavRow>
          <BackButton onClick={onBack} aria-label="뒤로 가기">
            <Icon name="chevron-left" size={24} color="#1E232A" />
          </BackButton>
        </TopNavRow>
      )}

      <TopActionRow>
        <div style={{ flex: 1 }} />
        <AudioButton
          $active={isSpeaking}
          onClick={onToggleSpeech}
          aria-label={isSpeaking ? "브리핑 음성 멈추기" : "브리핑 음성 듣기"}
        >
          <WaveformContainer $active={isSpeaking}>
            <WaveBar $delay="0ms" $active={isSpeaking} />
            <WaveBar $delay="150ms" $active={isSpeaking} />
            <WaveBar $delay="300ms" $active={isSpeaking} />
            <WaveBar $delay="100ms" $active={isSpeaking} />
            <WaveBar $delay="250ms" $active={isSpeaking} />
          </WaveformContainer>
        </AudioButton>
      </TopActionRow>

      <TitleSection>
        <MainGreeting>{title}</MainGreeting>
        <SubGreeting>{subtitle}</SubGreeting>
      </TitleSection>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  width: 100%;
  padding-top: 12px;
  padding-bottom: 24px;
`;

const TopNavRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  margin-left: -4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.15s ease;

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const TopActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 24px;
`;

const AudioButton = styled.button<{ $active: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: ${({ $active }) =>
    $active ? "rgba(94, 146, 240, 0.95)" : "rgba(255, 255, 255, 0.85)"};
  border: 1px solid
    ${({ $active }) =>
      $active ? "rgba(94, 146, 240, 0.3)" : "rgba(255, 255, 255, 0.6)"};
  box-shadow: 0 4px 16px
    ${({ $active }) =>
      $active ? "rgba(94, 146, 240, 0.35)" : "rgba(0, 0, 0, 0.06)"};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const WaveformContainer = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 20px;
`;

const waveAnimation = keyframes`
  0%, 100% {
    height: 6px;
  }
  50% {
    height: 18px;
  }
`;

const WaveBar = styled.div<{ $delay: string; $active: boolean }>`
  width: 3px;
  height: ${({ $active }) => ($active ? "14px" : "12px")};
  background-color: ${({ $active }) => ($active ? "#FFFFFF" : "#1E232A")};
  border-radius: 2px;
  transition:
    background-color 0.2s ease,
    height 0.2s ease;

  ${({ $active, $delay }) =>
    $active &&
    css`
      animation: ${waveAnimation} 1s ease-in-out infinite;
      animation-delay: ${$delay};
    `}
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MainGreeting = styled.h1`
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.8px;
  color: #111827;
  margin: 0;
  line-height: 1.2;
`;

const SubGreeting = styled.p`
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: #374151;
  margin: 0;
  line-height: 1.4;
`;
