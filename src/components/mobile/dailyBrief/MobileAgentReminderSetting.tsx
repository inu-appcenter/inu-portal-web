import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Switch from "@/components/common/Switch";
import Skeleton from "@/components/common/Skeleton";
import Modal from "@/components/common/Modal";
import {
  ChevronRight,
  Plus,
  Clock,
  Calendar,
  GraduationCap,
  SlidersHorizontal,
  Sparkles,
  Check,
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
import {
  getTimetableNowBarSettings,
  setTimetableNowBarSettings,
} from "@/apis/timetableNowBarBridge";
import type { AgentReminder, AgentReminderRepeatType } from "@/types/agentReminder";
import type { DailyBriefSettings, ScheduleScope } from "@/types/dailyBrief";
import { ROUTES } from "@/constants/routes";
import { trackEvent } from "@/utils/mixpanel";
import { renderRoutineIcon, getDefaultIconAndBgForTools } from "@/pages/mobile/MobileRoutineDetailPage";
import { useRoutineSync, notifyRoutineUpdated } from "@/utils/routineSync";
import Ripple from "@/components/common/Ripple";

export const PRE_ALERT_OPTIONS = [
  { label: "수업 시작 5분 전", value: 5 },
  { label: "수업 시작 10분 전 (기본)", value: 10 },
  { label: "수업 시작 15분 전", value: 15 },
  { label: "수업 시작 20분 전", value: 20 },
  { label: "수업 시작 30분 전", value: 30 },
];

export const NOWBAR_LEAD_OPTIONS = [
  { label: "수업 시작 5분 전부터", value: 5 },
  { label: "수업 시작 10분 전부터", value: 10 },
  { label: "수업 시작 15분 전부터 (기본)", value: 15 },
  { label: "수업 시작 20분 전부터", value: 20 },
  { label: "수업 시작 30분 전부터", value: 30 },
];

export const SCHEDULE_SCOPE_OPTIONS: { label: string; value: ScheduleScope }[] = [
  { label: "전체 (학교 및 내 학과)", value: "ALL" },
  { label: "학교 학사일정만", value: "SCHOOL_ONLY" },
  { label: "내 학과 학사일정만", value: "DEPT_ONLY" },
];

export const ADVANCE_DAYS_OPTIONS = [
  { label: "당일 알림 (D-Day)", value: 0 },
  { label: "1일 전 사전 안내 (D-1, 권장)", value: 1 },
  { label: "3일 전 사전 안내 (D-3)", value: 3 },
  { label: "7일 전 사전 안내 (D-7)", value: 7 },
];

export const formatTimeLabel = (timeStr?: string) => {
  if (!timeStr) return "오전 08:00";
  const [hourStr, minStr] = timeStr.split(":");
  const h = parseInt(hourStr, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "오후" : "오전";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${ampm} ${String(h12).padStart(2, "0")}:${(minStr || "00").padStart(2, "0")}`;
};

export const getScheduleAdvanceDaysLabel = (days?: number) => {
  if (days === 0) return "당일 알림";
  if (days === 3) return "3일 전 사전 안내";
  if (days === 7) return "7일 전 사전 안내";
  return "1일 전 사전 안내";
};

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
    title: "오늘 강의 시간표 알림",
    description: "오늘 수강하는 수업과 강의실 위치를 알림으로 받아요.",
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
          title: "오늘 강의 시간표 알림",
          subtitle: "오늘 수업 시간표 및 강의실 위치",
          iconBg: "#a855f7",
        },
      ],
    },
    iconType: "timetable",
    iconBg: "#a855f7",
    whenTitle: "지정한 시간",
    whenSubtitle: "오전 08:00\n평일 (월~금)",
    whatTitle: "오늘 수업 시간표 및 강의실 위치",
  },
  {
    id: "preset-timetable-pre",
    category: "study",
    title: "수업 시작 전 알림",
    description: "수업 시작 전 강의실을 실시간 Now Bar 카드 또는 일반 푸시로 안내받아요.",
    targetTime: "08:45",
    repeatType: "WEEKDAYS",
    targetTools: ["TIMETABLE_NOWBAR", "TIMETABLE"],
    toolParams: {
      iconType: "graduation",
      iconBg: "#0055D4",
      triggers: [
        {
          id: "trig-pre-1",
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
          title: "수업 시작 전 알림",
          subtitle: "잠금화면 실시간 Now Bar 카드 또는 1회성 푸시",
          iconBg: "#0055D4",
          timetableNowBarParams: { leadTimeMinutes: 15 },
        },
      ],
    },
    iconType: "graduation",
    iconBg: "#0055D4",
    whenTitle: "수업 시작 전",
    whenSubtitle: "수업 시작 15분 전 ~ 수업 종료 시",
    whatTitle: "실시간 강의실 및 시간표 안내",
  },
  {
    id: "preset-schedule",
    category: "study",
    title: "주요 학사일정 알림",
    description: "다가오는 주요 학사일정을 알림으로 받아요.",
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
          title: "주요 학사일정 알림",
          subtitle: "학교 및 학과 전체 • 1일 전 사전 안내",
          iconBg: "#3b82f6",
          scheduleParams: { scope: "ALL", advanceDays: 1 },
        },
      ],
    },
    iconType: "graduation",
    iconBg: "#3b82f6",
    whenTitle: "지정한 시간",
    whenSubtitle: "오전 08:30\n평일 (월~금)",
    whatTitle: "주요 학사일정 사전 안내",
  },

  // 2. 이동 및 교통
  {
    id: "preset-bus-inip",
    category: "transit",
    title: "등교 버스 도착 알림",
    description: "인천대입구역 버스 도착 정보를 알림으로 받아요.",
    targetTime: "08:00",
    repeatType: "WEEKDAYS",
    targetTools: ["BUS"],
    toolParams: { stopName: "인천대입구역 1번출구", iconType: "bus", iconBg: "#ff7a00" },
    iconType: "bus",
    iconBg: "#ff7a00",
    whenTitle: "지정한 시간",
    whenSubtitle: "오전 08:00\n평일 (월~금)",
    whatTitle: "인천대입구역 1번출구 버스 도착 정보",
  },
  {
    id: "preset-bus-leaving",
    category: "transit",
    title: "하교 버스 도착 알림",
    description: "인천대 정문 버스 도착 정보를 알림으로 받아요.",
    targetTime: "17:30",
    repeatType: "WEEKDAYS",
    targetTools: ["BUS"],
    toolParams: { stopName: "인천대 정문", iconType: "bus", iconBg: "#ff7a00" },
    iconType: "bus",
    iconBg: "#ff7a00",
    whenTitle: "지정한 시간",
    whenSubtitle: "오후 05:30\n평일 (월~금)",
    whatTitle: "인천대 정문 정류소 버스 도착 정보",
  },

  // 3. 일상 & 생활
  {
    id: "preset-now-brief",
    category: "time_place",
    title: "오늘의 캠퍼스 브리핑 알림",
    description: "오늘 캠퍼스 날씨와 수업 시간표를 알림으로 받아요.",
    targetTime: "08:00",
    repeatType: "WEEKDAYS",
    targetTools: ["WEATHER", "TIMETABLE"],
    toolParams: {
      iconType: "sun",
      iconBg: "#5c9cf8",
      triggers: [
        {
          id: "trig-now-1",
          type: "TIME",
          title: "평일 (월~금)",
          subtitle: "오전 08:00",
          timeParams: { ampm: "AM", hour: "08", minute: "00", selectedDays: ["MON", "TUE", "WED", "THU", "FRI"], repeatType: "WEEKDAYS" },
        },
      ],
      actions: [
        {
          id: "act-weather-1",
          type: "WEATHER",
          title: "캠퍼스 날씨 알림",
          subtitle: "송도 캠퍼스 오늘 날씨 예보",
          iconBg: "#5c9cf8",
        },
        {
          id: "act-time-1",
          type: "TIMETABLE",
          title: "오늘 강의 시간표 알림",
          subtitle: "오늘 수업 시간표 및 강의실 위치",
          iconBg: "#a855f7",
        },
      ],
    },
    iconType: "sun",
    iconBg: "#5c9cf8",
    whenTitle: "지정한 시간",
    whenSubtitle: "오전 08:00\n평일 (월~금)",
    whatTitle: "캠퍼스 날씨 및 수업 시간표",
  },
  {
    id: "preset-lunch",
    category: "time_place",
    title: "오늘의 학식 식단 알림",
    description: "학생식당과 교내 식당 점심 메뉴를 알림으로 받아요.",
    targetTime: "11:30",
    repeatType: "WEEKDAYS",
    targetTools: ["CAFETERIA"],
    toolParams: { cafeteria: "전체", mealType: "LUNCH", iconType: "cafeteria", iconBg: "#22c55e" },
    iconType: "cafeteria",
    iconBg: "#22c55e",
    whenTitle: "지정한 시간",
    whenSubtitle: "오전 11:30\n평일 (월~금)",
    whatTitle: "학생식당 & 교내 식당 점심 메뉴",
  },
];

export type RoutineMainTab = "my" | "recommend";

export default function MobileAgentReminderSetting() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<RoutineMainTab>("my");
  const [reminders, setReminders] = useState<AgentReminder[]>([]);
  const [dailyBriefSettings, setDailyBriefSettings] = useState<DailyBriefSettings>(getLocalDailyBriefSettings);
  const [isNowBarEnabled, setIsNowBarEnabled] = useState<boolean>(true);
  const [nowBarLeadMinutes, setNowBarLeadMinutes] = useState<number>(15);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const isFirstMountRef = React.useRef(true);

  // 시스템 루틴 모달 열림 상태
  const [isTimetableBriefModalOpen, setIsTimetableBriefModalOpen] = useState(false);
  const [isPreClassModalOpen, setIsPreClassModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // 시스템 루틴 모달 내부 임시 상태
  const [tempBriefAmpm, setTempBriefAmpm] = useState<"AM" | "PM">("AM");
  const [tempBriefHour, setTempBriefHour] = useState("08");
  const [tempBriefMinute, setTempBriefMinute] = useState("00");

  // 수업 시작 전 알림 통합 임시 상태
  const [tempPreClassMinutes, setTempPreClassMinutes] = useState<number>(15);
  const [tempPreClassMethod, setTempPreClassMethod] = useState<"NOW_BAR" | "PUSH">("NOW_BAR");

  const [tempScheduleAmpm, setTempScheduleAmpm] = useState<"AM" | "PM">("AM");
  const [tempScheduleHour, setTempScheduleHour] = useState("08");
  const [tempScheduleMinute, setTempScheduleMinute] = useState("30");
  const [tempScheduleScope, setTempScheduleScope] = useState<ScheduleScope>("ALL");
  const [tempScheduleAdvanceDays, setTempScheduleAdvanceDays] = useState<number>(1);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground && isFirstMountRef.current) {
      setIsInitialLoading(true);
    }
    try {
      const [remindersRes, briefRes, nowBarRes] = await Promise.all([
        getAgentReminders().catch(() => ({ data: [] })),
        getDailyBriefSettings().catch(() => ({ data: null })),
        getTimetableNowBarSettings().catch(() => null),
      ]);

      if (remindersRes?.data) {
        setReminders(remindersRes.data);
      }
      if (briefRes?.data) {
        setDailyBriefSettings(briefRes.data);
      }
      if (nowBarRes) {
        setIsNowBarEnabled(nowBarRes.enabled);
        if (typeof nowBarRes.leadTimeMinutes === "number") {
          setNowBarLeadMinutes(nowBarRes.leadTimeMinutes);
        }
      }
    } catch (error) {
      console.error("루틴 데이터 로드 실패:", error);
    } finally {
      setIsInitialLoading(false);
      isFirstMountRef.current = false;
    }
  }, []);

  const handleBackgroundSync = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // 다중 웹뷰 환경에서 루틴 상세 페이지(편집/삭제/등록) 후 복귀 시 백그라운드 리스트 갱신 (스켈레톤 리셋 방지)
  useRoutineSync(handleBackgroundSync);

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

  // 수업 시작 전 알림 통합 토글
  const isPreClassAlertEnabled = isNowBarEnabled || dailyBriefSettings.timetablePreAlertEnabled;
  const handleTogglePreClass = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isPreClassAlertEnabled;
    if (next) {
      // 켤 때: 실시간 Now Bar 우선 활성화
      setIsNowBarEnabled(true);
      setDailyBriefSettings((prev) => ({ ...prev, timetablePreAlertEnabled: true }));
      try {
        await Promise.all([
          setTimetableNowBarSettings({ enabled: true, leadTimeMinutes: nowBarLeadMinutes }),
          updateDailyBriefSettings({ timetablePreAlertEnabled: true }),
        ]);
        trackEvent("[Daily Brief] 수업 시작 전 알림 토글", { enabled: true });
        notifyRoutineUpdated();
      } catch {
        setIsNowBarEnabled(false);
        setDailyBriefSettings((prev) => ({ ...prev, timetablePreAlertEnabled: false }));
        alert("설정을 변경하지 못했어요.");
      }
    } else {
      // 끌 때: 둘 다 비활성화
      setIsNowBarEnabled(false);
      setDailyBriefSettings((prev) => ({ ...prev, timetablePreAlertEnabled: false }));
      try {
        await Promise.all([
          setTimetableNowBarSettings({ enabled: false, leadTimeMinutes: nowBarLeadMinutes }),
          updateDailyBriefSettings({ timetablePreAlertEnabled: false }),
        ]);
        trackEvent("[Daily Brief] 수업 시작 전 알림 토글", { enabled: false });
        notifyRoutineUpdated();
      } catch {
        setIsNowBarEnabled(true);
        setDailyBriefSettings((prev) => ({ ...prev, timetablePreAlertEnabled: true }));
        alert("설정을 변경하지 못했어요.");
      }
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

  // 1. 오늘 강의 시간표 알림 모달 핸들러
  const handleOpenTimetableBriefModal = () => {
    const [hourStr, minStr] = (dailyBriefSettings.timetableDailyBriefTime || "08:00").split(":");
    const rawHour = parseInt(hourStr || "8", 10);
    const ampm = rawHour >= 12 ? "PM" : "AM";
    let h12 = rawHour % 12;
    if (h12 === 0) h12 = 12;
    setTempBriefAmpm(ampm);
    setTempBriefHour(String(h12).padStart(2, "0"));
    setTempBriefMinute(minStr || "00");
    setIsTimetableBriefModalOpen(true);
  };

  const handleSaveTimetableBriefModal = async () => {
    let rawHour = parseInt(tempBriefHour, 10);
    if (tempBriefAmpm === "PM" && rawHour < 12) rawHour += 12;
    if (tempBriefAmpm === "AM" && rawHour === 12) rawHour = 0;
    const timeStr = `${String(rawHour).padStart(2, "0")}:${tempBriefMinute.padStart(2, "0")}`;

    setDailyBriefSettings((prev) => ({ ...prev, timetableDailyBriefTime: timeStr }));
    setIsTimetableBriefModalOpen(false);
    try {
      await updateDailyBriefSettings({ timetableDailyBriefTime: timeStr });
      trackEvent("[Daily Brief] 오늘 강의 시간표 알림 시간 변경", { time: timeStr });
      notifyRoutineUpdated();
    } catch (e) {
      console.error(e);
      alert("설정을 저장하지 못했어요.");
    }
  };

  // 2. 수업 시작 전 알림 통합 모달 핸들러
  const handleOpenPreClassModal = () => {
    if (isNowBarEnabled) {
      setTempPreClassMethod("NOW_BAR");
      setTempPreClassMinutes(nowBarLeadMinutes || 15);
    } else {
      setTempPreClassMethod("PUSH");
      setTempPreClassMinutes(dailyBriefSettings.timetablePreAlertMinutes ?? 10);
    }
    setIsPreClassModalOpen(true);
  };

  const handleSavePreClassModal = async () => {
    setIsPreClassModalOpen(false);
    try {
      if (tempPreClassMethod === "NOW_BAR") {
        setIsNowBarEnabled(true);
        setNowBarLeadMinutes(tempPreClassMinutes);
        setDailyBriefSettings((prev) => ({
          ...prev,
          timetablePreAlertEnabled: true,
          timetablePreAlertMinutes: tempPreClassMinutes,
        }));
        await Promise.all([
          setTimetableNowBarSettings({ enabled: true, leadTimeMinutes: tempPreClassMinutes }),
          updateDailyBriefSettings({
            timetablePreAlertEnabled: true,
            timetablePreAlertMinutes: tempPreClassMinutes,
          }),
        ]);
      } else {
        setIsNowBarEnabled(false);
        setDailyBriefSettings((prev) => ({
          ...prev,
          timetablePreAlertEnabled: true,
          timetablePreAlertMinutes: tempPreClassMinutes,
        }));
        await Promise.all([
          setTimetableNowBarSettings({ enabled: false, leadTimeMinutes: tempPreClassMinutes }),
          updateDailyBriefSettings({
            timetablePreAlertEnabled: true,
            timetablePreAlertMinutes: tempPreClassMinutes,
          }),
        ]);
      }
      trackEvent("[Daily Brief] 수업 시작 전 알림 설정 변경", {
        method: tempPreClassMethod,
        minutes: tempPreClassMinutes,
      });
      notifyRoutineUpdated();
    } catch (e) {
      console.error(e);
      alert("설정을 저장하지 못했어요.");
    }
  };

  // 4. 주요 학사일정 알림 모달 핸들러
  const handleOpenScheduleModal = () => {
    const [hourStr, minStr] = (dailyBriefSettings.scheduleDailyBriefTime || "08:30").split(":");
    const rawHour = parseInt(hourStr || "8", 10);
    const ampm = rawHour >= 12 ? "PM" : "AM";
    let h12 = rawHour % 12;
    if (h12 === 0) h12 = 12;
    setTempScheduleAmpm(ampm);
    setTempScheduleHour(String(h12).padStart(2, "0"));
    setTempScheduleMinute(minStr || "30");
    setTempScheduleScope(dailyBriefSettings.scheduleScope || "ALL");
    setTempScheduleAdvanceDays(dailyBriefSettings.advanceDays ?? 1);
    setIsScheduleModalOpen(true);
  };

  const handleSaveScheduleModal = async () => {
    let rawHour = parseInt(tempScheduleHour, 10);
    if (tempScheduleAmpm === "PM" && rawHour < 12) rawHour += 12;
    if (tempScheduleAmpm === "AM" && rawHour === 12) rawHour = 0;
    const timeStr = `${String(rawHour).padStart(2, "0")}:${tempScheduleMinute.padStart(2, "0")}`;

    setDailyBriefSettings((prev) => ({
      ...prev,
      scheduleDailyBriefTime: timeStr,
      scheduleScope: tempScheduleScope,
      advanceDays: tempScheduleAdvanceDays,
    }));
    setIsScheduleModalOpen(false);
    try {
      await updateDailyBriefSettings({
        scheduleDailyBriefTime: timeStr,
        scheduleScope: tempScheduleScope,
        advanceDays: tempScheduleAdvanceDays,
      });
      trackEvent("[Daily Brief] 주요 학사일정 알림 설정 변경", {
        time: timeStr,
        scope: tempScheduleScope,
        advanceDays: tempScheduleAdvanceDays,
      });
      notifyRoutineUpdated();
    } catch (e) {
      console.error(e);
      alert("설정을 저장하지 못했어요.");
    }
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

      {activeTab === "my" ? (
        <>
          {/* 1. 시스템 제공 섹션 */}
          <SectionWrapper>
            <SectionTitleRow>
              <SectionTitle>시스템 제공</SectionTitle>
              <CountBadge>3</CountBadge>
            </SectionTitleRow>

            {isInitialLoading ? (
              <GroupCard>
                <GroupRow>
                  <Skeleton variant="text" width="60%" height={22} />
                </GroupRow>
              </GroupCard>
            ) : (
              <GroupCard>
                {/* 1. 오늘 강의 시간표 알림 */}
                <GroupRow onClick={handleOpenTimetableBriefModal}>
                  <Ripple color="rgba(0, 0, 0, 0.05)" />
                  <IconCircle $bgColor="#a855f7">
                    <Calendar size={20} color="#ffffff" />
                  </IconCircle>

                  <TextContentWrapper>
                    <RowMainTitle $disabled={!dailyBriefSettings.timetableDailyBriefEnabled}>
                      오늘 강의 시간표 알림
                    </RowMainTitle>
                    <RowSubTitle>
                      {formatTimeLabel(dailyBriefSettings.timetableDailyBriefTime || "08:00")} 발송
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

                {/* 2. 수업 시작 전 알림 (Now Bar 또는 일반 푸시 통합) */}
                <GroupRow onClick={handleOpenPreClassModal}>
                  <Ripple color="rgba(0, 0, 0, 0.05)" />
                  <IconCircle $bgColor="#0055D4">
                    <Clock size={20} color="#ffffff" />
                  </IconCircle>

                  <TextContentWrapper>
                    <RowMainTitle $disabled={!isPreClassAlertEnabled}>
                      수업 시작 전 알림
                    </RowMainTitle>
                    <RowSubTitle>
                      {isNowBarEnabled
                        ? `수업 시작 ${nowBarLeadMinutes}분 전 • 실시간 카드 (Now Bar)`
                        : dailyBriefSettings.timetablePreAlertEnabled
                        ? `수업 시작 ${dailyBriefSettings.timetablePreAlertMinutes ?? 10}분 전 • 일반 푸시 알림`
                        : `수업 시작 ${nowBarLeadMinutes}분 전 • 실시간 카드 (Now Bar)`}
                    </RowSubTitle>
                  </TextContentWrapper>

                  <RowRightAction data-no-ripple="true" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={isPreClassAlertEnabled}
                      onCheckedChange={() => handleTogglePreClass({ stopPropagation: () => {} } as any)}
                    />
                  </RowRightAction>
                </GroupRow>

                <CardDivider />

                {/* 3. 주요 학사일정 알림 */}
                <GroupRow onClick={handleOpenScheduleModal}>
                  <Ripple color="rgba(0, 0, 0, 0.05)" />
                  <IconCircle $bgColor="#3b82f6">
                    <GraduationCap size={20} color="#ffffff" />
                  </IconCircle>

                  <TextContentWrapper>
                    <RowMainTitle $disabled={!dailyBriefSettings.scheduleAlertEnabled}>
                      주요 학사일정 알림
                    </RowMainTitle>
                    <RowSubTitle>
                      {formatTimeLabel(dailyBriefSettings.scheduleDailyBriefTime || "08:30")} • {getScheduleAdvanceDaysLabel(dailyBriefSettings.advanceDays)}
                    </RowSubTitle>
                  </TextContentWrapper>

                  <RowRightAction data-no-ripple="true" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={dailyBriefSettings.scheduleAlertEnabled}
                      onCheckedChange={() => handleToggleSchedule({ stopPropagation: () => {} } as any)}
                    />
                  </RowRightAction>
                </GroupRow>
              </GroupCard>
            )}
          </SectionWrapper>

          {/* 2. 내 루틴 (맞춤 루틴 목록) */}
          <SectionWrapper>
            <SectionTitleRow>
              <SectionTitle>내 루틴</SectionTitle>
              <CountBadge>{reminders.length}</CountBadge>
            </SectionTitleRow>

            {isInitialLoading ? (
              <GroupCard>
                <GroupRow>
                  <Skeleton variant="text" width="60%" height={22} />
                </GroupRow>
              </GroupCard>
            ) : reminders.length === 0 ? (
              <EmptyRoutineCard onClick={() => setActiveTab("recommend")}>
                <Ripple color="rgba(0, 0, 0, 0.04)" />
                <EmptyRoutineTitle>아직 저장된 맞춤 루틴이 없어요</EmptyRoutineTitle>
                <EmptyRoutineSubTitle>추천 탭에서 유용한 템플릿을 둘러보거나 새 루틴을 만들어 보세요</EmptyRoutineSubTitle>
              </EmptyRoutineCard>
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
                        <Ripple color="rgba(0, 0, 0, 0.05)" />
                        <IconCircle $bgColor={bg}>
                          {renderRoutineIcon(iconId, 20, "#ffffff")}
                        </IconCircle>

                        <TextContentWrapper>
                          <RowMainTitle $disabled={!reminder.enabled}>
                            {reminder.title}
                          </RowMainTitle>
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
        </>
      ) : (
        <>
          {/* 1. 이동할 때 유용한 섹션 */}
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

          {/* 2. 특정 시간이나 장소에서 유용한 섹션 */}
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

          {/* 3. 수업 및 캠퍼스 생활 섹션 */}
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
                    onClick={() => {
                      if (preset.id === "preset-timetable-brief") {
                        handleOpenTimetableBriefModal();
                      } else if (preset.id === "preset-timetable-pre" || preset.id === "preset-timetable-nowbar") {
                        handleOpenPreClassModal();
                      } else if (preset.id === "preset-schedule") {
                        handleOpenScheduleModal();
                      } else {
                        navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL(preset.id));
                      }
                    }}
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
        </>
      )}

      {/* 플로팅 바텀 네비게이션 바 (Material 3 Style) */}
      <FloatingNavPill role="tablist" aria-label="루틴 네비게이션">
        <NavTabButton
          $active={activeTab === "my"}
          onClick={() => setActiveTab("my")}
          type="button"
          role="tab"
          aria-selected={activeTab === "my"}
          aria-label="내 루틴 탭"
        >
          <Ripple color={activeTab === "my" ? "rgba(37, 99, 235, 0.15)" : "rgba(0, 0, 0, 0.08)"} />
          <SlidersHorizontal size={17} strokeWidth={activeTab === "my" ? 2.5 : 2} />
          <span>내 루틴</span>
        </NavTabButton>

        <NavTabButton
          $active={activeTab === "recommend"}
          onClick={() => setActiveTab("recommend")}
          type="button"
          role="tab"
          aria-selected={activeTab === "recommend"}
          aria-label="추천 탭"
        >
          <Ripple color={activeTab === "recommend" ? "rgba(37, 99, 235, 0.15)" : "rgba(0, 0, 0, 0.08)"} />
          <Sparkles size={17} strokeWidth={activeTab === "recommend" ? 2.5 : 2} />
          <span>추천</span>
        </NavTabButton>
      </FloatingNavPill>

      {/* =========================================================================
       * 시스템 제공 알림 전용 설정 모달 4종
       * ========================================================================= */}

      {/* 1. 오늘 강의 시간표 알림 시간 모달 */}
      <Modal
        isOpen={isTimetableBriefModalOpen}
        onClose={() => setIsTimetableBriefModalOpen(false)}
        title="오늘 강의 시간표 알림 시간"
        description="매일 아침 시간표 및 강의실 브리핑을 받을 시간을 설정해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsTimetableBriefModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveTimetableBriefModal,
        }}
      >
        <TimePickerModalContent>
          <PickerRow>
            <AmPmToggle>
              <AmPmButton
                $active={tempBriefAmpm === "AM"}
                onClick={() => setTempBriefAmpm("AM")}
                type="button"
              >
                <Ripple color={tempBriefAmpm === "AM" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.08)"} />
                오전
              </AmPmButton>
              <AmPmButton
                $active={tempBriefAmpm === "PM"}
                onClick={() => setTempBriefAmpm("PM")}
                type="button"
              >
                <Ripple color={tempBriefAmpm === "PM" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.08)"} />
                오후
              </AmPmButton>
            </AmPmToggle>

            <TimeInputGroup>
              <TimeSelect
                value={tempBriefHour}
                onChange={(e) => setTempBriefHour(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const h = String(i + 1).padStart(2, "0");
                  return (
                    <option key={h} value={h}>
                      {h}시
                    </option>
                  );
                })}
              </TimeSelect>
              <TimeColon>:</TimeColon>
              <TimeSelect
                value={tempBriefMinute}
                onChange={(e) => setTempBriefMinute(e.target.value)}
              >
                {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
                  (m) => (
                    <option key={m} value={m}>
                      {m}분
                    </option>
                  ),
                )}
              </TimeSelect>
            </TimeInputGroup>
          </PickerRow>

          <ModalNoticeTip>
            💡 평일(월~금) 중 강의가 있는 날에만 설정한 시간에 발송돼요.
          </ModalNoticeTip>
        </TimePickerModalContent>
      </Modal>

      {/* 2. 수업 시작 전 알림 모달 (Now Bar vs 일반 푸시 선택) */}
      <Modal
        isOpen={isPreClassModalOpen}
        onClose={() => setIsPreClassModalOpen(false)}
        title="수업 시작 전 알림 설정"
        description="수업 시작 전 안내 시점과 알림 표시 방식을 선택해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsPreClassModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSavePreClassModal,
        }}
      >
        <ModalFormSection>
          <ModalSectionLabel>알림 수신 시점</ModalSectionLabel>
          <ModalGroupScrollContainer style={{ maxHeight: "180px" }}>
            <ModalGroupCard>
              {PRE_ALERT_OPTIONS.map((opt, idx) => (
                <React.Fragment key={opt.value}>
                  {idx > 0 && <ModalDivider style={{ marginLeft: "18px" }} />}
                  <ModalGroupRow
                    $selected={tempPreClassMinutes === opt.value}
                    onClick={() => setTempPreClassMinutes(opt.value)}
                  >
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <ModalOptionText $selected={tempPreClassMinutes === opt.value}>
                      {opt.label}
                    </ModalOptionText>
                    {tempPreClassMinutes === opt.value && <Check size={18} color="#2563eb" strokeWidth={3} />}
                  </ModalGroupRow>
                </React.Fragment>
              ))}
            </ModalGroupCard>
          </ModalGroupScrollContainer>

          <ModalSectionLabel style={{ marginTop: "14px" }}>알림 표시 방식</ModalSectionLabel>
          <MethodSelectionContainer>
            <MethodCard
              $selected={tempPreClassMethod === "NOW_BAR"}
              onClick={() => setTempPreClassMethod("NOW_BAR")}
            >
              <Ripple color="rgba(37, 99, 235, 0.08)" />
              <MethodCardHeader>
                <MethodRadioDot $selected={tempPreClassMethod === "NOW_BAR"}>
                  {tempPreClassMethod === "NOW_BAR" && <InnerRadioCircle />}
                </MethodRadioDot>
                <MethodTitleWrapper>
                  <MethodTitle $selected={tempPreClassMethod === "NOW_BAR"}>
                    실시간 카드 (Now Bar)
                  </MethodTitle>
                  <RecommendTag>권장</RecommendTag>
                </MethodTitleWrapper>
              </MethodCardHeader>
              <MethodDescription>
                수업 전부터 종료 시까지 잠금화면과 상단바에 강의실 위치와 실시간 카운트다운을 표시해요.
              </MethodDescription>
            </MethodCard>

            <MethodCard
              $selected={tempPreClassMethod === "PUSH"}
              onClick={() => setTempPreClassMethod("PUSH")}
            >
              <Ripple color="rgba(37, 99, 235, 0.08)" />
              <MethodCardHeader>
                <MethodRadioDot $selected={tempPreClassMethod === "PUSH"}>
                  {tempPreClassMethod === "PUSH" && <InnerRadioCircle />}
                </MethodRadioDot>
                <MethodTitleWrapper>
                  <MethodTitle $selected={tempPreClassMethod === "PUSH"}>
                    일반 푸시 알림
                  </MethodTitle>
                </MethodTitleWrapper>
              </MethodCardHeader>
              <MethodDescription>
                수업 시작 전 스마트폰 상단 알림창에 1회성 텍스트 알림으로 확인해요.
              </MethodDescription>
            </MethodCard>
          </MethodSelectionContainer>
        </ModalFormSection>
      </Modal>

      {/* 4. 주요 학사일정 알림 모달 */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="주요 학사일정 알림 설정"
        description="학사일정을 수신할 시간과 사전 안내 기준을 설정해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsScheduleModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveScheduleModal,
        }}
      >
        <ModalFormSection>
          <ModalSectionLabel>알림 수신 시간</ModalSectionLabel>
          <TimePickerModalContent style={{ padding: "0 0 10px 0" }}>
            <PickerRow>
              <AmPmToggle>
                <AmPmButton
                  $active={tempScheduleAmpm === "AM"}
                  onClick={() => setTempScheduleAmpm("AM")}
                  type="button"
                >
                  <Ripple color={tempScheduleAmpm === "AM" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.08)"} />
                  오전
                </AmPmButton>
                <AmPmButton
                  $active={tempScheduleAmpm === "PM"}
                  onClick={() => setTempScheduleAmpm("PM")}
                  type="button"
                >
                  <Ripple color={tempScheduleAmpm === "PM" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.08)"} />
                  오후
                </AmPmButton>
              </AmPmToggle>

              <TimeInputGroup>
                <TimeSelect
                  value={tempScheduleHour}
                  onChange={(e) => setTempScheduleHour(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const h = String(i + 1).padStart(2, "0");
                    return (
                      <option key={h} value={h}>
                        {h}시
                      </option>
                    );
                  })}
                </TimeSelect>
                <TimeColon>:</TimeColon>
                <TimeSelect
                  value={tempScheduleMinute}
                  onChange={(e) => setTempScheduleMinute(e.target.value)}
                >
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
                    (m) => (
                      <option key={m} value={m}>
                        {m}분
                      </option>
                    ),
                  )}
                </TimeSelect>
              </TimeInputGroup>
            </PickerRow>
          </TimePickerModalContent>

          <ModalSectionLabel style={{ marginTop: "12px" }}>안내 대상 범위</ModalSectionLabel>
          <InlineSelect
            value={tempScheduleScope}
            onChange={(e) => setTempScheduleScope(e.target.value as any)}
          >
            {SCHEDULE_SCOPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </InlineSelect>

          <ModalSectionLabel style={{ marginTop: "16px" }}>사전 안내 기준</ModalSectionLabel>
          <ModalGroupScrollContainer>
            <ModalGroupCard>
              {ADVANCE_DAYS_OPTIONS.map((opt, idx) => (
                <React.Fragment key={opt.value}>
                  {idx > 0 && <ModalDivider style={{ marginLeft: "18px" }} />}
                  <ModalGroupRow
                    $selected={tempScheduleAdvanceDays === opt.value}
                    onClick={() => setTempScheduleAdvanceDays(opt.value)}
                  >
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <ModalOptionText $selected={tempScheduleAdvanceDays === opt.value}>
                      {opt.label}
                    </ModalOptionText>
                    {tempScheduleAdvanceDays === opt.value && <Check size={18} color="#2563eb" strokeWidth={3} />}
                  </ModalGroupRow>
                </React.Fragment>
              ))}
            </ModalGroupCard>
          </ModalGroupScrollContainer>
        </ModalFormSection>
      </Modal>
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

const EmptyRoutineCard = styled.div`
  position: relative;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 22px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  border: 1px dashed #cbd5e1;
  cursor: pointer;
`;

const EmptyRoutineTitle = styled.div`
  font-size: 14.5px;
  font-weight: 700;
  color: #475569;
`;

const EmptyRoutineSubTitle = styled.div`
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.4;
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

const FloatingNavPill = styled.nav`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.04);
  border-radius: 9999px;
  padding: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 100;
`;

const NavTabButton = styled.button<{ $active: boolean }>`
  position: relative;
  overflow: hidden;
  border: none;
  background: ${({ $active }) => ($active ? "#eff6ff" : "transparent")};
  color: ${({ $active }) => ($active ? "#1d4ed8" : "#64748b")};
  padding: 9px 20px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  &:active {
    transform: scale(0.97);
  }

  span, svg {
    position: relative;
    z-index: 1;
  }
`;

const TimePickerModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
`;

const PickerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const AmPmToggle = styled.div`
  display: flex;
  background-color: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  gap: 2px;
`;

const AmPmButton = styled.button<{ $active: boolean }>`
  position: relative;
  overflow: hidden;
  border: none;
  background-color: ${({ $active }) => ($active ? "#2563eb" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#64748b")};
  font-size: 14px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
`;

const TimeInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TimeSelect = styled.select`
  appearance: none;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #2563eb;
  }
`;

const TimeColon = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #64748b;
`;

const ModalGroupScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding: 2px 0;
`;

const ModalGroupCard = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #edf0f5;
  overflow: hidden;
`;

const ModalGroupRow = styled.div<{ $selected?: boolean }>`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  cursor: pointer;
  background-color: ${({ $selected }) => ($selected ? "#eff6ff" : "transparent")};
  transition: background-color 0.15s;
`;

const ModalOptionText = styled.span<{ $selected?: boolean }>`
  font-size: 15px;
  font-weight: ${({ $selected }) => ($selected ? 700 : 500)};
  color: ${({ $selected }) => ($selected ? "#2563eb" : "#1e293b")};
`;

const ModalDivider = styled.div`
  height: 1px;
  background-color: #f1f5f9;
`;

const ModalFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
`;

const ModalSectionLabel = styled.label`
  font-size: 13.5px;
  font-weight: 700;
  color: #475569;
`;

const InlineSelect = styled.select`
  appearance: none;
  width: 100%;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14.5px;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #2563eb;
  }
`;

const ModalNoticeTip = styled.div`
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.45;
  background-color: #f8fafc;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #edf0f5;
`;

const MethodSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MethodCard = styled.div<{ $selected: boolean }>`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 16px;
  background-color: ${({ $selected }) => ($selected ? "#eff6ff" : "#f8fafc")};
  border: 1.5px solid ${({ $selected }) => ($selected ? "#2563eb" : "#e2e8f0")};
  cursor: pointer;
  transition: all 0.15s ease;
`;

const MethodCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MethodRadioDot = styled.div<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? "#2563eb" : "#94a3b8")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InnerRadioCircle = styled.div`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: #2563eb;
`;

const MethodTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MethodTitle = styled.div<{ $selected: boolean }>`
  font-size: 14.5px;
  font-weight: 700;
  color: ${({ $selected }) => ($selected ? "#1e40af" : "#1e293b")};
`;

const RecommendTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  background-color: #dbeafe;
  padding: 1px 6px;
  border-radius: 6px;
`;

const MethodDescription = styled.div`
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.45;
  padding-left: 28px;
`;
