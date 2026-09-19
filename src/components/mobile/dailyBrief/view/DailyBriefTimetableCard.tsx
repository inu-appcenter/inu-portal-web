import { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useTimeTables, useTimeTableDetail } from "@/hooks/useTimeTables";
import { getSchedules } from "@/apis/schedules";
import { Schedule } from "@/types/schedules";
import { ROUTES } from "@/constants/routes";
import { formatHoursToTime } from "@/utils/timetable";
import Icon from "@/components/common/Icon";

interface SmartBreakInfo {
  startHour: number;
  endHour: number;
  durationMinutes: number;
  isCurrentlyInBreak: boolean;
  prevClassName: string;
  nextClassName: string;
}

export default function DailyBriefTimetableCard() {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);
  const { timetables, selectedSemester } = useTimetableStore();

  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);

  useTimeTables(undefined, undefined, {
    enabled: isLoggedIn,
  });

  const now = useMemo(() => new Date(), []);
  const todayDayOfWeek = (now.getDay() + 6) % 7; // 0: 월 ~ 6: 일
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 당일 학사일정 조회
  useEffect(() => {
    let isMounted = true;
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const todayStr = `${year}-${String(month).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    void getSchedules(year, month)
      .then((res) => {
        if (isMounted && res.data) {
          const matched = res.data.filter((sched) => {
            const start = sched.start ? sched.start.split("T")[0] : "";
            const end = sched.end ? sched.end.split("T")[0] : start;
            return todayStr >= start && todayStr <= end;
          });
          setTodaySchedules(matched);
        }
      })
      .catch((err) => {
        console.warn("학사일정 조회 실패:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [now]);

  // 대표 시간표 찾기
  const representativeTimetableId = useMemo(() => {
    if (!isLoggedIn) return null;
    const targetSemester =
      selectedSemester ||
      (timetables.find((t) => t.isRepresentative)?.semester ??
        timetables[0]?.semester);
    const inSemester = targetSemester
      ? timetables.filter((t) => t.semester === targetSemester)
      : timetables;
    return (
      inSemester.find((t) => t.isRepresentative)?.id ??
      inSemester[0]?.id ??
      timetables.find((t) => t.isRepresentative)?.id ??
      timetables[0]?.id ??
      null
    );
  }, [isLoggedIn, selectedSemester, timetables]);

  useTimeTableDetail(representativeTimetableId, {
    enabled: isLoggedIn && representativeTimetableId != null,
  });

  const activeTimetable = useMemo(
    () =>
      timetables.find((timetable) => timetable.id === representativeTimetableId),
    [representativeTimetableId, timetables],
  );

  // 오늘 강의 목록 필터링
  const todayClasses = useMemo(() => {
    if (!activeTimetable || !activeTimetable.events) return [];
    return activeTimetable.events
      .filter((cls) => cls.day === todayDayOfWeek)
      .sort((a, b) => a.startTime - b.startTime);
  }, [activeTimetable, todayDayOfWeek]);

  // 남은 수업 개수
  const remainingClasses = useMemo(() => {
    return todayClasses.filter((cls) => {
      const endMins = Math.round(cls.endTime * 60);
      return endMins > currentMinutes;
    });
  }, [todayClasses, currentMinutes]);

  // 스마트 공강 계산 (1.5시간 / 90분 이상 간격)
  const smartBreakInfo = useMemo<SmartBreakInfo | null>(() => {
    if (todayClasses.length < 2) return null;

    let activeBreak: SmartBreakInfo | null = null;
    let upcomingBreak: SmartBreakInfo | null = null;

    for (let i = 0; i < todayClasses.length - 1; i++) {
      const prev = todayClasses[i];
      const next = todayClasses[i + 1];
      const prevEndMins = Math.round(prev.endTime * 60);
      const nextStartMins = Math.round(next.startTime * 60);
      const gapMinutes = nextStartMins - prevEndMins;

      // 90분 이상 공강
      if (gapMinutes >= 90) {
        const isCurrentlyIn =
          currentMinutes >= prevEndMins && currentMinutes < nextStartMins;

        const info: SmartBreakInfo = {
          startHour: prev.endTime,
          endHour: next.startTime,
          durationMinutes: gapMinutes,
          isCurrentlyInBreak: isCurrentlyIn,
          prevClassName: prev.name,
          nextClassName: next.name,
        };

        if (isCurrentlyIn) {
          activeBreak = info;
          break;
        } else if (!upcomingBreak && currentMinutes < nextStartMins) {
          upcomingBreak = info;
        }
      }
    }

    return activeBreak || upcomingBreak;
  }, [todayClasses, currentMinutes]);

  const introText = useMemo(() => {
    if (!isLoggedIn) return "로그인하고 오늘의 시간표를 확인해 보세요.";
    if (todayClasses.length === 0)
      return "오늘은 수업이 없는 날이에요. 여유로운 하루를 즐겨보세요!";
    if (remainingClasses.length === 0)
      return "오늘 예정된 모든 수업이 끝났습니다. 수고하셨어요! ✨";
    return `오늘 일정이 ${remainingClasses.length}개 남았습니다.`;
  }, [isLoggedIn, todayClasses.length, remainingClasses.length]);

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return `${h}시간`;
    return `${h}시간 ${m}분`;
  };

  return (
    <SectionWrapper>
      <ContextIntro>{introText}</ContextIntro>
      <CardContainer onClick={() => navigate(ROUTES.TIMETABLE.ROOT)}>
        <CardHeader>
          <CardTitle>오늘의 강의</CardTitle>
          <EditButton
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.TIMETABLE.ROOT);
            }}
            aria-label="시간표 편집 바로가기"
          >
            <Icon name="edit-pencil-01" size={16} color="#8A92A0" />
          </EditButton>
        </CardHeader>

        {/* 당일 학사일정이 있을 경우 표출하는 학사일정 알림 배너 */}
        {todaySchedules.length > 0 && (
          <AcademicScheduleBanner
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.BOARD.CALENDAR);
            }}
          >
            <ScheduleLeft>
              <ScheduleBadge>학사일정</ScheduleBadge>
              <ScheduleTitleText>
                {todaySchedules.map((s) => s.title).join(", ")}
              </ScheduleTitleText>
            </ScheduleLeft>
            <Icon name="chevron-right" size={14} color="#6b7280" />
          </AcademicScheduleBanner>
        )}

        {/* 1.5시간 이상 공강 발생 시 표출되는 스마트 공강 배너 */}
        {smartBreakInfo && (
          <SmartBreakBanner
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <BreakHeaderRow>
              <BreakBadge $active={smartBreakInfo.isCurrentlyInBreak}>
                {smartBreakInfo.isCurrentlyInBreak ? "☕ 지금 공강 중" : "✨ 꿀공강 알림"}
              </BreakBadge>
              <BreakTimeRange>
                {formatHoursToTime(smartBreakInfo.startHour)} ~{" "}
                {formatHoursToTime(smartBreakInfo.endHour)} (
                {formatDuration(smartBreakInfo.durationMinutes)})
              </BreakTimeRange>
            </BreakHeaderRow>
            <BreakDescription>
              {smartBreakInfo.isCurrentlyInBreak
                ? `다음 ${smartBreakInfo.nextClassName} 수업까지 여유가 있어요. 학술정보관이나 카페에서 알차게 보내보세요!`
                : `오늘 ${smartBreakInfo.prevClassName} 수업 후 ${formatDuration(smartBreakInfo.durationMinutes)} 공강이 예정되어 있어요.`}
            </BreakDescription>
            <BreakActionChips>
              <BreakChip onClick={() => navigate(ROUTES.SERVICES.LIBRARY)}>
                <Icon name="book" size={12} color="#0284C7" />
                <span>열람실 좌석 현황</span>
              </BreakChip>
              <BreakChip onClick={() => navigate(ROUTES.SERVICES.LIBRARY)}>
                <Icon name="users" size={12} color="#0284C7" />
                <span>이룸관 스터디룸</span>
              </BreakChip>
            </BreakActionChips>
          </SmartBreakBanner>
        )}

        <Divider />

        <CardContent>
          {!isLoggedIn ? (
            <EmptyStateWrapper>
              <EmptyText>로그인하면 내 시간표의 강의를 볼 수 있어요</EmptyText>
            </EmptyStateWrapper>
          ) : todayClasses.length === 0 ? (
            <EmptyStateWrapper>
              <EmptyText>오늘 등록된 강의 일정이 없어요 ☕</EmptyText>
            </EmptyStateWrapper>
          ) : (
            <ClassList>
              {(remainingClasses.length > 0 ? remainingClasses : todayClasses)
                .slice(0, 3)
                .map((cls, idx) => {
                  const isCurrent =
                    Math.round(cls.startTime * 60) <= currentMinutes &&
                    currentMinutes < Math.round(cls.endTime * 60);

                  return (
                    <ClassItemRow key={cls.id || idx}>
                      <AccentBar $isCurrent={isCurrent} />
                      <ClassDetails>
                        <ClassNameRow>
                          <ClassName>{cls.name}</ClassName>
                          {isCurrent && <CurrentBadge>진행 중</CurrentBadge>}
                        </ClassNameRow>
                        <ClassMeta>
                          {formatHoursToTime(cls.startTime)} -{" "}
                          {formatHoursToTime(cls.endTime)}
                          {cls.room && ` · ${cls.room}`}
                        </ClassMeta>
                      </ClassDetails>
                    </ClassItemRow>
                  );
                })}
            </ClassList>
          )}
        </CardContent>
      </CardContainer>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
`;

const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 28px;
  padding: 22px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:active {
    transform: scale(0.985);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  margin: 0;
`;

const AcademicScheduleBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 14px;
  margin-top: 14px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:active {
    background-color: #f1f5f9;
  }
`;

const ScheduleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
`;

const ScheduleBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #0284c7;
  background-color: #e0f2fe;
  padding: 2px 6px;
  border-radius: 5px;
  white-space: nowrap;
`;

const ScheduleTitleText = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SmartBreakBanner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 16px;
  padding: 12px 14px;
  margin-top: 14px;
`;

const BreakHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BreakBadge = styled.span<{ $active?: boolean }>`
  font-size: 11.5px;
  font-weight: 800;
  color: ${({ $active }) => ($active ? "#0369a1" : "#0284c7")};
  background-color: #ffffff;
  padding: 3px 8px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const BreakTimeRange = styled.span`
  font-size: 12.5px;
  font-weight: 700;
  color: #0369a1;
`;

const BreakDescription = styled.p`
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  margin: 0;
  line-height: 1.45;
  letter-spacing: -0.2px;
`;

const BreakActionChips = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
`;

const BreakChip = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 5px 10px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const EditButton = styled.button`
  background: rgba(243, 244, 246, 0.9);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: #e5e7eb;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #f3f4f6;
  margin: 16px 0 14px 0;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const ClassList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ClassItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const AccentBar = styled.div<{ $isCurrent: boolean }>`
  width: 4px;
  height: 38px;
  border-radius: 2px;
  background-color: ${({ $isCurrent }) =>
    $isCurrent ? "#3B82F6" : "rgba(107, 114, 128, 0.25)"};
  flex-shrink: 0;
  margin-top: 2px;
`;

const ClassDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const ClassNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ClassName = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
`;

const CurrentBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  background-color: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
`;

const ClassMeta = styled.span`
  font-size: 13.5px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: -0.2px;
`;

const EmptyStateWrapper = styled.div`
  padding: 12px 0 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled.p`
  font-size: 14.5px;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
`;
