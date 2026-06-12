import { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import {
  MOBILE_PAGE_GUTTER,
  DESKTOP_MEDIA,
  DESKTOP_CONTENT_MAX_WIDTH,
} from "@/styles/responsive";

import NoticeTabWidget from "@/containers/mobile/home/NoticeTabWidget";
import TipsWidget from "@/components/mobile/tips/TipsWidget";
import SwipeMenuWidget from "@/containers/mobile/home/SwipeMenuWidget";
import SwipeBusWidget from "@/containers/mobile/home/SwipeBusWidget";
import HomeChipGroup from "@/components/mobile/home/HomeChipGroup";
import Calendar from "@/components/mobile/calendar/Calendar";
import YoutubeWidget from "@/components/mobile/home/YoutubeWidget";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import AppcenterLogo from "@/resources/assets/앱센터로고_new.svg";
import Banner from "@/containers/mobile/home/Banner";

const CHANNEL_ID = "UCqOO8FqoVW6Y87jLnqhdflA";

export default function MobileHomePageV2() {
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [activeNoticeTab, setActiveNoticeTab] = useState<"school" | "dept">("school");

  useHeader({
    showAlarm: true,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopLayout(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nickname = userInfo?.nickname || "유니";

  return (
    <V2Wrapper>

      <UpperSection>
        <SectionInner>
          <WelcomeMessage>
            <HighlightName>{nickname}님,</HighlightName>
            <GreetingText>좋은 아침이에요!</GreetingText>
          </WelcomeMessage>

          <TodayTimetableCard onClick={() => navigate(ROUTES.TIMETABLE.ROOT)}>
            <WidgetHeader>
              <WidgetTitle>오늘의 시간표</WidgetTitle>
              <WidgetSubTitle>15분 후 시작</WidgetSubTitle>
            </WidgetHeader>

            <ClassList>
              <ClassItem $current={true}>
                <ClassName>자료구조</ClassName>

                <ClassInfo>
                  <ClassDetail>09:00~10:15</ClassDetail>
                  <ClassRoom>07-504</ClassRoom>
                </ClassInfo>
              </ClassItem>

              <ClassItem $current={false}>
                <ClassName>디지털공학</ClassName>

                <ClassInfo>
                  <ClassDetail>16:30~17:45</ClassDetail>
                  <ClassRoom>07-504</ClassRoom>
                </ClassInfo>
              </ClassItem>
            </ClassList>
          </TodayTimetableCard>

          <GridWidgets>
            <SwipeBusWidget />


            <SwipeMenuWidget />
          </GridWidgets>
        </SectionInner>
      </UpperSection>

      <LowerSheetSection>
        <SectionInner>
          <ContentContainer>
            <HomeChipGroup />
          </ContentContainer>

          <FeedLayout>
            {isDesktopLayout ? (
              <DesktopWidgetColumns>
                <DesktopWidgetColumn>
                  <TitleContentArea
                    title="TIPS 알아보기"
                    children={<TipsWidget />}
                    link={ROUTES.BOARD.TIPS}
                  />
                  <Banner />
                  <TitleContentArea
                    title="공지사항"
                    children={
                      <NoticeTabWidget
                        activeTab={activeNoticeTab}
                        setActiveTab={setActiveNoticeTab}
                      />
                    }
                    link={
                      activeNoticeTab === "school"
                        ? ROUTES.BOARD.NOTICE
                        : userInfo?.department
                        ? ROUTES.BOARD.DEPT_NOTICE_DETAIL(userInfo.department)
                        : ROUTES.BOARD.DEPT_NOTICE
                    }
                  />
                </DesktopWidgetColumn>
                <DesktopWidgetColumn>
                  <TitleContentArea
                    title="학사일정"
                    children={<Calendar mode="weekly" />}
                    link={ROUTES.BOARD.CALENDAR}
                  />
                  <TitleContentArea
                    title="인천대학교 YouTube"
                    externalLink={`https://www.youtube.com/channel/${CHANNEL_ID}`}
                  >
                    <YoutubeWidget />
                  </TitleContentArea>
                </DesktopWidgetColumn>
              </DesktopWidgetColumns>
            ) : (
              <>
                <TitleContentArea
                  title="TIPS 알아보기"
                  children={<TipsWidget />}
                  link={ROUTES.BOARD.TIPS}
                />
                <Banner />
                <TitleContentArea
                  title="공지사항"
                  children={
                    <NoticeTabWidget
                      activeTab={activeNoticeTab}
                      setActiveTab={setActiveNoticeTab}
                    />
                  }
                  link={
                    activeNoticeTab === "school"
                      ? ROUTES.BOARD.NOTICE
                      : userInfo?.department
                      ? ROUTES.BOARD.DEPT_NOTICE_DETAIL(userInfo.department)
                      : ROUTES.BOARD.DEPT_NOTICE
                  }
                />
                <TitleContentArea
                  title="학사일정"
                  children={<Calendar mode="weekly" />}
                  link={ROUTES.BOARD.CALENDAR}
                />
                <TitleContentArea
                  title="인천대학교 YouTube"
                  externalLink={`https://www.youtube.com/channel/${CHANNEL_ID}`}
                >
                  <YoutubeWidget />
                </TitleContentArea>
              </>
            )}
          </FeedLayout>
        </SectionInner>
      </LowerSheetSection>

      <AppcenterLogoWrapper>
        <LogoInner>
          <img
            src={AppcenterLogo}
            alt="appcenterLogo"
            onClick={() => window.open("https://home.inuappcenter.kr")}
          />
        </LogoInner>
      </AppcenterLogoWrapper>
    </V2Wrapper>
  );
}

const V2Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  background-color: #eff5fc;
  min-height: 100vh;
`;

const UpperSection = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: calc(var(--header-height, 56px) + 24px);
  padding-bottom: 24px;
  background: #eff5fc;
`;

const WelcomeMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
  text-align: left;
  padding-left: 8px;

  color: var(--text-secondary, #333d4b);
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: -0.2px;
`;

const HighlightName = styled.span``;

const GreetingText = styled.span``;

const TodayTimetableCard = styled.div`
  background-color: #ffffff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 20px 0 rgba(0, 97, 255, 0.06);
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WidgetTitle = styled.span`
  color: var(--text-secondary, #333d4b);

  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
`;

const WidgetSubTitle = styled.span`
  color: var(--text-brand, #0061ff);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`;

const ClassList = styled.div`
  display: flex;
  flex-direction: column;
  //gap: 12px;
`;

const ClassItem = styled.div<{ $current: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 16px;

  ${({ $current }) =>
    $current &&
    css`
      background-color: var(--bg-brand);
      border-left: 4px solid var(--interactive-primary, #3b82f6);
      padding-left: 12px;
    `}
`;

const ClassName = styled.span`
  color: var(--text-secondary, #333d4b);

  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
`;

const ClassInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const ClassDetail = styled.span`
  color: var(--text-secondary, #333d4b);
  opacity: 0.5;
`;

const ClassRoom = styled.span`
  color: var(--text-secondary, #333d4b);
`;

const GridWidgets = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
`;





const LowerSheetSection = styled.div`
  background-color: #ffffff;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  //margin-top: -24px;
  position: relative;
  z-index: 5;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.02);
  padding-top: 28px;
  padding-bottom: 40px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
`;

const FeedLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
`;

const DesktopWidgetColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 24px;
  align-items: start;
  width: 100%;
`;

const DesktopWidgetColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

const AppcenterLogoWrapper = styled.div`
  background: var(--gray-1000, #000);
  padding: 48px 0 148px;
  width: 100%;
  box-sizing: border-box;

  img {
    width: 136px;
    height: 52px;
    aspect-ratio: 34/13;
    cursor: pointer;
  }
`;

const SectionInner = styled.div`
  width: 100%;
  max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
  margin: 0 auto;
  box-sizing: border-box;
  padding-left: ${MOBILE_PAGE_GUTTER};
  padding-right: ${MOBILE_PAGE_GUTTER};

  @media ${DESKTOP_MEDIA} {
    padding-left: clamp(24px, 4vw, 48px);
    padding-right: clamp(24px, 4vw, 48px);
  }
`;

const LogoInner = styled(SectionInner)`
  padding-left: 32px;
  padding-right: 32px;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  @media ${DESKTOP_MEDIA} {
    padding-left: clamp(24px, 4vw, 48px);
    padding-right: clamp(24px, 4vw, 48px);
  }
`;
