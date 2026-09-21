import { useState, useEffect, useMemo, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate, useNavigationType } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { trackPageView } from "@/utils/mixpanel";
import {
  useDailyBriefPresentation,
  DailyBriefCardType,
} from "@/hooks/useDailyBriefRanking";
import { getLocalDailyBriefCardSettings } from "@/apis/dailyBrief";
import type { DailyBriefCardSettings } from "@/types/dailyBrief";
import DailyBriefHeader from "@/components/mobile/dailyBrief/view/DailyBriefHeader";
import DailyBriefWeatherCard from "@/components/mobile/dailyBrief/view/DailyBriefWeatherCard";
import DailyBriefNoticeCard from "@/components/mobile/dailyBrief/view/DailyBriefNoticeCard";
import DailyBriefFortuneCard from "@/components/mobile/dailyBrief/view/DailyBriefFortuneCard";
import DailyBriefLibraryCard from "@/components/mobile/dailyBrief/view/DailyBriefLibraryCard";
import DailyBriefLmsCard from "@/components/mobile/dailyBrief/view/DailyBriefLmsCard";
import DailyBriefInfoModal from "@/components/mobile/dailyBrief/view/DailyBriefInfoModal";
import TodayTimetableWidget from "@/components/mobile/home/TodayTimetableWidget";
import SwipeBusWidget from "@/containers/mobile/home/SwipeBusWidget";
import SwipeMenuWidget from "@/containers/mobile/home/SwipeMenuWidget";
import Icon from "@/components/common/Icon";

export type DailyBriefTimeTheme = "morning" | "afternoon" | "sunset" | "night";

