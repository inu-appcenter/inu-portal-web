import { useState, useEffect, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { trackPageView } from "@/utils/mixpanel";
import {
  useDailyBriefRanking,
  DailyBriefCardType,
} from "@/hooks/useDailyBriefRanking";
import DailyBriefHeader from "@/components/mobile/dailyBrief/view/DailyBriefHeader";
import DailyBriefTimetableCard from "@/components/mobile/dailyBrief/view/DailyBriefTimetableCard";
import DailyBriefWeatherCard from "@/components/mobile/dailyBrief/view/DailyBriefWeatherCard";
import DailyBriefNoticeCard from "@/components/mobile/dailyBrief/view/DailyBriefNoticeCard";
import DailyBriefCafeteriaCard from "@/components/mobile/dailyBrief/view/DailyBriefCafeteriaCard";
import DailyBriefBusCard from "@/components/mobile/dailyBrief/view/DailyBriefBusCard";
import DailyBriefFortuneCard from "@/components/mobile/dailyBrief/view/DailyBriefFortuneCard";
import DailyBriefLibraryCard from "@/components/mobile/dailyBrief/view/DailyBriefLibraryCard";
import DailyBriefLmsCard from "@/components/mobile/dailyBrief/view/DailyBriefLmsCard";
import DailyBriefInfoModal from "@/components/mobile/dailyBrief/view/DailyBriefInfoModal";
import Icon from "@/components/common/Icon";

export type DailyBriefTimeTheme = "morning" | "afternoon" | "sunset" | "night";

export function getDailyBriefTimeTheme(hour: number = new Date().getHours()): DailyBriefTimeTheme {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "sunset";
  return "night";
}

const THEME_GRADIENTS: Record<DailyBriefTimeTheme, string> = {
  // 🌅 아침 (05:00 ~ 11:59): 상쾌한 하늘빛과 따스한 살구 크림 톤
  morning:
    "linear-gradient(180deg, #BCE3FB 0%, #D8EBF9 18%, #F2F1E6 48%, #FAEDE3 80%, #FDE6D8 100%)",
  // ☀️ 오후 (12:00 ~ 17:59): 맑고 청명한 푸른 하늘빛과 은은한 화이트/민트 톤
  afternoon:
    "linear-gradient(180deg, #BAE6FD 0%, #D7EFFE 20%, #F0FDF4 50%, #FEFCE8 80%, #FEF3C7 100%)",
  // 🌇 저녁 (18:00 ~ 21:59): 몽환적이고 따스한 코랄 핑크와 노을빛 라벤더 톤
  sunset:
    "linear-gradient(180deg, #FBCFE8 0%, #FED7AA 22%, #FDE68A 50%, #EDE9FE 78%, #FCE7F3 100%)",
  // 🌙 밤 (22:00 ~ 04:59): 차분하고 고요한 미드나잇 트와일라잇 인디고/라벤더 톤
  night:
    "linear-gradient(180deg, #C7D2FE 0%, #DDD6FE 20%, #E2E8F0 52%, #EDE9FE 80%, #E0E7FF 100%)",
};

// 세션/앱 라이프사이클 동안 초기 로딩을 1회만 수행하고, 카드 이동 후 뒤로가기 복귀 시 즉시 유지
let hasCompletedInitialBriefLoad = false;

export default function MobileDailyBriefPage() {
  const navigate = useNavigate();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const isFirstLoad = !hasCompletedInitialBriefLoad;
  const [isLoading, setIsLoading] = useState(!hasCompletedInitialBriefLoad);
  const rankedCards = useDailyBriefRanking();

  const timeTheme = useMemo(() => getDailyBriefTimeTheme(), []);

  useHeader({
    visible: false,
    immersive: true,
  });

  useEffect(() => {
    trackPageView("Daily Brief 메인");

    if (!hasCompletedInitialBriefLoad) {
      // 첫 진입 시에만 자연스러운 AI 브리핑 준비 및 로딩 애니메이션 시간 (약 850ms)
      const timer = setTimeout(() => {
        setIsLoading(false);
        hasCompletedInitialBriefLoad = true;
      }, 850);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, []);

  const renderCard = (cardType: DailyBriefCardType, index: number) => {
    let cardComponent: React.ReactNode = null;
    switch (cardType) {
      case "timetable":
        cardComponent = <DailyBriefTimetableCard />;
        break;
      case "library":
        cardComponent = <DailyBriefLibraryCard />;
        break;
      case "weather":
        cardComponent = <DailyBriefWeatherCard />;
        break;
      case "notice":
        cardComponent = <DailyBriefNoticeCard />;
        break;
      case "cafeteria":
        cardComponent = <DailyBriefCafeteriaCard />;
        break;
      case "bus":
        cardComponent = <DailyBriefBusCard />;
        break;
      case "lms":
        cardComponent = <DailyBriefLmsCard />;
        break;
      case "fortune":
        cardComponent = <DailyBriefFortuneCard />;
        break;
      default:
        return null;
    }

    return (
      <AnimatedCardItem
        key={cardType}
        $index={index}
        $loaded={!isLoading}
        $isFirstLoad={isFirstLoad}
      >
        {cardComponent}
      </AnimatedCardItem>
    );
  };

  return (
    <PageBackground $theme={timeTheme}>
      <ContentContainer>
        <DailyBriefHeader
          isLoading={isLoading}
          isFirstLoad={isFirstLoad}
          onBack={() => navigate(-1)}
        />

        <CardsStack>
          {rankedCards.map((card, idx) => renderCard(card, idx))}
        </CardsStack>

        <FloatingBottomActions>
          <CircleActionButton
            onClick={() => setIsInfoModalOpen(true)}
            aria-label="Daily Brief 안내"
          >
            <Icon name="info" size={20} color="#374151" />
          </CircleActionButton>
          <CircleActionButton
            onClick={() => navigate(ROUTES.DAILY_BRIEF.SETTING)}
            aria-label="Daily Brief 설정"
          >
            <Icon name="settings" size={20} color="#374151" />
          </CircleActionButton>
        </FloatingBottomActions>
      </ContentContainer>

      <DailyBriefInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </PageBackground>
  );
}

const PageBackground = styled.div<{ $theme: DailyBriefTimeTheme }>`
  width: 100%;
  min-height: 100vh;
  background: ${({ $theme }) => THEME_GRADIENTS[$theme]};
  background-attachment: fixed;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  transition: background 0.5s ease;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 16px 20px 90px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CardsStack = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const cardFadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(18px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AnimatedCardItem = styled.div<{
  $index: number;
  $loaded: boolean;
  $isFirstLoad?: boolean;
}>`
  width: 100%;

  ${({ $isFirstLoad = true, $loaded, $index }) =>
    $isFirstLoad
      ? css`
          opacity: 0;
          transform: translateY(18px);

          ${$loaded &&
          css`
            animation: ${cardFadeInUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            animation-delay: ${$index * 0.08}s;
          `}
        `
      : css`
          opacity: 1;
          transform: translateY(0);
        `}
`;

const FloatingBottomActions = styled.div`
  position: fixed;
  bottom: 24px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 50;

  @media (min-width: 520px) {
    right: calc(50% - 240px + 20px);
  }
`;

const CircleActionButton = styled.button`
  width: 46px;
  height: 46px;
  border-radius: 23px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.08);
    background: rgba(255, 255, 255, 0.85);
  }

  &:active {
    transform: scale(0.92);
  }
`;
