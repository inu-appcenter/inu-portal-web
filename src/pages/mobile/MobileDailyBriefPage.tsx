import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { trackPageView } from "@/utils/mixpanel";
import DailyBriefHeader from "@/components/mobile/dailyBrief/view/DailyBriefHeader";
import DailyBriefTimetableCard from "@/components/mobile/dailyBrief/view/DailyBriefTimetableCard";
import DailyBriefWeatherCard from "@/components/mobile/dailyBrief/view/DailyBriefWeatherCard";
import DailyBriefNoticeCard from "@/components/mobile/dailyBrief/view/DailyBriefNoticeCard";
import DailyBriefCafeteriaCard from "@/components/mobile/dailyBrief/view/DailyBriefCafeteriaCard";
import DailyBriefBusCard from "@/components/mobile/dailyBrief/view/DailyBriefBusCard";
import DailyBriefFortuneCard from "@/components/mobile/dailyBrief/view/DailyBriefFortuneCard";
import DailyBriefInfoModal from "@/components/mobile/dailyBrief/view/DailyBriefInfoModal";
import Icon from "@/components/common/Icon";

export default function MobileDailyBriefPage() {
  const navigate = useNavigate();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  useHeader({
    visible: false,
    immersive: true,
  });

  useEffect(() => {
    trackPageView("Daily Brief 메인");
  }, []);

  return (
    <PageBackground>
      <ContentContainer>
        <DailyBriefHeader onBack={() => navigate(-1)} />

        <CardsStack>
          <DailyBriefTimetableCard />
          <DailyBriefWeatherCard />
          <DailyBriefNoticeCard />
          <DailyBriefCafeteriaCard />
          <DailyBriefBusCard />
          <DailyBriefFortuneCard />
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

const PageBackground = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    #bce3fb 0%,
    #d8ebf9 18%,
    #f2f1e6 48%,
    #faede3 80%,
    #fde6d8 100%
  );
  background-attachment: fixed;
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
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.08);
    background: #ffffff;
  }

  &:active {
    transform: scale(0.92);
  }
`;
