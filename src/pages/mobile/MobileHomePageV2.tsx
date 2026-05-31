import { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA, DESKTOP_CONTENT_MAX_WIDTH } from "@/styles/responsive";

import MobileHeader from "@/containers/mobile/common/MobileHeader";
import CategoryForm from "@/containers/mobile/home/Category";
import NoticeForm from "@/containers/mobile/home/Notice";
import TipsWidget from "@/components/mobile/tips/TipsWidget";
import HomeChipGroup from "@/components/mobile/home/HomeChipGroup";
import Calendar from "@/components/mobile/calendar/Calendar";
import YoutubeWidget from "@/components/mobile/home/YoutubeWidget";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import AppcenterLogo from "@/resources/assets/appcenter-logo.webp";
import Banner from "@/containers/mobile/home/Banner";

const CHANNEL_ID = "UCqOO8FqoVW6Y87jLnqhdflA";

export default function MobileHomePageV2() {
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);

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
      <MobileHeader />

      <UpperSection>
        <WelcomeMessage>
          <HighlightName>{nickname}님,</HighlightName>
          <GreetingText>좋은 아침이에요!</GreetingText>
        </WelcomeMessage>

        <TodayTimetableCard>
          <WidgetHeader>
            <WidgetTitle>오늘의 시간표</WidgetTitle>
            <TimerText>15분 후 시작</TimerText>
          </WidgetHeader>

          <ClassList>
            <ClassItem $current={true}>
              <ClassInfo>
                <ClassName>자료구조</ClassName>
                <ClassDetail>09:00~10:15</ClassDetail>
              </ClassInfo>
              <ClassRoom>07-504</ClassRoom>
            </ClassItem>

            <ClassItem $current={false}>
              <ClassInfo>
                <ClassName>디지털공학</ClassName>
                <ClassDetail>16:30~17:45</ClassDetail>
              </ClassInfo>
              <ClassRoom>07-504</ClassRoom>
            </ClassItem>
          </ClassList>
        </TodayTimetableCard>

        <GridWidgets>
          <MiniWidgetCard onClick={() => navigate(ROUTES.BUS.ROOT)}>
            <WidgetHeader>
              <WidgetTitle>인입런</WidgetTitle>
              <LinkText>2번 출구</LinkText>
            </WidgetHeader>

            <BusInfoList>
              <BusInfoRow>
                <BusBadge $color="#3B82F6">8</BusBadge>
                <BusTime>1분 31초</BusTime>
              </BusInfoRow>
              <BusInfoRow>
                <BusBadge $color="#10B981">41</BusBadge>
                <BusTime>4분 19초</BusTime>
              </BusInfoRow>
            </BusInfoList>
          </MiniWidgetCard>

          <MiniWidgetCard onClick={() => navigate(ROUTES.BOARD.UTIL)}>
            <WidgetHeader>
              <WidgetTitle>식당 메뉴</WidgetTitle>
              <LinkText>학생식당</LinkText>
            </WidgetHeader>

            <MenuInfo>
              <MenuCorner>1코너 (백반)</MenuCorner>
              <MenuName>참치김치찌개</MenuName>
            </MenuInfo>
          </MiniWidgetCard>
        </GridWidgets>
      </UpperSection>

      <LowerSheetSection>
        <ContentContainer>
          <HomeChipGroup />
          <CategoryFormSection>
            <CategoryForm />
          </CategoryFormSection>
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
                  title="학교 공지사항"
                  children={<NoticeForm />}
                  link={ROUTES.BOARD.NOTICE}
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
                title="학교 공지사항"
                children={<NoticeForm />}
                link={ROUTES.BOARD.NOTICE}
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

        <AppcenterLogoWrapper>
          <img
            src={AppcenterLogo}
            alt="appcenterLogo"
            onClick={() => window.open("https://home.inuappcenter.kr")}
          />
        </AppcenterLogoWrapper>
      </LowerSheetSection>
    </V2Wrapper>
  );
}

const V2Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  background-color: #f0f4fc;
  min-height: 100vh;

  @media ${DESKTOP_MEDIA} {
    max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
    margin: 0 auto;
  }
`;

const UpperSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 56px ${MOBILE_PAGE_GUTTER} 36px;
  background: linear-gradient(180deg, #f0f6ff 0%, #e2eeff 100%);
`;

const WelcomeMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
  text-align: left;
`;

const HighlightName = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary, #1c1c1e);
`;

const GreetingText = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #1c1c1e);
`;

const TodayTimetableCard = styled.div`
  background-color: #ffffff;
  border-radius: 20px;
  padding: 16px 20px;
  box-shadow: 0 4px 20px 0 rgba(0, 97, 255, 0.06);
  margin-bottom: 12px;
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
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary, #1c1c1e);
`;

const TimerText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-brand, #0061ff);
`;

const ClassList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ClassItem = styled.div<{ $current: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  background-color: var(--bg-muted, #f8f9fa);

  ${({ $current }) =>
    $current &&
    css`
      background-color: var(--bg-brand-subtle, #eff6ff);
      border-left: 4px solid var(--interactive-primary, #3b82f6);
    `}
`;

const ClassInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ClassName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #1c1c1e);
`;

const ClassDetail = styled.span`
  font-size: 13px;
  color: var(--text-tertiary, #8e8e93);
`;

const ClassRoom = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #48484a);
`;

const GridWidgets = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const MiniWidgetCard = styled.div`
  background-color: #ffffff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 20px 0 rgba(0, 97, 255, 0.06);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease-in-out;

  &:active {
    transform: scale(0.98);
  }
`;

const LinkText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-brand, #0061ff);
`;

const BusInfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BusInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BusBadge = styled.div<{ $color: string }>`
  background-color: ${({ $color }) => $color};
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BusTime = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #3a3a3c);
`;

const MenuInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const MenuCorner = styled.span`
  font-size: 12px;
  color: var(--text-tertiary, #8e8e93);
`;

const MenuName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #1c1c1e);
`;

const LowerSheetSection = styled.div`
  background-color: #ffffff;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  margin-top: -24px;
  position: relative;
  z-index: 5;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.02);
  padding: 28px ${MOBILE_PAGE_GUTTER} 40px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
`;

const CategoryFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeedLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 20px;

  img {
    width: 50%;
    height: auto;
    max-width: 200px;
    min-width: 150px;
    cursor: pointer;
  }

  @media ${DESKTOP_MEDIA} {
    img {
      width: 220px;
      max-width: 220px;
    }
  }
`;
