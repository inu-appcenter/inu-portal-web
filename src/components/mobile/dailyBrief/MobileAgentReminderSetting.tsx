import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Switch from "@/components/common/Switch";
import Skeleton from "@/components/common/Skeleton";
import {
  ChevronRight,
  Plus,
  Clock,
} from "lucide-react";
import {
  getAgentReminders,
  toggleAgentReminder,
} from "@/apis/agentReminder";
import type { AgentReminder, AgentReminderRepeatType } from "@/types/agentReminder";
import { ROUTES } from "@/constants/routes";
import { trackEvent } from "@/utils/mixpanel";

import { renderRoutineIcon, getDefaultIconAndBgForTools } from "@/pages/mobile/MobileRoutineDetailPage";

export interface RoutinePreset {
  id: string;
  category: "transit" | "time_place" | "study";
  title: string;
  description: string;
  targetTime: string;
  repeatType: AgentReminderRepeatType;
  targetTools: string[];
  toolParams?: Record<string, any>;
  iconType: string;
  iconBg: string;
  whenTitle: string;
  whenSubtitle: string;
  whatTitle: string;
}

export const ROUTINE_PRESETS: RoutinePreset[] = [
  // 이동할 때 유용한
  {
    id: "preset-bus-inip",
    category: "transit",
    title: "등교 버스 알림",
    description: "출근 및 등교 시간에 인입역 실시간 버스 도착 알림을 받아요.",
    targetTime: "08:00",
    repeatType: "WEEKDAYS",
    targetTools: ["BUS"],
    toolParams: { stopName: "인천대입구역 1번출구", iconType: "bus", iconBg: "#ff7a00" },
    iconType: "bus",
    iconBg: "#ff7a00",
    whenTitle: "등교 시간",
    whenSubtitle: "오전 08:00\n평일 (월~금)",
    whatTitle: "인천대입구역 1번출구 실시간 버스 도착",
  },
  {
    id: "preset-bus-leaving",
    category: "transit",
    title: "하교길 버스 알림",
    description: "수업 후 귀가할 때 정문 정류소 실시간 버스 도착 알림을 받아요.",
    targetTime: "17:30",
    repeatType: "WEEKDAYS",
    targetTools: ["BUS"],
    toolParams: { stopName: "인천대 정문", iconType: "bus", iconBg: "#ff7a00" },
    iconType: "bus",
    iconBg: "#ff7a00",
    whenTitle: "하교 시간",
    whenSubtitle: "오후 05:30\n평일 (월~금)",
    whatTitle: "인천대 정문 정류소 실시간 버스 도착",
  },
  // 특정 시간이나 장소에서 유용한
  {
    id: "preset-now-brief",
    category: "time_place",
    title: "Daily Brief 아침 요약 알림",
    description: "평소 일어나는 시간에 당일 캠퍼스 날씨와 첫 강의 시간표 알림을 받아요.",
    targetTime: "08:00",
    repeatType: "WEEKDAYS",
    targetTools: ["WEATHER", "TIMETABLE"],
    toolParams: { iconType: "sun", iconBg: "#5c9cf8" },
    iconType: "sun",
    iconBg: "#5c9cf8",
    whenTitle: "기상 시간",
    whenSubtitle: "오전 08:00\n평일 (월~금)",
    whatTitle: "Daily Brief 아침 요약",
  },
  {
    id: "preset-lunch",
    category: "time_place",
    title: "점심 학식 알림",
    description: "오늘 학생식당 & 기숙사 식당 중식 메뉴 알림을 받아요.",
    targetTime: "11:30",
    repeatType: "WEEKDAYS",
    targetTools: ["CAFETERIA"],
    toolParams: { cafeteria: "전체", mealType: "LUNCH", iconType: "cafeteria", iconBg: "#22c55e" },
    iconType: "cafeteria",
    iconBg: "#22c55e",
    whenTitle: "점심시간",
    whenSubtitle: "오전 11:30\n평일 (월~금)",
    whatTitle: "학생식당 & 기숙사 식당 중식 메뉴",
  },
  // 수업 및 학업
  {
    id: "preset-timetable",
    category: "study",
    title: "오늘의 강의 & 날씨 알림",
    description: "당일 첫 수업 강의실 위치와 캠퍼스 날씨 알림을 받아요.",
    targetTime: "08:30",
    repeatType: "WEEKDAYS",
    targetTools: ["TIMETABLE", "WEATHER"],
    toolParams: { iconType: "timetable", iconBg: "#a855f7" },
    iconType: "timetable",
    iconBg: "#a855f7",
    whenTitle: "강의 시작 전",
    whenSubtitle: "오전 08:30\n평일 (월~금)",
    whatTitle: "오늘의 강의실 위치 및 캠퍼스 날씨",
  },
  {
    id: "preset-notice",
    category: "study",
    title: "새 공지사항 알림",
    description: "새로 등록된 주요 학교 및 학과 공지사항 알림을 받아요.",
    targetTime: "09:00",
    repeatType: "WEEKDAYS",
    targetTools: ["NOTICE"],
    toolParams: { iconType: "notice", iconBg: "#3b82f6" },
    iconType: "notice",
    iconBg: "#3b82f6",
    whenTitle: "매일 아침",
    whenSubtitle: "오전 09:00\n평일 (월~금)",
    whatTitle: "최신 학교 및 학과 주요 공지사항",
  },
];

