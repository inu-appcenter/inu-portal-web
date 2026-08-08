import { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { useTimeTableDetail, useTimeTables } from "@/hooks/useTimeTables";
import { useTimetableStore } from "@/stores/useTimetableStore";
import type { ClassItem as TimetableClassItem } from "@/components/mobile/timetable/TimetableGrid";
import { formatHoursToTime } from "@/utils/timetable";
import { ROUTES } from "@/constants/routes";
import {
  MOBILE_PAGE_GUTTER,
  DESKTOP_MEDIA,
  DESKTOP_CONTENT_MAX_WIDTH,
} from "@/styles/responsive";

import NoticeTabWidget from "@/containers/mobile/home/NoticeTabWidget";
import CommunityWidget from "@/components/mobile/community/CommunityWidget";
import SwipeMenuWidget from "@/containers/mobile/home/SwipeMenuWidget";
import SwipeBusWidget from "@/containers/mobile/home/SwipeBusWidget";
import HomeChipGroup from "@/components/mobile/home/HomeChipGroup";
import Calendar from "@/components/mobile/calendar/Calendar";
import YoutubeWidget from "@/components/mobile/home/YoutubeWidget";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import AppcenterLogo from "@/resources/assets/앱센터로고_new.svg";
import Banner from "@/containers/mobile/home/Banner";

import { formatRoom } from "@/components/mobile/timetable/TimetableGrid";

const CHANNEL_ID = "UCqOO8FqoVW6Y87jLnqhdflA";

const getTodayTimetableDay = (date: Date) => (date.getDay() + 6) % 7;

const getMinutesFromStartOfDay = (date: Date) =>
  date.getHours() * 60 + date.getMinutes();

const toMinutes = (hours: number) => Math.round(hours * 60);

const getTimetableStatusText = (classes: TimetableClassItem[], now: Date) => {
  if (classes.length === 0) return "등록된 수업 없음";

  const nowMinutes = getMinutesFromStartOfDay(now);
  const currentClass = classes.find(
    (classItem) =>
      toMinutes(classItem.startTime) <= nowMinutes &&
      nowMinutes < toMinutes(classItem.endTime),
  );

  if (currentClass) return "진행 중";

  const nextClass = classes.find(
    (classItem) => toMinutes(classItem.startTime) > nowMinutes,
  );

  if (!nextClass) return "오늘 수업 끝";

  const minutesUntilStart = toMinutes(nextClass.startTime) - nowMinutes;
  if (minutesUntilStart < 60) return `${minutesUntilStart}분 후 시작`;

  const hours = Math.floor(minutesUntilStart / 60);
  const minutes = minutesUntilStart % 60;
  return minutes === 0
    ? `${hours}시간 후 시작`
    : `${hours}시간 ${minutes}분 후 시작`;
};

export default function MobileHomePageV2() {
  const { userInfo, tokenInfo } = useUserStore();
  const navigate = useNavigate();
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [activeNoticeTab, setActiveNoticeTab] = useState<"school" | "dept">(
    "school",
  );
  const { timetables, selectedSemester } = useTimetableStore();

  const isLoggedIn = Boolean(tokenInfo?.accessToken);

  const { isLoading: isTimetablesLoading } = useTimeTables(
    undefined,
    undefined,
    {
      enabled: isLoggedIn,
    },
  );

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

  // const nickname = userInfo?.nickname || "유니";
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();
  const todayDateText = `${today.getMonth() + 1}월 ${today.getDate()}일 (${dayNames[today.getDay()]}) 오늘의 시간표`;

  const representativeTimetableId = useMemo(() => {
    if (!isLoggedIn) return null;

    const targetSemester =
      selectedSemester ||
      (timetables.find((timetable) => timetable.isRepresentative)?.semester ??
        timetables[0]?.semester);

    const inSemester = targetSemester
      ? timetables.filter((timetable) => timetable.semester === targetSemester)
      : timetables;

    return (
      inSemester.find((timetable) => timetable.isRepresentative)?.id ??
      inSemester[0]?.id ??
      timetables.find((timetable) => timetable.isRepresentative)?.id ??
      timetables[0]?.id ??
      null
    );
  }, [isLoggedIn, selectedSemester, timetables]);
  const { isLoading: isDetailLoading } = useTimeTableDetail(
    representativeTimetableId,
    { enabled: isLoggedIn && representativeTimetableId != null },
  );
  const activeTimetable = useMemo(
    () =>
      timetables.find(
        (timetable) => timetable.id === representativeTimetableId,
      ),
    [representativeTimetableId, timetables],
  );
  const todayClasses = useMemo(() => {
    const todayDay = getTodayTimetableDay(today);
    return (activeTimetable?.events ?? [])
      .filter((classItem) => classItem.day === todayDay)
      .sort((a, b) => a.startTime - b.startTime);
  }, [activeTimetable?.events, today]);
  const nowMinutes = getMinutesFromStartOfDay(today);
  const timetableStatusText = !isLoggedIn
    ? "로그인 필요"
    : isTimetablesLoading || isDetailLoading
      ? "불러오는 중"
      : getTimetableStatusText(todayClasses, today);

  return (
    <V2Wrapper>
      <UpperSection>
        <SectionInner>
          {/*<WelcomeMessage>*/}
          {/*  <HighlightName>{nickname}님,</HighlightName>*/}
          {/*  <GreetingText>좋은 아침이에요!</GreetingText>*/}
          {/*</WelcomeMessage>*/}

          <TodayTimetableCard onClick={() => navigate(ROUTES.TIMETABLE.ROOT)}>
            <WidgetHeader>
              <WidgetTitle>{todayDateText}</WidgetTitle>
              <WidgetSubTitle>{timetableStatusText}</WidgetSubTitle>
            </WidgetHeader>

            <ClassList>
              {!isLoggedIn ? (
                <EmptyClassItem>
                  로그인 후 시간표를 확인해보세요.
                </EmptyClassItem>
              ) : isTimetablesLoading || isDetailLoading ? (
                <EmptyClassItem>시간표를 불러오고 있어요.</EmptyClassItem>
              ) : todayClasses.length > 0 ? (
                todayClasses.map((classItem) => {
                  const startMinutes = toMinutes(classItem.startTime);
                  const endMinutes = toMinutes(classItem.endTime);
                  const isCurrent =
                    startMinutes <= nowMinutes && nowMinutes < endMinutes;

                  return (
                    <ClassItem
                      key={`${classItem.itemId ?? classItem.id}-${classItem.day}-${classItem.startTime}`}
                      $current={isCurrent}
                    >
                      <ClassName>{classItem.name}</ClassName>

                      <ClassInfo>
                        <ClassDetail>
                          {formatHoursToTime(classItem.startTime)}~
                          {formatHoursToTime(classItem.endTime)}
                        </ClassDetail>
                        {classItem.room && (
                          <ClassRoom>{formatRoom(classItem.room)}</ClassRoom>
                        )}
                      </ClassInfo>
                    </ClassItem>
                  );
                })
              ) : (
                <EmptyClassItem>오늘은 등록된 수업이 없어요.</EmptyClassItem>
              )}
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
                    title="커뮤니티"
                    children={<CommunityWidget />}
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
                  title="커뮤니티"
                  children={<CommunityWidget />}
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
  padding-top: calc(var(--header-height, 56px) + 8px);
  padding-bottom: 24px;
  background: #eff5fc;
`;

// const WelcomeMessage = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 4px;
//   margin-bottom: 24px;
//   text-align: left;
//   padding-left: 8px;
//
//   color: var(--text-secondary, #333d4b);
//   font-size: 20px;
//   font-style: normal;
//   font-weight: 700;
//   line-height: 28px;
//   letter-spacing: -0.2px;
// `;
//
// const HighlightName = styled.span``;
//
// const GreetingText = styled.span``;

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

const EmptyClassItem = styled.div`
  padding: 8px 16px;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
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
  padding-top: 12px;
  padding-bottom: 40px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 16px;
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
