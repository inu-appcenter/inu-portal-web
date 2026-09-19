import styled, { css, keyframes } from "styled-components";
import Icon from "@/components/common/Icon";
import Skeleton from "@/components/common/Skeleton";
import LoadingAnimation from "@/resources/assets/illustrations/횃불이ai로딩애니메이션.gif";
import ChatbotLogo from "@/resources/assets/illustrations/chatbot-logo.svg";

interface DailyBriefHeaderProps {
  onBack?: () => void;
  isLoading?: boolean;
  shouldAnimate?: boolean;
  title: string;
  subtitle: string;
}

export default function DailyBriefHeader({
  onBack,
  isLoading = false,
  shouldAnimate = true,
  title,
  subtitle,
}: DailyBriefHeaderProps) {
  return (
    <HeaderContainer>
      {onBack && (
        <TopNavRow>
          <BackButton onClick={onBack} aria-label="뒤로 가기">
            <Icon name="chevron-left" size={24} color="#1E232A" />
          </BackButton>
        </TopNavRow>
      )}

      {/* 상단 멘트 바로 윗줄 왼쪽: 로딩 GIF -> 챗봇 로고(chatbot-logo.svg) 자연스러운 크로스페이드 */}
      <MascotRow>
        <MascotLayer>
          <MascotGif
            src={LoadingAnimation}
            alt="횃불이 AI 로딩"
            $visible={isLoading}
            $shouldAnimate={shouldAnimate}
          />
          <MascotStaticLogo
            src={ChatbotLogo}
            alt="횃불이 AI 로고"
            $visible={!isLoading}
            $shouldAnimate={shouldAnimate}
          />
        </MascotLayer>
      </MascotRow>

      <TitleSection>
        {isLoading ? (
          <SkeletonLayer>
            <Skeleton
              variant="text"
              width={180}
              height={34}
              style={{ borderRadius: "8px" }}
            />
            <Skeleton
              variant="text"
              width={260}
              height={18}
              style={{ borderRadius: "6px", marginTop: "2px" }}
            />
          </SkeletonLayer>
        ) : (
          <GreetingLayer $shouldAnimate={shouldAnimate}>
            <MainGreeting>{title}</MainGreeting>
            <SubGreeting>{subtitle}</SubGreeting>
          </GreetingLayer>
        )}
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

const MascotRow = styled.div`
  display: flex;
  align-items: center;
  height: 38px;
  margin-bottom: 8px;
`;

const MascotLayer = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
`;

const MascotGif = styled.img<{ $visible: boolean; $shouldAnimate: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 38px;
  height: 38px;
  object-fit: contain;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? "scale(1)" : "scale(0.92)")};
  transition: ${({ $shouldAnimate }) =>
    $shouldAnimate
      ? "opacity 0.4s ease-in-out, transform 0.4s ease-in-out"
      : "none"};
  pointer-events: none;
`;

const MascotStaticLogo = styled.img<{
  $visible: boolean;
  $shouldAnimate: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 38px;
  height: 38px;
  object-fit: contain;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? "scale(1)" : "scale(0.92)")};
  transition: ${({ $shouldAnimate }) =>
    $shouldAnimate
      ? "opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
      : "none"};
  pointer-events: none;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 64px;
  justify-content: center;
`;

const SkeletonLayer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const greetingFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const GreetingLayer = styled.div<{ $shouldAnimate?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${({ $shouldAnimate = true }) =>
    $shouldAnimate
      ? css`
          animation: ${greetingFadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        `
      : css`
          opacity: 1;
          transform: translateY(0);
        `}
`;

const MainGreeting = styled.h1`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.8px;
  color: #111827;
  margin: 0;
  line-height: 1.2;
  word-break: keep-all;
  overflow-wrap: break-word;
`;

const SubGreeting = styled.p`
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: #374151;
  margin: 0;
  line-height: 1.4;
`;
