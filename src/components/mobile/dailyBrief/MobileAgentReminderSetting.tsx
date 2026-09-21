import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Switch from "@/components/common/Switch";
import Skeleton from "@/components/common/Skeleton";
import {
  ChevronRight,
  Plus,
  Clock,
  Calendar,
  GraduationCap,
  Bell,
  Building2,
} from "lucide-react";
import {
  getAgentReminders,
  toggleAgentReminder,
} from "@/apis/agentReminder";
import {
  getDailyBriefSettings,
  updateDailyBriefSettings,
  getLocalDailyBriefSettings,
} from "@/apis/dailyBrief";
import { getKeywords } from "@/apis/notices";
import {
  getTimetableNowBarSettings,
  setTimetableNowBarSettings,
} from "@/apis/timetableNowBarBridge";
import type { AgentReminder, AgentReminderRepeatType } from "@/types/agentReminder";
import type { DailyBriefSettings } from "@/types/dailyBrief";
import { ROUTES } from "@/constants/routes";
import { trackEvent } from "@/utils/mixpanel";
import useUserStore from "@/stores/useUserStore";
import { renderRoutineIcon, getDefaultIconAndBgForTools } from "@/pages/mobile/MobileRoutineDetailPage";
import { useRoutineSync, notifyRoutineUpdated } from "@/utils/routineSync";
import Ripple from "@/components/common/Ripple";

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
  // 1. 기본 제공 추천 루틴 (학업 & 캠퍼스)
  {
    id: "preset-timetable-brief",
    category: "study",
    title: "당일 시간표 & 강의실 브리핑",
    description: "매일 아침 오늘 수강하는 수업 목록과 첫 강의실 위치를 브리핑받아요.",
    targetTime: "08:00",
    repeatType: "WEEKDAYS",
    targetTools: ["TIMETABLE"],
    toolParams: {
      iconType: "timetable",
      iconBg: "#a855f7",
      triggers: [
        {
          id: "trig-time-1",
          type: "TIME",
          title: "평일 (월~금)",
          subtitle: "오전 08:00",
          timeParams: { ampm: "AM", hour: "08", minute: "00", selectedDays: ["MON", "TUE", "WED", "THU", "FRI"], repeatType: "WEEKDAYS" },
        },
      ],
      actions: [
        {
          id: "act-time-1",
          type: "TIMETABLE",
          title: "당일 시간표 & 강의실 브리핑",
          subtitle: "오늘 수업 시간표 및 강의실 위치",
          iconBg: "#a855f7",
        },
      ],
    },
    iconType: "timetable",
    iconBg: "#a855f7",
    whenTitle: "매일 아침",
    whenSubtitle: "오전 08:00\n평일 (월~금)",
    whatTitle: "오늘 수업 시간표 및 강의실 위치",
  },
  {
    id: "preset-timetable-pre",
    category: "study",
    title: "강의 시작 전 알림",
    description: "각 수업 시작 10분 전에 다음 수업과 이동할 강의실 위치를 안내받아요.",
    targetTime: "08:50",
    repeatType: "WEEKDAYS",
    targetTools: ["TIMETABLE"],
    toolParams: {
      iconType: "timetable",
      iconBg: "#8b5cf6",
      triggers: [
        {
          id: "trig-pre-1",
          type: "BEFORE_CLASS",
          title: "각 수업 시작 전",
          subtitle: "수업 시작 10분 전",
          beforeClassParams: { minutes: 10 },
        },
      ],
      actions: [
        {
          id: "act-time-1",
          type: "TIMETABLE",
          title: "당일 시간표 & 강의실 브리핑",
          subtitle: "다음 수업 시간표 및 이동할 강의실 위치",
          iconBg: "#8b5cf6",
        },
      ],
    },
    iconType: "timetable",
    iconBg: "#8b5cf6",
    whenTitle: "수업 시작 전",
    whenSubtitle: "수업 시작 10분 전",
    whatTitle: "다음 수업 시간표 및 강의실 위치",
  },
  {
    id: "preset-timetable-nowbar",
    category: "study",
    title: "실시간 시간표 & Now Bar (Dynamic Island)",
    description: "수업 시작 전부터 끝날 때까지 잠금화면과 상태바에 실시간 강의실과 남은 시간 타이머를 띄워줘요.",
    targetTime: "08:45",
    repeatType: "WEEKDAYS",
    targetTools: ["TIMETABLE_NOWBAR"],
    toolParams: {
      iconType: "graduation",
      iconBg: "#0055D4",
      triggers: [
        {
          id: "trig-nowbar-1",
          type: "BEFORE_CLASS",
          title: "수업 시작 15분 전",
          subtitle: "수업 시작 15분 전부터 종료 시까지",
          beforeClassParams: { minutes: 15 },
        },
      ],
      actions: [
        {
          id: "act-nowbar-1",
          type: "TIMETABLE_NOWBAR",
          title: "실시간 시간표 Now Bar & Dynamic Island 띄우기",
          subtitle: "잠금화면 / 상태바 실시간 강의실 및 카운트다운 카드",
          iconBg: "#0055D4",
          timetableNowBarParams: { leadTimeMinutes: 15 },
        },
      ],
    },
    iconType: "graduation",
    iconBg: "#0055D4",
    whenTitle: "수업 시작 전부터",
    whenSubtitle: "수업 시작 15분 전 ~ 수업 종료 시",
    whatTitle: "실시간 Now Bar & Dynamic Island 카드 띄우기",
  },
  {
    id: "preset-schedule",
    category: "study",
    title: "학사일정 브리핑",
    description: "수강신청, 시험 기간 등 주요 학교 및 학과 학사일정을 사전에 확인해요.",
    targetTime: "08:30",
    repeatType: "WEEKDAYS",
    targetTools: ["SCHEDULE"],
    toolParams: {
      iconType: "graduation",
      iconBg: "#3b82f6",
      triggers: [
        {
          id: "trig-time-1",
          type: "TIME",
          title: "평일 (월~금)",
          subtitle: "오전 08:30",
          timeParams: { ampm: "AM", hour: "08", minute: "30", selectedDays: ["MON", "TUE", "WED", "THU", "FRI"], repeatType: "WEEKDAYS" },
        },
      ],
      actions: [
        {
          id: "act-sched-1",
          type: "SCHEDULE",
          title: "학사일정 브리핑",
          subtitle: "학교 및 학과 전체 • 1일 전 사전 안내",
          iconBg: "#3b82f6",
          scheduleParams: { scope: "ALL", advanceDays: 1 },
        },
      ],
    },
    iconType: "graduation",
    iconBg: "#3b82f6",
    whenTitle: "매일 아침",
    whenSubtitle: "오전 08:30\n평일 (월~금)",
    whatTitle: "주요 학사일정 사전 안내",
  },
  {
    id: "preset-school-notice",
    category: "study",
    title: "새 학교 공지사항 알림",
    description: "인천대학교 대표 홈페이지에 새 공지사항이 등록되면 소식을 감지해요.",
    targetTime: "09:00",
    repeatType: "WEEKDAYS",
    targetTools: ["NOTICE"],
    toolParams: {
      iconType: "notice",
      iconBg: "#5c9cf8",
      triggers: [
        {
          id: "trig-school-1",
          type: "SCHOOL_NOTICE",
          title: "새 학교 공지 등록 시",
          subtitle: "학교 대표 홈페이지에 새 공지가 올라올 때",
        },
      ],
      actions: [
        {
          id: "act-school-1",
          type: "SCHOOL_NOTICE",
          title: "새 학교 공지사항 알림",
          subtitle: "전체 카테고리 공지 소식",
          iconBg: "#5c9cf8",
          schoolNoticeParams: { categories: [], includeKeywords: [], excludeKeywords: [] },
        },
      ],
    },
    iconType: "notice",
    iconBg: "#5c9cf8",
    whenTitle: "새 공지 등록 시",
    whenSubtitle: "학교 새 공지 등록 시 실시간",
    whatTitle: "새 학교 공지사항 실시간 감지",
  },
  {
    id: "preset-dept-notice",
    category: "study",
    title: "새 학과 공지사항 알림",
    description: "내 학과 홈페이지에 새 공지사항 또는 관심 키워드 글이 올라오면 소식을 감지해요.",
    targetTime: "09:00",
    repeatType: "WEEKDAYS",
    targetTools: ["DEPT_NOTICE"],
    toolParams: {
      iconType: "dept",
      iconBg: "#ff7a00",
      triggers: [
        {
          id: "trig-dept-1",
          type: "DEPT_NOTICE",
          title: "새 학과 공지 등록 시",
          subtitle: "내 학과 홈페이지에 새 공지가 올라올 때",
        },
      ],
      actions: [
        {
          id: "act-dept-1",
          type: "DEPT_NOTICE",
          title: "새 학과 공지사항 알림",
          subtitle: "새 공지 및 관심 키워드 소식",
          iconBg: "#ff7a00",
          deptNoticeParams: { deptCode: "", deptName: "내 학과", includeKeywords: [], excludeKeywords: [] },
        },
      ],
    },
    iconType: "dept",
    iconBg: "#ff7a00",
    whenTitle: "새 공지 등록 시",
    whenSubtitle: "학과 새 공지 등록 시 실시간",
    whatTitle: "새 학과 공지사항 실시간 감지",
  },

  // 2. 이동 및 교통
  {
    id: "preset-bus-inip",
    category: "transit",
    title: "등교 버스 도착 정보 안내",
    description: "출근 및 등교 시간에 맞춰 인천대입구역 버스 도착 정보를 안내해요.",
    targetTime: "08:00",
    repeatType: "WEEKDAYS",
    targetTools: ["BUS"],
    toolParams: { stopName: "인천대입구역 1번출구", iconType: "bus", iconBg: "#ff7a00" },
    iconType: "bus",
    iconBg: "#ff7a00",
    whenTitle: "등교 시간",
    whenSubtitle: "오전 08:00\n평일 (월~금)",
    whatTitle: "인천대입구역 1번출구 버스 도착 정보",
  },
  {
    id: "preset-bus-leaving",
    category: "transit",
    title: "하교길 버스 도착 정보 안내",
    description: "수업 후 귀가할 때 정문 정류소 버스 도착 정보를 안내해요.",
    targetTime: "17:30",
    repeatType: "WEEKDAYS",
    targetTools: ["BUS"],
    toolParams: { stopName: "인천대 정문", iconType: "bus", iconBg: "#ff7a00" },
    iconType: "bus",
    iconBg: "#ff7a00",
    whenTitle: "하교 시간",
    whenSubtitle: "오후 05:30\n평일 (월~금)",
    whatTitle: "인천대 정문 정류소 버스 도착 정보",
  },

  // 3. 일상 & 생활
  {
    id: "preset-now-brief",
    category: "time_place",
    title: "Daily Brief 아침 요약",
    description: "일어나는 시간에 오늘 캠퍼스 날씨와 첫 수업 시간표를 확인해요.",
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
    title: "오늘의 점심 학식 식단",
    description: "점심시간 전에 학생식당과 기숙사 식당 메뉴를 확인해요.",
    targetTime: "11:30",
    repeatType: "WEEKDAYS",
    targetTools: ["CAFETERIA"],
    toolParams: { cafeteria: "전체", mealType: "LUNCH", iconType: "cafeteria", iconBg: "#22c55e" },
    iconType: "cafeteria",
    iconBg: "#22c55e",
    whenTitle: "점심시간",
    whenSubtitle: "오전 11:30\n평일 (월~금)",
    whatTitle: "학생식당 & 기숙사 식당 오늘 점심 메뉴",
  },
];

