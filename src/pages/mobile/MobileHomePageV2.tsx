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

import MobileHeader from "@/containers/mobile/common/MobileHeader";
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
          <MiniWidgetCard onClick={() => navigate(ROUTES.BUS.ROOT)}>
            <WidgetHeader>
              <WidgetTitle>인입런</WidgetTitle>
              <WidgetSubTitle>2번 출구</WidgetSubTitle>
            </WidgetHeader>

            <BusInfoList>
              <BusInfoRow>
                <BusLeftSection>
                  <BusIcon color="#0e4d9d" />
                  <BusNumber>8번</BusNumber>
                </BusLeftSection>
                <BusTime>1분 31초</BusTime>
              </BusInfoRow>
              <BusInfoRow>
                <BusLeftSection>
                  <BusIcon color="#00a82f" />
                  <BusNumber>41번</BusNumber>
                </BusLeftSection>
                <BusTime>4분 19초</BusTime>
              </BusInfoRow>
            </BusInfoList>
          </MiniWidgetCard>

          <MiniWidgetCard onClick={() => navigate(ROUTES.BOARD.MENU)}>
            <WidgetHeader>
              <WidgetTitle>식당 메뉴</WidgetTitle>
              <WidgetSubTitle>학생식당</WidgetSubTitle>
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
  background-color: #eff5fc;
  min-height: 100vh;

  @media ${DESKTOP_MEDIA} {
    max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
    margin: 0 auto;
  }
`;

const UpperSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: calc(var(--header-height, 56px) + 24px) ${MOBILE_PAGE_GUTTER} 24px;
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

const BusInfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BusInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const BusLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BusIcon = ({ color }: { color: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M20.64 12.627H6.88V6.88744H20.64M18.92 19.5145C18.4638 19.5145 18.0263 19.3331 17.7038 19.0102C17.3812 18.6873 17.2 18.2493 17.2 17.7926C17.2 17.336 17.3812 16.898 17.7038 16.5751C18.0263 16.2522 18.4638 16.0708 18.92 16.0708C19.3762 16.0708 19.8137 16.2522 20.1362 16.5751C20.4588 16.898 20.64 17.336 20.64 17.7926C20.64 18.2493 20.4588 18.6873 20.1362 19.0102C19.8137 19.3331 19.3762 19.5145 18.92 19.5145ZM8.6 19.5145C8.14383 19.5145 7.70634 19.3331 7.38378 19.0102C7.06122 18.6873 6.88 18.2493 6.88 17.7926C6.88 17.336 7.06122 16.898 7.38378 16.5751C7.70634 16.2522 8.14383 16.0708 8.6 16.0708C9.05618 16.0708 9.49366 16.2522 9.81623 16.5751C10.1388 16.898 10.32 17.336 10.32 17.7926C10.32 18.2493 10.1388 18.6873 9.81623 19.0102C9.49366 19.3331 9.05618 19.5145 8.6 19.5145ZM4.58667 18.3666C4.58667 19.3768 5.03387 20.2836 5.73334 20.915V22.9583C5.73334 23.2627 5.85415 23.5547 6.06919 23.77C6.28423 23.9853 6.57589 24.1062 6.88 24.1062H8.02667C8.33078 24.1062 8.62244 23.9853 8.83749 23.77C9.05253 23.5547 9.17334 23.2627 9.17334 22.9583V21.8104H18.3467V22.9583C18.3467 23.2627 18.4675 23.5547 18.6825 23.77C18.8976 23.9853 19.1892 24.1062 19.4933 24.1062H20.64C20.9441 24.1062 21.2358 23.9853 21.4508 23.77C21.6659 23.5547 21.7867 23.2627 21.7867 22.9583V20.915C22.4861 20.2836 22.9333 19.3768 22.9333 18.3666V6.88744C22.9333 2.86973 18.8283 2.29578 13.76 2.29578C8.69174 2.29578 4.58667 2.86973 4.58667 6.88744V18.3666Z"
      fill={color}
    />
  </svg>
);

const BusNumber = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 15px;
  font-weight: 700;
  line-height: 20px;
`;

const BusTime = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-tertiary, #8b95a1);
`;

const MenuInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const MenuCorner = styled.span`
  color: var(--text-tertiary, #8b95a1);

  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`;

const MenuName = styled.span`
  overflow: hidden;
  color: var(--text-secondary, #333d4b);
  text-overflow: ellipsis;

  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
`;

const LowerSheetSection = styled.div`
  background-color: #ffffff;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  //margin-top: -24px;
  position: relative;
  z-index: 5;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.02);
  padding: 28px ${MOBILE_PAGE_GUTTER} calc(var(--nav-height, 100px) + 20px);
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