export function getDailyBriefTimeTheme(
  hour: number = new Date().getHours(),
): DailyBriefTimeTheme {
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

const DAILY_BRIEF_INTRO_SHOWN_KEY = "daily_brief_intro_shown";
const DAILY_BRIEF_CARD_RETURN_KEY = "daily_brief_card_return";
const CARD_NAVIGATION_WINDOW_MS = 1500;

export default function MobileDailyBriefPage() {
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  // 최초 방문 여부 (온보딩 모달 미확인 시)
  const isFirstEverVisit = useMemo(() => {
    try {
      return !localStorage.getItem(DAILY_BRIEF_INTRO_SHOWN_KEY);
    } catch {
      return false;
    }
  }, []);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(isFirstEverVisit);

  // 카드 클릭으로 다른 페이지에 갔다가 POP으로 돌아온 경우만 화면을 그대로 복원한다.
  // 홈 등 외부 진입점에서 들어올 때는 캐시 여부와 무관하게 항상 애니메이션을 보여준다.
  const isReturningFromCard = useMemo(() => {
    try {
      return sessionStorage.getItem(DAILY_BRIEF_CARD_RETURN_KEY) === "true";
    } catch {
      return false;
    }
  }, []);
  const isRestored =
    navigationType === "POP" && isReturningFromCard && !isFirstEverVisit;
  const [isLoading, setIsLoading] = useState(!isRestored);
  const shouldAnimate = !isRestored;
  const pendingCardNavigationRef = useRef(false);
  const cardNavigationTimerRef = useRef<number | null>(null);

  const brief = useDailyBriefPresentation();
  const timeTheme = useMemo(() => getDailyBriefTimeTheme(), []);

  const [cardSettings, setCardSettings] = useState<DailyBriefCardSettings>(() =>
    getLocalDailyBriefCardSettings(),
  );

  useEffect(() => {
    const handleSettingsChanged = () => {
      setCardSettings(getLocalDailyBriefCardSettings());
    };
    window.addEventListener(
      "daily_brief_settings_changed",
      handleSettingsChanged,
    );
    return () => {
      window.removeEventListener(
        "daily_brief_settings_changed",
        handleSettingsChanged,
      );
    };
  }, []);

  const busInitialType = useMemo(() => {
    const configured = cardSettings.details?.bus?.defaultType;
    if (configured && configured !== "auto") {
      return configured;
    }
    return brief.timetableState?.recommendedBusType || "go-school";
  }, [
    cardSettings.details?.bus?.defaultType,
    brief.timetableState?.recommendedBusType,
  ]);

  const preferredCafeteria = cardSettings.details?.cafeteria?.preferredCafeteria;

  const timetableIntro = useMemo(() => {
    if (brief.timetableState?.beforeFirstClass) {
      return "오늘 첫 수업 전, 강의실과 일정을 미리 확인해 볼까요?";
    }
    if (brief.timetableState?.inClass) {
      return "지금 진행 중인 수업 정보를 확인해 보세요.";
    }
    if (brief.timetableState?.isLongBreak) {
      return "수업 사이 쉬는 시간이에요. 다음 강의실을 확인해 보세요.";
    }
    if (brief.timetableState?.recentlyFinished) {
      return "오늘 강의를 모두 마쳤어요! 수고하셨습니다.";
    }
    if (brief.timetableState?.noClassDay) {
      return "오늘은 예정된 수업이 없는 날이에요.";
    }
    return "오늘 하루 강의 일정을 확인해 보세요.";
  }, [brief.timetableState]);

  const busIntro = useMemo(() => {
    if (busInitialType === "go-home") {
      return "수업 후 안전한 귀가 버스를 확인해 보세요.";
    }
    if (busInitialType === "go-school") {
      return "등교 버스 실시간 도착 정보를 확인해 보세요.";
    }
    return "실시간 버스 도착 정보를 확인해 보세요.";
  }, [busInitialType]);

  const cafeteriaIntro = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 10) return "오늘 아침/점심 학식 메뉴를 확인해 보세요.";
    if (currentHour < 14) return "오늘 점심 학식 메뉴를 확인해 보세요.";
    return "오늘 저녁 학식 메뉴를 확인해 보세요.";
  }, []);

  useHeader({
    visible: false,
    immersive: true,
    pageBgColor: THEME_GRADIENTS[timeTheme],
  });

  const startBriefLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 850);
  };

  useEffect(() => {
    try {
      sessionStorage.removeItem(DAILY_BRIEF_CARD_RETURN_KEY);
    } catch {
      // 세션 저장소를 사용할 수 없어도 진입 애니메이션은 정상 동작한다.
    }
  }, []);

  useEffect(() => {
    return () => {
      if (cardNavigationTimerRef.current !== null) {
        window.clearTimeout(cardNavigationTimerRef.current);
      }
      if (!pendingCardNavigationRef.current) return;
      try {
        sessionStorage.setItem(DAILY_BRIEF_CARD_RETURN_KEY, "true");
      } catch {
        // 세션 저장소를 사용할 수 없으면 일반 진입처럼 애니메이션을 보여준다.
      }
    };
  }, []);

  useEffect(() => {
    trackPageView("Daily Brief 메인");

    // 최초 진입 시 모달이 띄워지는 경우 확인 버튼을 누를 때 로딩 시작
    if (isFirstEverVisit) {
      return;
    }

    // 뒤로가기로 복귀한 경우 즉시 로딩 해제 (깜빡임 방지)
    if (isRestored) {
      return;
    }

    // 외부에서 새로 진입한 경우: 850ms 로딩 애니메이션 실행 후 fade-in
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);

    return () => clearTimeout(timer);
  }, [isFirstEverVisit, isRestored]);

  const handleCloseInfoModal = () => {
    try {
      localStorage.setItem(DAILY_BRIEF_INTRO_SHOWN_KEY, "true");
    } catch {
      // 저장소를 사용할 수 없어도 현재 세션의 모달은 닫는다.
    }
    setIsInfoModalOpen(false);

    // 최초 모달 확인 시점에 브리핑 로딩 시작 -> 완료 시 순차 fade-in
    startBriefLoading();
  };

  const handleCardInteraction = () => {
    pendingCardNavigationRef.current = true;
    if (cardNavigationTimerRef.current !== null) {
      window.clearTimeout(cardNavigationTimerRef.current);
    }
    // 카드 내부 조작만 하고 이동하지 않은 경우에는 복귀 표식을 남기지 않는다.
    cardNavigationTimerRef.current = window.setTimeout(() => {
      pendingCardNavigationRef.current = false;
      cardNavigationTimerRef.current = null;
    }, CARD_NAVIGATION_WINDOW_MS);
  };

  const renderCard = (cardType: DailyBriefCardType, index: number) => {
    let cardComponent: React.ReactNode = null;
    switch (cardType) {
      case "timetable":
        cardComponent = (
          <TimetableSectionWrapper>
            <ContextIntro>{timetableIntro}</ContextIntro>
            <TodayTimetableWidget />
          </TimetableSectionWrapper>
        );
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
        cardComponent = (
          <BriefWidgetSectionWrapper>
            <ContextIntro>{cafeteriaIntro}</ContextIntro>
            <SwipeMenuWidget initialCafeteria={preferredCafeteria} />
          </BriefWidgetSectionWrapper>
        );
        break;
      case "bus":
        cardComponent = (
          <BriefWidgetSectionWrapper>
            <ContextIntro>{busIntro}</ContextIntro>
            <SwipeBusWidget initialType={busInitialType} />
          </BriefWidgetSectionWrapper>
        );
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
        $shouldAnimate={shouldAnimate}
      >
        {cardComponent}
      </AnimatedCardItem>
    );
  };

  return (
    <PageBackground>
      <ContentContainer>
        <DailyBriefHeader
          isLoading={isLoading}
          shouldAnimate={shouldAnimate}
          onBack={() => navigate(-1)}
          title={brief.title}
          subtitle={brief.subtitle}
        />

        <CardsStack onClickCapture={handleCardInteraction}>
          {brief.cards.map((card, idx) => renderCard(card, idx))}
        </CardsStack>

        <FloatingBottomActions>
          <CircleActionButton
            onClick={() => setIsInfoModalOpen(true)}
            aria-label="Daily Brief에 대해 알아보세요"
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
        onClose={handleCloseInfoModal}
      />
    </PageBackground>
  );
}

const PageBackground = styled.div`
  width: 100%;
  min-height: 100vh;
  background: transparent;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
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
  $shouldAnimate: boolean;
}>`
  width: 100%;

  ${({ $shouldAnimate, $loaded, $index }) => {
    if (!$shouldAnimate) {
      return css`
        opacity: 1;
        transform: translateY(0);
      `;
    }

    if (!$loaded) {
      return css`
        opacity: 0;
        transform: translateY(18px);
      `;
    }

    return css`
      opacity: 0;
      transform: translateY(18px);
      animation: ${cardFadeInUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      animation-delay: ${$index * 0.08}s;
    `;
  }}
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

const BriefWidgetSectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const TimetableSectionWrapper = styled(BriefWidgetSectionWrapper)`
  & > div {
    margin-bottom: 0;
  }
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
  line-height: 1.35;
`;

