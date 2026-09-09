import { useMemo } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { useTimeTableDetail, useTimeTables } from "@/hooks/useTimeTables";
import { useTimetableStore } from "@/stores/useTimetableStore";
import type { ClassItem as TimetableClassItem } from "@/components/mobile/timetable/TimetableGrid";
import { formatHoursToTime } from "@/utils/timetable";
import { formatRoom } from "@/components/mobile/timetable/TimetableGrid";
import { ROUTES } from "@/constants/routes";
import CapsuleButton from "@/components/common/CapsuleButton";

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

export interface TimetableClassDto {
  id?: string | number;
  name: string;
  startTime?: string | number;
  endTime?: string | number;
  room?: string;
  professor?: string;
  isCurrent?: boolean;
}

interface TodayTimetableWidgetProps {
  customTitle?: string;
  customStatusText?: string;
  customClasses?: TimetableClassDto[];
  customEmptyText?: string;
  onClick?: () => void;
}

export default function TodayTimetableWidget({
  customTitle,
  customStatusText,
  customClasses,
  customEmptyText,
  onClick,
}: TodayTimetableWidgetProps) {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const { timetables, selectedSemester } = useTimetableStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);

  const isCustomMode = customClasses !== undefined || customTitle !== undefined;

  const { isLoading: isTimetablesLoading } = useTimeTables(
    undefined,
    undefined,
    {
      enabled: isLoggedIn && !isCustomMode,
    },
  );

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const today = useMemo(() => new Date(), []);
  const defaultTodayDateText = `${today.getMonth() + 1}월 ${today.getDate()}일 (${dayNames[today.getDay()]}) 오늘의 시간표`;

  const representativeTimetableId = useMemo(() => {
    if (!isLoggedIn || isCustomMode) return null;

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
  }, [isLoggedIn, isCustomMode, selectedSemester, timetables]);

  const { isLoading: isDetailLoading } = useTimeTableDetail(
    representativeTimetableId,
    { enabled: isLoggedIn && representativeTimetableId != null && !isCustomMode },
  );

  const activeTimetable = useMemo(
    () =>
      timetables.find(
        (timetable) => timetable.id === representativeTimetableId,
      ),
    [representativeTimetableId, timetables],
  );

  const todayClasses = useMemo(() => {
    if (isCustomMode) return [];
    const todayDay = getTodayTimetableDay(today);
    return (activeTimetable?.events ?? [])
      .filter((classItem) => classItem.day === todayDay)
      .sort((a, b) => a.startTime - b.startTime);
  }, [activeTimetable?.events, isCustomMode, today]);

  const nowMinutes = getMinutesFromStartOfDay(today);

  const title = customTitle || defaultTodayDateText;
  const statusText = isCustomMode
    ? customStatusText || (customClasses && customClasses.length > 0 ? "수업 있음" : "등록된 수업 없음")
    : !isLoggedIn
      ? "로그인 필요"
      : isTimetablesLoading || isDetailLoading
        ? "불러오는 중"
        : getTimetableStatusText(todayClasses, today);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(ROUTES.TIMETABLE.ROOT);
    }
  };

  // 렌더링할 클래스 리스트 결정
  const displayClasses = isCustomMode ? customClasses || [] : todayClasses;

  return (
    <TodayTimetableCard onClick={handleClick}>
      <WidgetHeader>
        <WidgetTitle>{title}</WidgetTitle>
        <WidgetSubTitle>{statusText}</WidgetSubTitle>
      </WidgetHeader>

      <ClassList>
        {!isCustomMode && !isLoggedIn ? (
          <EmptyClassItem>
            로그인 후 시간표를 확인해보세요.
          </EmptyClassItem>
        ) : !isCustomMode && (isTimetablesLoading || isDetailLoading) ? (
          <EmptyClassItem>시간표를 불러오고 있어요.</EmptyClassItem>
        ) : displayClasses.length > 0 ? (
          displayClasses.map((classItem: any, idx: number) => {
            let isCurrent = Boolean(classItem.isCurrent);
            let timeStr = "";

            if (typeof classItem.startTime === "number") {
              const startMinutes = toMinutes(classItem.startTime);
              const endMinutes = toMinutes(classItem.endTime);
              isCurrent = startMinutes <= nowMinutes && nowMinutes < endMinutes;
              timeStr = `${formatHoursToTime(classItem.startTime)}~${formatHoursToTime(classItem.endTime)}`;
            } else if (typeof classItem.startTime === "string") {
              timeStr = `${classItem.startTime}~${classItem.endTime}`;
            }

            return (
              <ClassItem
                key={classItem.id || classItem.itemId || idx}
                $current={isCurrent}
              >
                <ClassName>{classItem.name}</ClassName>
                <ClassInfo>
                  <ClassDetail>{timeStr}</ClassDetail>
                  {classItem.room && (
                    <ClassRoom>{formatRoom(classItem.room)}</ClassRoom>
                  )}
                </ClassInfo>
              </ClassItem>
            );
          })
        ) : (
          <TimetableEmptyState>
            {!isCustomMode && !activeTimetable && (
              <CreateTimetableButton
                variant="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClick();
                }}
              >
                시간표 생성하기
              </CreateTimetableButton>
            )}
            <TimetableEmptyText>
              {customEmptyText ||
                (isCustomMode
                  ? "등록된 수업이 없어요."
                  : activeTimetable
                    ? "오늘은 등록된 수업이 없어요."
                    : "등록된 시간표가 없어요. 시간표를 만들어 보세요.")}
            </TimetableEmptyText>
          </TimetableEmptyState>
        )}
      </ClassList>
    </TodayTimetableCard>
  );
}

const TodayTimetableCard = styled.div`
  background-color: #ffffff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0px 4px 24px 0px #3b82f63d;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.15s ease-in-out;

  &:active {
    transform: scale(0.99);
  }
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
  gap: 8px;
`;

const WidgetTitle = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WidgetSubTitle = styled.span`
  color: var(--text-brand, #0061ff);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  flex-shrink: 0;
`;

const ClassList = styled.div`
  display: flex;
  flex-direction: column;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
`;

const ClassInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const ClassDetail = styled.span`
  color: var(--text-secondary, #333d4b);
  opacity: 0.5;
  white-space: nowrap;
`;

const ClassRoom = styled.span`
  color: var(--text-secondary, #333d4b);
  white-space: nowrap;
`;

const TimetableEmptyState = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 76px;
  width: 100%;
`;

const CreateTimetableButton = styled(CapsuleButton)`
  height: 36px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  box-shadow: none;
`;

const TimetableEmptyText = styled.p`
  margin: 0;
  width: 100%;
  color: var(--text-disabled, #b0b8c1);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  text-align: center;
  word-break: keep-all;
`;

const EmptyClassItem = styled.div`
  padding: 8px 16px;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`;