export default function MobileAgentReminderSetting() {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();

  const [reminders, setReminders] = useState<AgentReminder[]>([]);
  const [dailyBriefSettings, setDailyBriefSettings] = useState<DailyBriefSettings>(getLocalDailyBriefSettings);
  const [schoolKeywordsCount, setSchoolKeywordsCount] = useState<number>(0);
  const [deptKeywordsCount, setDeptKeywordsCount] = useState<number>(0);
  const [isSchoolNoticeEnabled, setIsSchoolNoticeEnabled] = useState<boolean>(true);
  const [isDeptNoticeEnabled, setIsDeptNoticeEnabled] = useState<boolean>(true);
  const [isNowBarEnabled, setIsNowBarEnabled] = useState<boolean>(true);
  const [nowBarLeadMinutes, setNowBarLeadMinutes] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [remindersRes, briefRes, keywordsRes, nowBarRes] = await Promise.all([
        getAgentReminders().catch(() => ({ data: [] })),
        getDailyBriefSettings().catch(() => ({ data: null })),
        getKeywords().catch(() => ({ data: [] })),
        getTimetableNowBarSettings().catch(() => null),
      ]);

      if (remindersRes?.data) {
        setReminders(remindersRes.data);
      }
      if (briefRes?.data) {
        setDailyBriefSettings(briefRes.data);
      }
      if (keywordsRes?.data) {
        const schoolKeys = keywordsRes.data.filter((k) => k.type === "SCHOOL_NOTICE" && k.keyword !== null);
        const deptKeys = keywordsRes.data.filter((k) => k.type === "DEPARTMENT" && k.keyword !== null);
        setSchoolKeywordsCount(schoolKeys.length);
        setDeptKeywordsCount(deptKeys.length);
      }
      if (nowBarRes) {
        setIsNowBarEnabled(nowBarRes.enabled);
        setNowBarLeadMinutes(nowBarRes.leadTimeMinutes || 15);
      }
    } catch (error) {
      console.error("루틴 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 다중 웹뷰 환경에서 루틴 상세 페이지(편집/삭제/등록) 후 복귀 시 자동 리스트 갱신
  useRoutineSync(fetchData);

  // System Routine Toggles
  const handleToggleTimetableBrief = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !dailyBriefSettings.timetableDailyBriefEnabled;
    setDailyBriefSettings((prev) => ({ ...prev, timetableDailyBriefEnabled: next }));
    try {
      await updateDailyBriefSettings({ timetableDailyBriefEnabled: next });
      trackEvent("[Daily Brief] 시스템 당일 강의 브리핑 토글", { enabled: next });
      notifyRoutineUpdated();
    } catch {
      setDailyBriefSettings((prev) => ({ ...prev, timetableDailyBriefEnabled: !next }));
      alert("설정을 변경하지 못했어요.");
    }
  };

  const handleToggleTimetablePre = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !dailyBriefSettings.timetablePreAlertEnabled;
    setDailyBriefSettings((prev) => ({ ...prev, timetablePreAlertEnabled: next }));
    try {
      await updateDailyBriefSettings({ timetablePreAlertEnabled: next });
      trackEvent("[Daily Brief] 시스템 강의 시작 전 알림 토글", { enabled: next });
      notifyRoutineUpdated();
    } catch {
      setDailyBriefSettings((prev) => ({ ...prev, timetablePreAlertEnabled: !next }));
      alert("설정을 변경하지 못했어요.");
    }
  };

  const handleToggleTimetableNowBar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isNowBarEnabled;
    setIsNowBarEnabled(next);
    try {
      await setTimetableNowBarSettings({ enabled: next });
      trackEvent("[Daily Brief] 실시간 시간표 Now Bar 토글", { enabled: next });
      notifyRoutineUpdated();
    } catch {
      setIsNowBarEnabled(!next);
      alert("설정을 변경하지 못했어요.");
    }
  };

  const handleToggleSchedule = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !dailyBriefSettings.scheduleAlertEnabled;
    setDailyBriefSettings((prev) => ({ ...prev, scheduleAlertEnabled: next }));
    try {
      await updateDailyBriefSettings({ scheduleAlertEnabled: next });
      trackEvent("[Daily Brief] 시스템 학사일정 알림 토글", { enabled: next });
      notifyRoutineUpdated();
    } catch {
      setDailyBriefSettings((prev) => ({ ...prev, scheduleAlertEnabled: !next }));
      alert("설정을 변경하지 못했어요.");
    }
  };

  const handleToggleSchoolNotice = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isSchoolNoticeEnabled;
    setIsSchoolNoticeEnabled(next);
    trackEvent("[Daily Brief] 시스템 학교 공지 알림 토글", { enabled: next });
    notifyRoutineUpdated();
  };

  const handleToggleDeptNotice = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isDeptNoticeEnabled;
    setIsDeptNoticeEnabled(next);
    trackEvent("[Daily Brief] 시스템 학과 공지 알림 토글", { enabled: next });
    notifyRoutineUpdated();
  };

  // Custom routine toggle
  const handleToggle = async (id: number, currentEnabled: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextEnabled = !currentEnabled;
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: nextEnabled } : r)),
    );
    try {
      await toggleAgentReminder(id, nextEnabled);
      trackEvent("[Daily Brief] 맞춤 루틴 토글", { id, enabled: nextEnabled });
      notifyRoutineUpdated();
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

  const getToolsDescription = (reminder: AgentReminder) => {
    if (reminder.toolParamsJson) {
      try {
        const parsed = JSON.parse(reminder.toolParamsJson);
        if (parsed.actions && Array.isArray(parsed.actions) && parsed.actions.length > 0) {
          return parsed.actions.map((a: any) => a.title).join(" • ");
        }
      } catch (ignored) {}
    }
    const toolsStr = reminder.targetTool;
    if (!toolsStr) return "캠퍼스 맞춤 알림";
    const parts = toolsStr.split(",").map((s) => s.trim().toUpperCase());
    const names = parts.map((p) => {
      if (p.includes("DEPT_NOTICE")) return "학과 공지";
      if (p.includes("NOTICE") || p.includes("SCHOOL_NOTICE")) return "학교 공지";
      if (p.includes("TIMETABLE")) return "시간표/강의실";
      if (p.includes("SCHEDULE")) return "학사일정";
      if (p.includes("WEATHER")) return "캠퍼스 날씨";
      if (p.includes("BUS")) return "버스 도착 알림";
      if (p.includes("CAFETERIA")) return "학식 식단";
      return p;
    });
    return names.join(" • ");
  };

  const getSchedulesSummary = (reminder: AgentReminder) => {
    if (reminder.toolParamsJson) {
      try {
        const parsed = JSON.parse(reminder.toolParamsJson);
        if (parsed.triggers && Array.isArray(parsed.triggers) && parsed.triggers.length > 0) {
          if (parsed.triggers.length > 1) {
            return `${parsed.triggers.length}개 조건 설정됨`;
          }
          return `${parsed.triggers[0].title} (${parsed.triggers[0].subtitle})`;
        }
      } catch (ignored) {}
    }
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
            <Ripple color="rgba(255, 255, 255, 0.25)" />
            <Plus size={16} strokeWidth={2.5} />
            <span>나만의 루틴 만들기</span>
          </CreateNewRoutineButton>
        </HeaderBannerLeft>
        <HeaderBannerIllustration>
          <svg viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="80" cy="115" rx="60" ry="8" fill="#e2e8f0" />
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
            <path
              d="M62 30C62 28 66 28 66 32V38M66 32L74 29V35M74 35C74 37 71 39 69 38M66 38C66 40 63 42 61 41"
              stroke="#ea580c"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
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

      {/* 1. 내 루틴 (기본 루틴 + 맞춤 루틴 통합 목록) */}
      <SectionWrapper>
        <SectionTitleRow>
          <SectionTitle>내 루틴</SectionTitle>
          <CountBadge>{6 + reminders.length}</CountBadge>
        </SectionTitleRow>

        {isLoading ? (
          <GroupCard>
            <GroupRow>
              <Skeleton variant="text" width="60%" height={22} />
            </GroupRow>
          </GroupCard>
        ) : (
          <GroupCard>
            {/* 1. 당일 강의 & 시간표 브리핑 */}
            <GroupRow onClick={() => navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL("system-timetable-brief"))}>
              <Ripple color="rgba(0, 0, 0, 0.05)" />
              <IconCircle $bgColor="#a855f7">
                <Calendar size={20} color="#ffffff" />
              </IconCircle>

              <TextContentWrapper>
                <RowMainTitle $disabled={!dailyBriefSettings.timetableDailyBriefEnabled}>
                  당일 강의 & 시간표 브리핑
                </RowMainTitle>
                <RowSubTitle>
                  {dailyBriefSettings.timetableDailyBriefEnabled
                    ? `매일 아침 ${dailyBriefSettings.timetableDailyBriefTime || "08:00"} 브리핑`
                    : "동작 꺼짐"}
                </RowSubTitle>
              </TextContentWrapper>

              <RowRightAction data-no-ripple="true" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={dailyBriefSettings.timetableDailyBriefEnabled}
                  onCheckedChange={() => handleToggleTimetableBrief({ stopPropagation: () => {} } as any)}
                />
              </RowRightAction>
            </GroupRow>

            <CardDivider />

            {/* 2. 강의 시작 전 알림 */}
            <GroupRow onClick={() => navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL("system-timetable-pre"))}>
              <Ripple color="rgba(0, 0, 0, 0.05)" />
              <IconCircle $bgColor="#8b5cf6">
                <Clock size={20} color="#ffffff" />
              </IconCircle>

              <TextContentWrapper>
                <RowMainTitle $disabled={!dailyBriefSettings.timetablePreAlertEnabled}>
                  강의 시작 전 알림
                </RowMainTitle>
                <RowSubTitle>
                  {dailyBriefSettings.timetablePreAlertEnabled
                    ? `수업 시작 ${dailyBriefSettings.timetablePreAlertMinutes || 10}분 전 알림`
                    : "동작 꺼짐"}
                </RowSubTitle>
              </TextContentWrapper>

              <RowRightAction data-no-ripple="true" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={dailyBriefSettings.timetablePreAlertEnabled}
                  onCheckedChange={() => handleToggleTimetablePre({ stopPropagation: () => {} } as any)}
                />
              </RowRightAction>
            </GroupRow>

            <CardDivider />

            {/* 3. 실시간 시간표 & Now Bar (Dynamic Island) */}
            <GroupRow onClick={() => navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL("system-timetable-nowbar"))}>
              <Ripple color="rgba(0, 0, 0, 0.05)" />
              <IconCircle $bgColor="#0055D4">
                <GraduationCap size={20} color="#ffffff" />
              </IconCircle>

              <TextContentWrapper>
                <RowMainTitle $disabled={!isNowBarEnabled}>
                  실시간 시간표 & Now Bar (Dynamic Island)
                </RowMainTitle>
                <RowSubTitle>
                  {isNowBarEnabled
                    ? `수업 시작 ${nowBarLeadMinutes}분 전 ~ 수업 종료 시 실시간 카드 표시`
                    : "동작 꺼짐"}
                </RowSubTitle>
              </TextContentWrapper>

              <RowRightAction data-no-ripple="true" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={isNowBarEnabled}
                  onCheckedChange={() => handleToggleTimetableNowBar({ stopPropagation: () => {} } as any)}
                />
              </RowRightAction>
            </GroupRow>

            <CardDivider />

            {/* 4. 학사일정 알림 */}
            <GroupRow onClick={() => navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL("system-schedule"))}>
              <Ripple color="rgba(0, 0, 0, 0.05)" />
              <IconCircle $bgColor="#3b82f6">
                <GraduationCap size={20} color="#ffffff" />
              </IconCircle>

              <TextContentWrapper>
                <RowMainTitle $disabled={!dailyBriefSettings.scheduleAlertEnabled}>
                  학사일정 알림
                </RowMainTitle>
                <RowSubTitle>
                  {dailyBriefSettings.scheduleAlertEnabled
                    ? `아침 ${dailyBriefSettings.scheduleDailyBriefTime || "08:30"} 브리핑 • ${(dailyBriefSettings.advanceDays ?? 1) === 0 ? "당일 알림" : `${dailyBriefSettings.advanceDays ?? 1}일 전 알림`}`
                    : "알림 꺼짐"}
                </RowSubTitle>
              </TextContentWrapper>

              <RowRightAction data-no-ripple="true" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={dailyBriefSettings.scheduleAlertEnabled}
                  onCheckedChange={() => handleToggleSchedule({ stopPropagation: () => {} } as any)}
                />
              </RowRightAction>
            </GroupRow>

            <CardDivider />

            {/* 4. 학교 공지 알림 */}
            <GroupRow onClick={() => navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL("system-school-notice"))}>
              <Ripple color="rgba(0, 0, 0, 0.05)" />
              <IconCircle $bgColor="#5c9cf8">
                <Bell size={20} color="#ffffff" />
              </IconCircle>

              <TextContentWrapper>
                <RowMainTitle $disabled={!isSchoolNoticeEnabled}>
                  학교 공지 알림
                </RowMainTitle>
                <RowSubTitle>
                  {isSchoolNoticeEnabled
                    ? `학교 새 공지${schoolKeywordsCount > 0 ? ` • 키워드 ${schoolKeywordsCount}개` : ""}`
                    : "알림 꺼짐"}
                </RowSubTitle>
              </TextContentWrapper>

              <RowRightAction data-no-ripple="true" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={isSchoolNoticeEnabled}
                  onCheckedChange={() => handleToggleSchoolNotice({ stopPropagation: () => {} } as any)}
                />
              </RowRightAction>
            </GroupRow>

            <CardDivider />

            {/* 5. 학과 공지 알림 */}
            <GroupRow onClick={() => navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL("system-dept-notice"))}>
              <Ripple color="rgba(0, 0, 0, 0.05)" />
              <IconCircle $bgColor="#ff7a00">
                <Building2 size={20} color="#ffffff" />
              </IconCircle>

              <TextContentWrapper>
                <RowMainTitle $disabled={!isDeptNoticeEnabled}>
                  학과 공지 알림
                </RowMainTitle>
                <RowSubTitle>
                  {isDeptNoticeEnabled
                    ? `${userInfo.department ? `${userInfo.department} 새 공지` : "내 학과 새 공지"}${deptKeywordsCount > 0 ? ` • 키워드 ${deptKeywordsCount}개` : ""}`
                    : "알림 꺼짐"}
                </RowSubTitle>
              </TextContentWrapper>

              <RowRightAction data-no-ripple="true" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={isDeptNoticeEnabled}
                  onCheckedChange={() => handleToggleDeptNotice({ stopPropagation: () => {} } as any)}
                />
              </RowRightAction>
            </GroupRow>

            {/* 맞춤 루틴 목록 */}
            {reminders.map((reminder) => {
              const { iconId, bg } = getReminderIconAndBg(reminder);
              return (
                <React.Fragment key={reminder.id}>
                  <CardDivider />
                  <GroupRow
                    onClick={() =>
                      navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL(reminder.id))
                    }
                  >
                    <Ripple color="rgba(0, 0, 0, 0.05)" />
                    <IconCircle $bgColor={bg}>
                      {renderRoutineIcon(iconId, 20, "#ffffff")}
                    </IconCircle>

                    <TextContentWrapper>
                      <RowMainTitle $disabled={!reminder.enabled}>
                        {reminder.title}
                      </RowMainTitle>
                      <RowSubTitle>
                        {getSchedulesSummary(reminder)} •{" "}
                        {getToolsDescription(reminder)}
                      </RowSubTitle>
                    </TextContentWrapper>

                    <RowRightAction data-no-ripple="true" onClick={(e) => e.stopPropagation()}>
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

      {/* 3. 이동할 때 유용한 섹션 */}
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
                <Ripple color="rgba(0, 0, 0, 0.05)" />
                <IconCircle $bgColor={preset.iconBg}>
                  {renderRoutineIcon(preset.iconType, 20, "#ffffff")}
                </IconCircle>

                <TextContentWrapper>
                  <RowMainTitle>{preset.title}</RowMainTitle>
                  <RowSubTitle>{preset.description}</RowSubTitle>
                </TextContentWrapper>

                <ChevronRight size={18} color="#d1d5db" style={{ position: "relative", zIndex: 1 }} />
              </GroupRow>
            </React.Fragment>
          ))}
        </GroupCard>
      </SectionWrapper>

      {/* 4. 특정 시간이나 장소에서 유용한 섹션 */}
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
                <Ripple color="rgba(0, 0, 0, 0.05)" />
                <IconCircle $bgColor={preset.iconBg}>
                  {renderRoutineIcon(preset.iconType, 20, "#ffffff")}
                </IconCircle>

                <TextContentWrapper>
                  <RowMainTitle>{preset.title}</RowMainTitle>
                  <RowSubTitle>{preset.description}</RowSubTitle>
                </TextContentWrapper>

                <ChevronRight size={18} color="#d1d5db" style={{ position: "relative", zIndex: 1 }} />
              </GroupRow>
            </React.Fragment>
          ))}
        </GroupCard>
      </SectionWrapper>

      {/* 5. 수업 및 캠퍼스 생활 섹션 */}
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
                <Ripple color="rgba(0, 0, 0, 0.05)" />
                <IconCircle $bgColor={preset.iconBg}>
                  {renderRoutineIcon(preset.iconType, 20, "#ffffff")}
                </IconCircle>

                <TextContentWrapper>
                  <RowMainTitle>{preset.title}</RowMainTitle>
                  <RowSubTitle>{preset.description}</RowSubTitle>
                </TextContentWrapper>

                <ChevronRight size={18} color="#d1d5db" style={{ position: "relative", zIndex: 1 }} />
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
  position: relative;
  overflow: hidden;
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

  span, svg {
    position: relative;
    z-index: 1;
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
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  cursor: pointer;
`;

const CardDivider = styled.div`
  height: 1px;
  background-color: #f1f5f9;
  margin-left: 68px;
`;

const IconCircle = styled.div<{ $bgColor: string }>`
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;