export default function MobileAgentReminderSetting() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<AgentReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReminders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAgentReminders();
      if (res.data) {
        setReminders(res.data);
      }
    } catch (error) {
      console.error("맞춤 루틴 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleToggle = async (id: number, currentEnabled: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextEnabled = !currentEnabled;
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: nextEnabled } : r)),
    );
    try {
      await toggleAgentReminder(id, nextEnabled);
      trackEvent("[Daily Brief] 맞춤 루틴 토글", { id, enabled: nextEnabled });
    } catch (error) {
      console.error("맞춤 루틴 토글 실패:", error);
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: currentEnabled } : r)),
      );
      alert("루틴 상태를 변경하지 못했어요.");
    }
  };

  const handleOpenNew = () => {
    navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL("new"));
  };

  const getReminderIconAndBg = (reminder: AgentReminder) => {
    if (reminder.toolParamsJson) {
      try {
        const parsed = JSON.parse(reminder.toolParamsJson);
        if (parsed.iconType && parsed.iconBg) {
          return { iconId: parsed.iconType, bg: parsed.iconBg };
        }
      } catch (ignored) {}
    }
    return getDefaultIconAndBgForTools(reminder.targetTool);
  };

  const getToolsDescription = (toolsStr?: string) => {
    if (!toolsStr) return "캠퍼스 맞춤 알림";
    const parts = toolsStr.split(",").map((s) => s.trim().toUpperCase());
    const names = parts.map((p) => {
      if (p.includes("WEATHER")) return "캠퍼스 날씨";
      if (p.includes("BUS")) return "실시간 버스";
      if (p.includes("CAFETERIA")) return "학식 식단";
      if (p.includes("TIMETABLE")) return "시간표/강의실";
      if (p.includes("NOTICE")) return "학교 공지";
      return p;
    });
    return names.join(" • ");
  };

  const getSchedulesSummary = (reminder: AgentReminder) => {
    if (reminder.schedulesJson) {
      try {
        const parsed = JSON.parse(reminder.schedulesJson);
        if (Array.isArray(parsed) && parsed.length > 1) {
          return `${parsed.length}개 시간 조건 설정됨`;
        }
      } catch (ignored) {}
    }
    return `${reminder.repeatTypeDesc} ${reminder.targetTime}`;
  };

  const transitPresets = useMemo(
    () => ROUTINE_PRESETS.filter((p) => p.category === "transit"),
    [],
  );
  const timePlacePresets = useMemo(
    () => ROUTINE_PRESETS.filter((p) => p.category === "time_place"),
    [],
  );
  const studyPresets = useMemo(
    () => ROUTINE_PRESETS.filter((p) => p.category === "study"),
    [],
  );

  return (
    <RoutinePageWrapper>
      {/* 상단 헤더 & 일러스트 배너 */}
      <HeaderBannerCard>
        <HeaderBannerLeft>
          <BannerTitle>
            다양한 상황에 최적화된 일상의 루틴을 만들어 보세요.
          </BannerTitle>
          <CreateNewRoutineButton onClick={handleOpenNew}>
            <Plus size={16} strokeWidth={2.5} />
            <span>나만의 루틴 만들기</span>
          </CreateNewRoutineButton>
        </HeaderBannerLeft>
        <HeaderBannerIllustration>
          {/* 삼성 갤럭시 루틴 스타일 따뜻한 플랫 일러스트레이션 */}
          <svg viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="80" cy="115" rx="60" ry="8" fill="#e2e8f0" />
            {/* 소파 */}
            <path
              d="M30 75C30 70 35 65 42 65H118C125 65 130 70 130 75V105H30V75Z"
              fill="#eab308"
            />
            <path
              d="M25 78C25 74 28 70 32 70H38V108H32C28 108 25 104 25 100V78Z"
              fill="#ca8a04"
            />
            <path
              d="M122 70H128C132 70 135 74 135 78V100C135 104 132 108 128 108H122V70Z"
              fill="#ca8a04"
            />
            <rect x="35" y="105" width="8" height="12" rx="2" fill="#78350f" />
            <rect x="117" y="105" width="8" height="12" rx="2" fill="#78350f" />
            {/* 사람 */}
            <circle cx="100" cy="35" r="10" fill="#fbcfe8" />
            <path
              d="M96 28C96 26 100 24 105 27C110 30 108 36 106 38C104 40 98 38 96 35Z"
              fill="#ea580c"
            />
            <path
              d="M93 45C91 52 86 68 86 78H106C106 68 107 54 103 45L93 45Z"
              fill="#f43f5e"
            />
            <path
              d="M86 75L72 90C70 92 68 98 72 100L95 100C98 100 100 95 98 90L92 75H86Z"
              fill="#ffffff"
            />
            {/* 태블릿 */}
            <rect
              x="72"
              y="52"
              width="22"
              height="15"
              rx="3"
              transform="rotate(-15 72 52)"
              fill="#64748b"
            />
            <rect
              x="74"
              y="54"
              width="18"
              height="11"
              rx="1.5"
              transform="rotate(-15 74 54)"
              fill="#93c5fd"
            />
            {/* 음표 */}
            <path
              d="M62 30C62 28 66 28 66 32V38M66 32L74 29V35M74 35C74 37 71 39 69 38M66 38C66 40 63 42 61 41"
              stroke="#ea580c"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* 강아지 */}
            <ellipse cx="48" cy="98" rx="14" ry="9" fill="#d97706" />
            <circle cx="36" cy="92" r="6" fill="#d97706" />
            <path d="M34 88C32 86 31 89 33 91Z" fill="#b45309" />
            <rect x="40" y="104" width="4" height="8" rx="1.5" fill="#d97706" />
            <rect x="52" y="104" width="4" height="8" rx="1.5" fill="#d97706" />
            <path
              d="M62 95C66 93 68 90 67 87"
              stroke="#d97706"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </HeaderBannerIllustration>
      </HeaderBannerCard>

      {/* 1. 내가 등록한 루틴 섹션 */}
      <SectionWrapper>
        <SectionTitleRow>
          <SectionTitle>내가 등록한 루틴</SectionTitle>
          {reminders.length > 0 && <CountBadge>{reminders.length}</CountBadge>}
        </SectionTitleRow>

        {isLoading ? (
          <GroupCard>
            <GroupRow>
              <Skeleton variant="text" width="60%" height={22} />
            </GroupRow>
          </GroupCard>
        ) : reminders.length === 0 ? (
          <EmptyGroupCard>
            <EmptyIconCircle>
              <Clock size={24} color="#94a3b8" />
            </EmptyIconCircle>
            <EmptyTitle>아직 등록된 루틴이 없어요</EmptyTitle>
            <EmptySubText>
              아래 추천 루틴을 누르거나 새 루틴을 추가해 보세요.
            </EmptySubText>
            <EmptyAddButton onClick={handleOpenNew}>
              <Plus size={15} strokeWidth={2.5} />
              <span>새 루틴 만들기</span>
            </EmptyAddButton>
          </EmptyGroupCard>
        ) : (
          <GroupCard>
            {reminders.map((reminder, idx) => {
              const { iconId, bg } = getReminderIconAndBg(reminder);
              return (
                <React.Fragment key={reminder.id}>
                  {idx > 0 && <CardDivider />}
                  <GroupRow
                    onClick={() =>
                      navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL(reminder.id))
                    }
                  >
                    <IconCircle $bgColor={bg}>
                      {renderRoutineIcon(iconId, 20, "#ffffff")}
                    </IconCircle>

                    <TextContentWrapper>
                      <RowMainTitle $disabled={!reminder.enabled}>
                        {reminder.title}
                      </RowMainTitle>
                      <RowSubTitle>
                        {getSchedulesSummary(reminder)} •{" "}
                        {getToolsDescription(reminder.targetTool)}
                      </RowSubTitle>
                    </TextContentWrapper>

                    <RowRightAction onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={() =>
                          handleToggle(reminder.id, reminder.enabled)
                        }
                      />
                    </RowRightAction>
                  </GroupRow>
                </React.Fragment>
              );
            })}
          </GroupCard>
        )}
      </SectionWrapper>

      {/* 2. 이동할 때 유용한 섹션 */}
      <SectionWrapper>
        <SectionTitleRow>
          <SectionTitle>이동할 때 유용한</SectionTitle>
          <ChevronRight size={18} color="#9ca3af" />
        </SectionTitleRow>

        <GroupCard>
          {transitPresets.map((preset, idx) => (
            <React.Fragment key={preset.id}>
              {idx > 0 && <CardDivider />}
              <GroupRow
                onClick={() =>
                  navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL(preset.id))
                }
              >
                <IconCircle $bgColor={preset.iconBg}>
                  {renderRoutineIcon(preset.iconType, 20, "#ffffff")}
                </IconCircle>

                <TextContentWrapper>
                  <RowMainTitle>{preset.title}</RowMainTitle>
                  <RowSubTitle>{preset.description}</RowSubTitle>
                </TextContentWrapper>

                <ChevronRight size={18} color="#d1d5db" />
              </GroupRow>
            </React.Fragment>
          ))}
        </GroupCard>
      </SectionWrapper>

      {/* 3. 특정 시간이나 장소에서 유용한 섹션 */}
      <SectionWrapper>
        <SectionTitleRow>
          <SectionTitle>특정 시간이나 장소에서 유용한</SectionTitle>
          <ChevronRight size={18} color="#9ca3af" />
        </SectionTitleRow>

        <GroupCard>
          {timePlacePresets.map((preset, idx) => (
            <React.Fragment key={preset.id}>
              {idx > 0 && <CardDivider />}
              <GroupRow
                onClick={() =>
                  navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL(preset.id))
                }
              >
                <IconCircle $bgColor={preset.iconBg}>
                  {renderRoutineIcon(preset.iconType, 20, "#ffffff")}
                </IconCircle>

                <TextContentWrapper>
                  <RowMainTitle>{preset.title}</RowMainTitle>
                  <RowSubTitle>{preset.description}</RowSubTitle>
                </TextContentWrapper>

                <ChevronRight size={18} color="#d1d5db" />
              </GroupRow>
            </React.Fragment>
          ))}
        </GroupCard>
      </SectionWrapper>

      {/* 4. 수업 및 학업 섹션 */}
      <SectionWrapper>
        <SectionTitleRow>
          <SectionTitle>수업 및 캠퍼스 생활</SectionTitle>
          <ChevronRight size={18} color="#9ca3af" />
        </SectionTitleRow>

        <GroupCard>
          {studyPresets.map((preset, idx) => (
            <React.Fragment key={preset.id}>
              {idx > 0 && <CardDivider />}
              <GroupRow
                onClick={() =>
                  navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL(preset.id))
                }
              >
                <IconCircle $bgColor={preset.iconBg}>
                  {renderRoutineIcon(preset.iconType, 20, "#ffffff")}
                </IconCircle>

                <TextContentWrapper>
                  <RowMainTitle>{preset.title}</RowMainTitle>
                  <RowSubTitle>{preset.description}</RowSubTitle>
                </TextContentWrapper>

                <ChevronRight size={18} color="#d1d5db" />
              </GroupRow>
            </React.Fragment>
          ))}
        </GroupCard>
      </SectionWrapper>
    </RoutinePageWrapper>
  );
}

