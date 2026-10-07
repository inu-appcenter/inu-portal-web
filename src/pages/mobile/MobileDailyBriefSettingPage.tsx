import styled from "styled-components";
import { useEffect } from "react";
import { useHeader } from "@/context/HeaderContext";
import {
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
  DESKTOP_READING_WIDTH,
} from "@/styles/responsive";
import { trackPageView } from "@/utils/mixpanel";
import MobileDailyBriefCardOrderSetting from "@/components/mobile/dailyBrief/MobileDailyBriefCardOrderSetting";

export default function MobileDailyBriefSettingPage() {
  useHeader({
    title: "Daily Brief 설정",
    hasback: true,
    rightArea: null,
  });

  useEffect(() => {
    trackPageView("Daily Brief 설정");
  }, []);

  return (
    <PageWrapper>
      <ContentContainer>
        <MobileDailyBriefCardOrderSetting />
      </ContentContainer>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 16px ${MOBILE_PAGE_GUTTER} 60px;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_READING_WIDTH});
    margin: 0 auto;
  }
`;