/* =========================================================================
 * Samsung Galaxy One UI 스타일드 컴포넌트
 * ========================================================================= */

const RoutinePageWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: transparent;
  padding-bottom: 120px;
`;

const HeaderBannerCard = styled.div`
  background-color: #f7f8fa;
  border-radius: 24px;
  padding: 20px 20px 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #edf0f5;
`;

const HeaderBannerLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const BannerTitle = styled.h1`
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  line-height: 1.35;
  margin: 0;
  letter-spacing: -0.4px;
`;

const CreateNewRoutineButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #111827;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  width: fit-content;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #27272a;
  }
`;

const HeaderBannerIllustration = styled.div`
  width: 105px;
  height: 90px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
`;

const SectionTitle = styled.h2`
  font-size: 14.5px;
  font-weight: 700;
  color: #64748b;
  margin: 0;
  letter-spacing: -0.2px;
`;

const CountBadge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
  background-color: #dbeafe;
  padding: 2px 7px;
  border-radius: 9999px;
`;

const GroupCard = styled.div`
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
`;

const GroupRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f8fafc;
  }
`;

const CardDivider = styled.div`
  height: 1px;
  background-color: #f1f5f9;
  margin-left: 68px;
`;

const IconCircle = styled.div<{ $bgColor: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TextContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
`;

const RowMainTitle = styled.div<{ $disabled?: boolean }>`
  font-size: 15.5px;
  font-weight: 700;
  color: ${({ $disabled }) => ($disabled ? "#9ca3af" : "#111827")};
  letter-spacing: -0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowSubTitle = styled.div`
  font-size: 12.5px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowRightAction = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const EmptyGroupCard = styled.div`
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid #e9ecef;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
`;

const EmptyIconCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`;

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
`;

const EmptySubText = styled.div`
  font-size: 13px;
  color: #6b7280;
  max-width: 240px;
  line-height: 1.45;
`;

const EmptyAddButton = styled.button`
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 9px 18px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
`;
