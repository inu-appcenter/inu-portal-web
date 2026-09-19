import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import CapsuleButton from "@/components/common/CapsuleButton";
import Modal from "@/components/common/Modal";
import Switch from "@/components/common/Switch";
import {
  Sun,
  Bus,
  Utensils,
  Calendar,
  Bell,
  Pencil,
  Send,
  Trash2,
  Clock,
  Download,
  Plus,
  Minus,
  X,
  Sparkles,
  Coffee,
  BookOpen,
  Flame,
  Heart,
  Moon,
  GraduationCap,
  Lightbulb,
  Smile,
  Shield,
  Palette,
  Check,
  Building2,
} from "lucide-react";
import {
  getAgentReminders,
  toggleAgentReminder,
  deleteAgentReminder,
  testAgentReminder,
  createAgentReminder,
  updateAgentReminder,
} from "@/apis/agentReminder";
import {
  getDailyBriefSettings,
  updateDailyBriefSettings,
  getLocalDailyBriefSettings,
} from "@/apis/dailyBrief";
import {
  getKeywords,
  createKeyword,
  deleteKeyword,
  getKeywordsNotice,
  subscribeKeywordsNotice,
  subscribeDepartment,
} from "@/apis/notices";
import { getSchoolNoticeCategories } from "@/apis/categories";
import type { AgentReminder, AgentReminderRepeatType, RoutineScheduleItem } from "@/types/agentReminder";
import type { DailyBriefSettings, ScheduleScope } from "@/types/dailyBrief";
import type { Keyword } from "@/types/notices";
import Skeleton from "@/components/common/Skeleton";
import { trackEvent } from "@/utils/mixpanel";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import Ripple from "@/components/common/Ripple";

export interface RoutineTimeCondition {
  id: string;
  ampm: "AM" | "PM";
  targetHour: string;
  targetMinute: string;
  selectedDays: string[];
  repeatType: AgentReminderRepeatType;
}

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

export const AVAILABLE_ACTIONS = [
  {
    id: "WEATHER",
    title: "캠퍼스 날씨",
    description: "송도 캠퍼스 기온 및 강수 정보 알림을 받아요",
    icon: <Sun size={24} color="#5c9cf8" />,
    iconBg: "#5c9cf8",
  },
  {
    id: "BUS",
    title: "실시간 버스",
    description: "지정한 정류소 실시간 버스 도착 알림을 받아요",
    icon: <Bus size={24} color="#ff7a00" />,
    iconBg: "#ff7a00",
  },
  {
    id: "CAFETERIA",
    title: "학식 식단",
    description: "선택한 식당의 당일 식사 메뉴 알림을 받아요",
    icon: <Utensils size={24} color="#22c55e" />,
    iconBg: "#22c55e",
  },
  {
    id: "TIMETABLE",
    title: "시간표 / 강의실",
    description: "오늘 첫 수업 시간과 강의실 위치 알림을 받아요",
    icon: <Calendar size={24} color="#a855f7" />,
    iconBg: "#a855f7",
  },
  {
    id: "NOTICE",
    title: "새 공지사항",
    description: "학교 및 학과 최신 주요 공지 알림을 받아요",
    icon: <Bell size={24} color="#3b82f6" />,
    iconBg: "#3b82f6",
  },
];

export const ROUTINE_ICONS = [
  { id: "sparkles", label: "브리핑/AI" },
  { id: "sun", label: "날씨/아침" },
  { id: "bus", label: "버스/이동" },
  { id: "cafeteria", label: "학식/식사" },
  { id: "timetable", label: "시간표/강의" },
  { id: "notice", label: "공지/소식" },
  { id: "coffee", label: "카페/휴식" },
  { id: "book", label: "도서관/공부" },
  { id: "flame", label: "열정/운동" },
  { id: "heart", label: "일상/건강" },
  { id: "moon", label: "저녁/취침" },
  { id: "clock", label: "시간/마감" },
  { id: "graduation", label: "학교/과제" },
  { id: "lightbulb", label: "아이디어/팁" },
  { id: "smile", label: "응원/횃불이" },
  { id: "shield", label: "보안/출석" },
];

export const ROUTINE_COLORS = [
  { id: "blue", hex: "#5c9cf8", label: "블루" },
  { id: "orange", hex: "#ff7a00", label: "오렌지" },
  { id: "green", hex: "#22c55e", label: "그린" },
  { id: "purple", hex: "#a855f7", label: "퍼플" },
  { id: "red", hex: "#ef4444", label: "레드" },
  { id: "amber", hex: "#f59e0b", label: "앰버" },
  { id: "indigo", hex: "#6366f1", label: "인디고" },
  { id: "pink", hex: "#ec4899", label: "핑크" },
  { id: "cyan", hex: "#06b6d4", label: "시안" },
  { id: "slate", hex: "#475569", label: "슬레이트" },
];

export const renderRoutineIcon = (iconId?: string, size = 28, color = "#ffffff") => {
  switch (iconId) {
    case "sun":
      return <Sun size={size} color={color} />;
    case "bus":
      return <Bus size={size} color={color} />;
    case "cafeteria":
      return <Utensils size={size} color={color} />;
    case "timetable":
      return <Calendar size={size} color={color} />;
    case "notice":
      return <Bell size={size} color={color} />;
    case "sparkles":
      return <Sparkles size={size} color={color} />;
    case "coffee":
      return <Coffee size={size} color={color} />;
    case "book":
      return <BookOpen size={size} color={color} />;
    case "flame":
      return <Flame size={size} color={color} />;
    case "heart":
      return <Heart size={size} color={color} />;
    case "moon":
      return <Moon size={size} color={color} />;
    case "clock":
      return <Clock size={size} color={color} />;
    case "graduation":
      return <GraduationCap size={size} color={color} />;
    case "lightbulb":
      return <Lightbulb size={size} color={color} />;
    case "smile":
      return <Smile size={size} color={color} />;
    case "shield":
      return <Shield size={size} color={color} />;
    default:
      return <Sparkles size={size} color={color} />;
  }
};

export const getDefaultIconAndBgForTools = (toolsStr?: string) => {
  if (!toolsStr) return { iconId: "sparkles", bg: "#5c9cf8" };
  const upper = toolsStr.toUpperCase();
  if (upper.includes("BUS")) return { iconId: "bus", bg: "#ff7a00" };
  if (upper.includes("CAFETERIA")) return { iconId: "cafeteria", bg: "#22c55e" };
  if (upper.includes("TIMETABLE")) return { iconId: "timetable", bg: "#a855f7" };
  if (upper.includes("NOTICE")) return { iconId: "notice", bg: "#3b82f6" };
  if (upper.includes("WEATHER")) return { iconId: "sun", bg: "#5c9cf8" };
  return { iconId: "sparkles", bg: "#5c9cf8" };
};

const CAFETERIA_OPTIONS = [
  { label: "전체 식당", value: "전체" },
  { label: "학생식당", value: "학생식당" },
  { label: "제1기숙사식당", value: "제1기숙사식당" },
  { label: "2기숙사 식당", value: "2기숙사 식당" },
  { label: "27호관식당", value: "27호관식당" },
  { label: "2호관(교직원)식당", value: "2호관(교직원)식당" },
  { label: "사범대식당", value: "사범대식당" },
];

const BUS_STOP_OPTIONS = [
  { label: "인천대입구역 1번출구 (인입런)", value: "인천대입구역 1번출구" },
  { label: "인천대입구역 2번출구", value: "인천대입구역 2번출구" },
  { label: "인천대학교 정문", value: "인천대 정문" },
  { label: "공과대학 (정문 방향)", value: "공과대학" },
  { label: "자연과학대학", value: "자연과학대학" },
  { label: "기숙사 (식당 앞)", value: "기숙사" },
];

const PRE_ALERT_OPTIONS = [
  { label: "5분 전", value: 5 },
  { label: "10분 전", value: 10 },
  { label: "15분 전", value: 15 },
  { label: "20분 전", value: 20 },
  { label: "30분 전", value: 30 },
  { label: "45분 전", value: 45 },
  { label: "60분 전 (1시간 전)", value: 60 },
];

const ADVANCE_DAYS_OPTIONS = [
  { label: "당일 알림", value: 0 },
  { label: "1일 전 사전 알림", value: 1 },
  { label: "3일 전 사전 알림", value: 3 },
  { label: "7일 전 (1주일 전) 사전 알림", value: 7 },
];

const SCHEDULE_SCOPE_OPTIONS = [
  { label: "학교 및 학과 전체 학사일정", value: "ALL" as ScheduleScope },
  { label: "학교 학사일정만", value: "SCHOOL_ONLY" as ScheduleScope },
  { label: "내 학과 학사일정만", value: "DEPT_ONLY" as ScheduleScope },
];

const BRIEF_TIME_OPTIONS = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "12:00",
  "13:00",
  "18:00",
  "20:00",
  "22:00",
];

const DAYS = [
  { key: "SUN", label: "일" },
  { key: "MON", label: "월" },
  { key: "TUE", label: "화" },
  { key: "WED", label: "수" },
  { key: "THU", label: "목" },
  { key: "FRI", label: "금" },
  { key: "SAT", label: "토" },
];

export const formatDaysSummary = (days: string[]) => {
  if (days.length === 7) return "매일";
  if (days.length === 5 && ["MON", "TUE", "WED", "THU", "FRI"].every((d) => days.includes(d))) {
    return "평일 (월~금)";
  }
  if (days.length === 2 && ["SUN", "SAT"].every((d) => days.includes(d))) {
    return "주말 (토, 일)";
  }
  const order = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const labels: Record<string, string> = {
    SUN: "일요일",
    MON: "월요일",
    TUE: "화요일",
    WED: "수요일",
    THU: "목요일",
    FRI: "금요일",
    SAT: "토요일",
  };
  return order
    .filter((d) => days.includes(d))
    .map((d) => labels[d])
    .join(", ");
};

export default function MobileRoutineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userInfo } = useUserStore();

  const isNew = id === "new";
  const isSystemRoutine = Boolean(id?.startsWith("system-"));
  const isPreset = useMemo(() => {
    return Boolean(
      !isSystemRoutine &&
        (id?.startsWith("preset-") || (id && isNaN(Number(id)) && id !== "new")),
    );
  }, [id, isSystemRoutine]);

  // System routine sub-type
  const systemType = useMemo<"timetable" | "schedule" | "school-notice" | "dept-notice" | null>(() => {
    if (id === "system-timetable") return "timetable";
    if (id === "system-schedule") return "schedule";
    if (id === "system-school-notice") return "school-notice";
    if (id === "system-dept-notice") return "dept-notice";
    return null;
  }, [id]);

  const [reminder, setReminder] = useState<AgentReminder | null>(null);
  const [preset, setPreset] = useState<RoutinePreset | null>(null);
  const [dailyBriefSettings, setDailyBriefSettings] = useState<DailyBriefSettings>(getLocalDailyBriefSettings);
  
  // Notice & Categories states
  const [schoolCategories, setSchoolCategories] = useState<string[]>([]);
  const [subscribedSchoolCategories, setSubscribedSchoolCategories] = useState<string[]>([]);
  const [schoolKeywords, setSchoolKeywords] = useState<Keyword[]>([]);
  const [deptKeywords, setDeptKeywords] = useState<Keyword[]>([]);
  const [isSchoolNoticeEnabled, setIsSchoolNoticeEnabled] = useState(true);
  const [isDeptAllNoticeEnabled, setIsDeptAllNoticeEnabled] = useState(true);

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState(false);

  // Icon & Theme Color modal
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("sparkles");
  const [selectedColor, setSelectedColor] = useState<string>("#5c9cf8");
  const [tempIcon, setTempIcon] = useState<string>("sparkles");
  const [tempColor, setTempColor] = useState<string>("#5c9cf8");

  // Condition Modal
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [editingConditionId, setEditingConditionId] = useState<string | "new" | null>(null);
  const [modalAmpm, setModalAmpm] = useState<"AM" | "PM">("AM");
  const [modalHour, setModalHour] = useState("08");
  const [modalMinute, setModalMinute] = useState("30");
  const [modalSelectedDays, setModalSelectedDays] = useState<string[]>(["MON"]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Keyword Add Modal
  const [isAddKeywordModalOpen, setIsAddKeywordModalOpen] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [isKeywordExcluded, setIsKeywordExcluded] = useState(false);
  const [keywordFilterTab, setKeywordFilterTab] = useState<"include" | "exclude">("include");

  // Form states (for custom routines)
  const [title, setTitle] = useState("");
  const [timeConditions, setTimeConditions] = useState<RoutineTimeCondition[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedCafeteria, setSelectedCafeteria] = useState("전체");
  const [selectedMealType, setSelectedMealType] = useState("AUTO");
  const [selectedBusStop, setSelectedBusStop] = useState("인천대입구역 1번출구");

  // System Routine Form States (in edit mode)
  const [sysTimetableDailyBrief, setSysTimetableDailyBrief] = useState(true);
  const [sysTimetableTime, setSysTimetableTime] = useState("08:00");
  const [sysTimetablePreAlertEnabled, setSysTimetablePreAlertEnabled] = useState(true);
  const [sysTimetablePreAlert, setSysTimetablePreAlert] = useState(10);

  const [sysScheduleTime, setSysScheduleTime] = useState("08:30");
  const [sysScheduleAdvanceDays, setSysScheduleAdvanceDays] = useState(1);
  const [sysScheduleScope, setSysScheduleScope] = useState<ScheduleScope>("ALL");

  const syncFormFromData = useCallback(
    (rem: AgentReminder | null, pre: RoutinePreset | null) => {
      if (rem) {
        setTitle(rem.title);

        let customIconVal = "";
        let customColorVal = "";
        if (rem.toolParamsJson) {
          try {
            const parsed = JSON.parse(rem.toolParamsJson);
            if (parsed.iconType) customIconVal = parsed.iconType;
            if (parsed.iconBg) customColorVal = parsed.iconBg;
            if (parsed.cafeteria) setSelectedCafeteria(parsed.cafeteria);
            if (parsed.mealType) setSelectedMealType(parsed.mealType);
            if (parsed.stopName) setSelectedBusStop(parsed.stopName);
          } catch (ignored) {}
        }

        const fallback = getDefaultIconAndBgForTools(rem.targetTool);
        setSelectedIcon(customIconVal || fallback.iconId);
        setSelectedColor(customColorVal || fallback.bg);

        if (rem.schedulesJson) {
          try {
            const parsedSchedules: RoutineScheduleItem[] = JSON.parse(rem.schedulesJson);
            if (Array.isArray(parsedSchedules) && parsedSchedules.length > 0) {
              const conds: RoutineTimeCondition[] = parsedSchedules.map((item, idx) => {
                const parts = (item.time || "08:30").split(":");
                const rawHour = parseInt(parts[0] || "8", 10);
                const rawMin = parts[1] || "30";

                let ampmVal: "AM" | "PM" = "AM";
                let hourVal = "08";
                if (rawHour >= 12) {
                  ampmVal = "PM";
                  hourVal = String(rawHour === 12 ? 12 : rawHour - 12).padStart(2, "0");
                } else {
                  ampmVal = "AM";
                  hourVal = String(rawHour === 0 ? 12 : rawHour).padStart(2, "0");
                }

                let days = item.days || ["MON", "TUE", "WED", "THU", "FRI"];
                let rep = item.repeatType || "WEEKDAYS";
                if (days.length === 7) rep = "EVERYDAY";
                else if (days.length === 2 && ["SUN", "SAT"].every((d) => days.includes(d))) rep = "WEEKENDS";

                return {
                  id: `time-${idx + 1}`,
                  ampm: ampmVal,
                  targetHour: hourVal,
                  targetMinute: rawMin,
                  selectedDays: days,
                  repeatType: rep,
                };
              });
              setTimeConditions(conds);
            }
          } catch (ignored) {}
        } else {
          const parts = (rem.targetTime || "08:30").split(":");
          const rawHour = parseInt(parts[0] || "8", 10);
          const rawMin = parts[1] || "30";

          let ampmVal: "AM" | "PM" = "AM";
          let hourVal = "08";
          if (rawHour >= 12) {
            ampmVal = "PM";
            hourVal = String(rawHour === 12 ? 12 : rawHour - 12).padStart(2, "0");
          } else {
            ampmVal = "AM";
            hourVal = String(rawHour === 0 ? 12 : rawHour).padStart(2, "0");
          }

          let days = ["MON", "TUE", "WED", "THU", "FRI"];
          if (rem.repeatType === "WEEKDAYS") {
            days = ["MON", "TUE", "WED", "THU", "FRI"];
          } else if (rem.repeatType === "EVERYDAY") {
            days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
          } else if (rem.repeatType === "WEEKENDS") {
            days = ["SUN", "SAT"];
          }

          setTimeConditions([
            {
              id: "time-1",
              ampm: ampmVal,
              targetHour: hourVal,
              targetMinute: rawMin,
              selectedDays: days,
              repeatType: rem.repeatType || "WEEKDAYS",
            },
          ]);
        }

        const tools = (rem.targetTool || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setSelectedTools(tools);
      } else if (pre) {
        setTitle(pre.title);
        setSelectedIcon(pre.iconType || "sun");
        setSelectedColor(pre.iconBg || "#5c9cf8");

        const parts = (pre.targetTime || "08:30").split(":");
        const rawHour = parseInt(parts[0] || "8", 10);
        const rawMin = parts[1] || "30";

        let ampmVal: "AM" | "PM" = "AM";
        let hourVal = "08";
        if (rawHour >= 12) {
          ampmVal = "PM";
          hourVal = String(rawHour === 12 ? 12 : rawHour - 12).padStart(2, "0");
        } else {
          ampmVal = "AM";
          hourVal = String(rawHour === 0 ? 12 : rawHour).padStart(2, "0");
        }

        let days = ["MON", "TUE", "WED", "THU", "FRI"];
        if (pre.repeatType === "WEEKDAYS") {
          days = ["MON", "TUE", "WED", "THU", "FRI"];
        } else if (pre.repeatType === "EVERYDAY") {
          days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        }

        setTimeConditions([
          {
            id: "time-1",
            ampm: ampmVal,
            targetHour: hourVal,
            targetMinute: rawMin,
            selectedDays: days,
            repeatType: pre.repeatType || "WEEKDAYS",
          },
        ]);

        setSelectedTools(pre.targetTools || ["WEATHER"]);

        if (pre.toolParams) {
          if (pre.toolParams.cafeteria) setSelectedCafeteria(pre.toolParams.cafeteria);
          if (pre.toolParams.mealType) setSelectedMealType(pre.toolParams.mealType);
          if (pre.toolParams.stopName) setSelectedBusStop(pre.toolParams.stopName);
        }
      } else {
        // [나만의 루틴 만들기]
        setTitle("");
        setTimeConditions([]);
        setSelectedTools([]);
        setSelectedIcon("sparkles");
        setSelectedColor("#5c9cf8");
        setSelectedCafeteria("전체");
        setSelectedMealType("AUTO");
        setSelectedBusStop("인천대입구역 1번출구");
      }
    },
    [],
  );

  const loadData = useCallback(async () => {
    if (isNew) {
      syncFormFromData(null, null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      if (isSystemRoutine) {
        const [briefRes, keywordsRes, noticeCatRes, subCatRes] = await Promise.all([
          getDailyBriefSettings().catch(() => ({ data: null })),
          getKeywords().catch(() => ({ data: [] })),
          getSchoolNoticeCategories().catch(() => ({ data: [] })),
          getKeywordsNotice().catch(() => ({ data: [] })),
        ]);

        const curSettings = briefRes?.data || getLocalDailyBriefSettings();
        setDailyBriefSettings(curSettings);
        setSysTimetableDailyBrief(curSettings.timetableDailyBriefEnabled ?? true);
        setSysTimetableTime(curSettings.timetableDailyBriefTime || "08:00");
        setSysTimetablePreAlertEnabled(curSettings.timetablePreAlertEnabled ?? true);
        setSysTimetablePreAlert(curSettings.timetablePreAlertMinutes || 10);
        setSysScheduleTime(curSettings.scheduleDailyBriefTime || "08:30");
        setSysScheduleAdvanceDays(curSettings.advanceDays ?? 1);
        setSysScheduleScope(curSettings.scheduleScope || "ALL");

        if (noticeCatRes?.data) {
          setSchoolCategories(noticeCatRes.data);
        }
        if (subCatRes?.data) {
          setSubscribedSchoolCategories(subCatRes.data.map((k) => k.category || ""));
        }

        if (keywordsRes?.data) {
          const schoolKeys = keywordsRes.data.filter((k) => k.type === "SCHOOL_NOTICE" && k.keyword !== null);
          const deptKeys = keywordsRes.data.filter((k) => k.type === "DEPARTMENT" && k.keyword !== null);
          setSchoolKeywords(schoolKeys);
          setDeptKeywords(deptKeys);
          const hasDeptAll = keywordsRes.data.some((k) => k.type === "DEPARTMENT" && k.keyword === null);
          setIsDeptAllNoticeEnabled(hasDeptAll || true);
        }

        if (systemType === "timetable") {
          setSelectedIcon("timetable");
          setSelectedColor("#a855f7");
          setTitle("오늘의 강의 & 시간표 알림");
        } else if (systemType === "schedule") {
          setSelectedIcon("graduation");
          setSelectedColor("#3b82f6");
          setTitle("학사일정 알림");
        } else if (systemType === "school-notice") {
          setSelectedIcon("notice");
          setSelectedColor("#5c9cf8");
          setTitle("학교 공지 알림");
        } else if (systemType === "dept-notice") {
          setSelectedIcon("notice");
          setSelectedColor("#ff7a00");
          setTitle("학과 공지 알림");
        }
      } else if (isPreset) {
        const found = ROUTINE_PRESETS.find((p) => p.id === id);
        if (found) {
          setPreset(found);
          syncFormFromData(null, found);
        }
      } else {
        const numId = Number(id);
        const res = await getAgentReminders();
        if (res.data) {
          const found = res.data.find((r) => r.id === numId);
          if (found) {
            setReminder(found);
            syncFormFromData(found, null);
          }
        }
      }
    } catch (error) {
      console.error("루틴 정보 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, isNew, isPreset, isSystemRoutine, systemType, syncFormFromData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const headerTitle = useMemo(() => {
    if (isNew) return "새 루틴 만들기";
    if (isEditing) return isSystemRoutine ? "시스템 루틴 설정" : "루틴 편집";
    return isSystemRoutine ? "기본 루틴" : "루틴 설정";
  }, [isNew, isEditing, isSystemRoutine]);

  useHeader({
    title: headerTitle,
    hasback: true,
    rightArea: null,
  });

  // System routine On/Off Toggles
  const handleToggleTimetable = async () => {
    const next = !dailyBriefSettings.timetableAlertEnabled;
    setDailyBriefSettings((prev) => ({ ...prev, timetableAlertEnabled: next }));
    try {
      await updateDailyBriefSettings({ timetableAlertEnabled: next });
      trackEvent("[Daily Brief] 시스템 시간표 알림 토글", { enabled: next });
    } catch {
      setDailyBriefSettings((prev) => ({ ...prev, timetableAlertEnabled: !next }));
      alert("설정을 변경하지 못했어요.");
    }
  };

  const handleToggleSchedule = async () => {
    const next = !dailyBriefSettings.scheduleAlertEnabled;
    setDailyBriefSettings((prev) => ({ ...prev, scheduleAlertEnabled: next }));
    try {
      await updateDailyBriefSettings({ scheduleAlertEnabled: next });
      trackEvent("[Daily Brief] 시스템 학사일정 알림 토글", { enabled: next });
    } catch {
      setDailyBriefSettings((prev) => ({ ...prev, scheduleAlertEnabled: !next }));
      alert("설정을 변경하지 못했어요.");
    }
  };

  const handleToggleSchoolNotice = () => {
    const next = !isSchoolNoticeEnabled;
    setIsSchoolNoticeEnabled(next);
    trackEvent("[Daily Brief] 학교 공지 알림 토글", { enabled: next });
  };

  const handleToggleDeptAllNotice = async () => {
    const next = !isDeptAllNoticeEnabled;
    setIsDeptAllNoticeEnabled(next);
    try {
      if (userInfo.department) {
        if (next) {
          await subscribeDepartment([userInfo.department]);
        } else {
          await subscribeDepartment([]);
        }
      }
      trackEvent("[Daily Brief] 학과 전체 공지 알림 토글", { enabled: next });
    } catch {
      setIsDeptAllNoticeEnabled(!next);
      alert("학과 공지 설정을 변경하지 못했어요.");
    }
  };

  // School Notice Category Toggle
  const handleToggleSchoolCategory = async (catName: string) => {
    const isSubscribed = subscribedSchoolCategories.includes(catName);
    const updated = isSubscribed
      ? subscribedSchoolCategories.filter((c) => c !== catName)
      : [...subscribedSchoolCategories, catName];

    setSubscribedSchoolCategories(updated);
    try {
      await subscribeKeywordsNotice(updated);
      trackEvent("[Daily Brief] 학교 공지 카테고리 구독 변경", { categories: updated });
    } catch {
      setSubscribedSchoolCategories(subscribedSchoolCategories);
      alert("카테고리 설정을 변경하지 못했어요.");
    }
  };

  // Custom routine On/Off Toggle
  const handleToggle = async () => {
    if (!reminder) return;
    const nextEnabled = !reminder.enabled;
    setReminder({ ...reminder, enabled: nextEnabled });
    try {
      await toggleAgentReminder(reminder.id, nextEnabled);
      trackEvent("[Daily Brief] 맞춤 루틴 토글", {
        id: reminder.id,
        enabled: nextEnabled,
      });
      alert(`루틴이 ${nextEnabled ? "켜졌어요." : "꺼졌어요."}`);
    } catch (error) {
      console.error("맞춤 루틴 토글 실패:", error);
      setReminder({ ...reminder, enabled: !nextEnabled });
      alert("루틴 상태를 변경하지 못했어요.");
    }
  };

  const handleTestDispatch = async () => {
    if (isSystemRoutine) {
      setIsTesting(true);
      setTimeout(() => {
        setIsTesting(false);
        if (systemType === "timetable") {
          alert("오늘의 강의 & 시간표 테스트 알림을 발송했어요!\n(상단 알림 창에서 확인해 보세요)");
        } else if (systemType === "schedule") {
          alert("학사일정 테스트 알림을 발송했어요!\n(상단 알림 창에서 확인해 보세요)");
        } else {
          alert("새 공지사항 테스트 알림을 발송했어요!\n(상단 알림 창에서 확인해 보세요)");
        }
      }, 400);
      return;
    }

    if (!reminder) {
      alert("내 루틴으로 저장한 후 테스트 발송을 할 수 있어요!");
      return;
    }
    setIsTesting(true);
    try {
      await testAgentReminder(reminder.id);
      alert(`'${reminder.title}' 테스트 알림을 보냈어요!\n(잠시 후 알림이 도착해요)`);
      trackEvent("[Daily Brief] 맞춤 루틴 테스트 발송", {
        id: reminder.id,
        title: reminder.title,
      });
    } catch (error) {
      console.error("테스트 발송 실패:", error);
      alert("테스트 알림 발송 중 오류가 발생했어요.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!reminder) return;
    setIsDeleteModalOpen(false);
    try {
      await deleteAgentReminder(reminder.id);
      trackEvent("[Daily Brief] 맞춤 루틴 삭제", {
        id: reminder.id,
        title: reminder.title,
      });
      navigate(-1);
    } catch (error) {
      console.error("루틴 삭제 실패:", error);
      alert("루틴을 삭제하지 못했어요.");
    }
  };

  const handleSavePresetDirect = async () => {
    if (!preset) return;
    try {
      const toolParams = {
        ...(preset.toolParams || {}),
        iconType: preset.iconType,
        iconBg: preset.iconBg,
      };
      const toolParamsJson = JSON.stringify(toolParams);

      const schedules: RoutineScheduleItem[] = [
        {
          days: preset.repeatType === "WEEKDAYS" ? ["MON", "TUE", "WED", "THU", "FRI"] : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
          time: preset.targetTime,
          repeatType: preset.repeatType,
        },
      ];

      await createAgentReminder({
        title: preset.title,
        targetTime: preset.targetTime,
        repeatType: preset.repeatType,
        targetTool: preset.targetTools.join(","),
        toolParamsJson,
        schedulesJson: JSON.stringify(schedules),
        titleTemplate: `🔔 ${preset.title}`,
        bodyTemplate: "",
        route: "/home",
      });
      alert(`'${preset.title}' 루틴을 내 루틴에 등록했어요!`);
      trackEvent("[Daily Brief] 프리셋 루틴 등록", { title: preset.title });
      navigate(-1);
    } catch (error) {
      console.error("루틴 등록 실패:", error);
      alert("루틴을 등록하지 못했어요. 다시 시도해 주세요.");
    }
  };

  // Keyword Management (for Notice Routines)
  const handleOpenAddKeyword = () => {
    setNewKeywordInput("");
    setIsKeywordExcluded(keywordFilterTab === "exclude");
    setIsAddKeywordModalOpen(true);
  };

  const handleConfirmAddKeyword = async () => {
    if (!newKeywordInput.trim()) {
      alert("키워드를 입력해 주세요.");
      return;
    }
    try {
      const targetType = systemType === "dept-notice" ? "DEPARTMENT" : "SCHOOL_NOTICE";
      const deptCode = systemType === "dept-notice" ? (userInfo.departmentCode || userInfo.department) : undefined;
      await createKeyword(newKeywordInput.trim(), deptCode, undefined, isKeywordExcluded);
      alert(`'${newKeywordInput.trim()}' ${isKeywordExcluded ? "제외" : "관심"} 키워드를 등록했어요!`);
      setIsAddKeywordModalOpen(false);
      setNewKeywordInput("");
      
      const res = await getKeywords();
      if (res?.data) {
        if (targetType === "SCHOOL_NOTICE") {
          setSchoolKeywords(res.data.filter((k) => k.type === "SCHOOL_NOTICE" && k.keyword !== null));
        } else {
          setDeptKeywords(res.data.filter((k) => k.type === "DEPARTMENT" && k.keyword !== null));
        }
      }
    } catch (error) {
      console.error("키워드 등록 실패:", error);
      alert("키워드를 등록하지 못했어요.");
    }
  };

  const handleDeleteKeyword = async (keywordId: number, kwText: string) => {
    if (!window.confirm(`'${kwText}' 키워드를 삭제할까요?`)) return;
    try {
      await deleteKeyword(keywordId);
      if (systemType === "dept-notice") {
        setDeptKeywords((prev) => prev.filter((k) => k.keywordId !== keywordId));
      } else {
        setSchoolKeywords((prev) => prev.filter((k) => k.keywordId !== keywordId));
      }
    } catch (error) {
      console.error("키워드 삭제 실패:", error);
      alert("키워드를 삭제하지 못했어요.");
    }
  };

  // Icon Modal Handlers
  const handleOpenIconModal = () => {
    if (!isEditing || isSystemRoutine) return;
    setTempIcon(selectedIcon);
    setTempColor(selectedColor);
    setIsIconModalOpen(true);
  };

  const handleConfirmIconModal = () => {
    setSelectedIcon(tempIcon);
    setSelectedColor(tempColor);
    setIsIconModalOpen(false);
  };

  // Condition Modal Handlers
  const handleOpenEditCondition = (condition: RoutineTimeCondition) => {
    setEditingConditionId(condition.id);
    setModalAmpm(condition.ampm);
    setModalHour(condition.targetHour);
    setModalMinute(condition.targetMinute);
    setModalSelectedDays(condition.selectedDays);
    setIsConditionModalOpen(true);
  };

  const handleOpenAddCondition = () => {
    setEditingConditionId("new");
    setModalAmpm("AM");
    setModalHour("08");
    setModalMinute("30");
    setModalSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);
    setIsConditionModalOpen(true);
  };

  const toggleModalDay = (dayKey: string) => {
    setModalSelectedDays((prev) => {
      if (prev.includes(dayKey)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== dayKey);
      } else {
        return [...prev, dayKey];
      }
    });
  };

  const handleSaveConditionModal = () => {
    if (modalSelectedDays.length === 0) {
      alert("최소 1개 이상의 요일을 선택해 주세요.");
      return;
    }

    let calculatedRepeatType: AgentReminderRepeatType = "WEEKDAYS";
    if (modalSelectedDays.length === 7) {
      calculatedRepeatType = "EVERYDAY";
    } else if (
      modalSelectedDays.length === 5 &&
      ["MON", "TUE", "WED", "THU", "FRI"].every((d) => modalSelectedDays.includes(d))
    ) {
      calculatedRepeatType = "WEEKDAYS";
    } else if (
      modalSelectedDays.length === 2 &&
      ["SUN", "SAT"].every((d) => modalSelectedDays.includes(d))
    ) {
      calculatedRepeatType = "WEEKENDS";
    }

    if (editingConditionId === "new") {
      const newCond: RoutineTimeCondition = {
        id: `time-${Date.now()}`,
        ampm: modalAmpm,
        targetHour: modalHour,
        targetMinute: modalMinute,
        selectedDays: modalSelectedDays,
        repeatType: calculatedRepeatType,
      };
      setTimeConditions((prev) => [...prev, newCond]);
    } else if (editingConditionId) {
      setTimeConditions((prev) =>
        prev.map((c) =>
          c.id === editingConditionId
            ? {
                ...c,
                ampm: modalAmpm,
                targetHour: modalHour,
                targetMinute: modalMinute,
                selectedDays: modalSelectedDays,
                repeatType: calculatedRepeatType,
              }
            : c,
        ),
      );
    }
    setIsConditionModalOpen(false);
  };

  const handleRemoveCondition = (condId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTimeConditions((prev) => prev.filter((c) => c.id !== condId));
  };

  const removeTool = (toolId: string) => {
    setSelectedTools((prev) => prev.filter((t) => t !== toolId));
  };

  const addTool = (toolId: string) => {
    if (!selectedTools.includes(toolId)) {
      setSelectedTools((prev) => [...prev, toolId]);
    }
    setIsToolDrawerOpen(false);
  };

  // Save routine (Custom or System)
  const handleSaveEdit = async () => {
    if (isSystemRoutine) {
      setIsSaving(true);
      try {
        if (systemType === "timetable") {
          const updated = await updateDailyBriefSettings({
            timetableDailyBriefEnabled: sysTimetableDailyBrief,
            timetableDailyBriefTime: sysTimetableTime,
            timetablePreAlertEnabled: sysTimetablePreAlertEnabled,
            timetablePreAlertMinutes: sysTimetablePreAlert,
          });
          if (updated?.data) setDailyBriefSettings(updated.data);
          alert("시간표 알림 설정을 저장했어요!");
        } else if (systemType === "schedule") {
          const updated = await updateDailyBriefSettings({
            scheduleDailyBriefTime: sysScheduleTime,
            advanceDays: sysScheduleAdvanceDays,
            scheduleScope: sysScheduleScope,
          });
          if (updated?.data) setDailyBriefSettings(updated.data);
          alert("학사일정 알림 설정을 저장했어요!");
        } else {
          alert("공지 알림 설정을 저장했어요!");
        }
        setIsEditing(false);
      } catch (error) {
        console.error("시스템 루틴 저장 실패:", error);
        alert("설정을 저장하지 못했어요.");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (!title.trim()) {
      alert("루틴 이름을 입력해 주세요.");
      return;
    }
    if (timeConditions.length === 0) {
      alert("알림 시간을 최소 1개 이상 추가해 주세요.");
      return;
    }
    if (selectedTools.length === 0) {
      alert("알림 내용을 최소 1개 이상 추가해 주세요.");
      return;
    }

    const toolParams: Record<string, any> = {
      iconType: selectedIcon,
      iconBg: selectedColor,
    };
    if (selectedTools.includes("BUS")) {
      toolParams.stopName = selectedBusStop;
    }
    if (selectedTools.includes("CAFETERIA")) {
      toolParams.cafeteria = selectedCafeteria;
      toolParams.mealType = selectedMealType;
    }

    const toolParamsJson = Object.keys(toolParams).length > 0 ? JSON.stringify(toolParams) : "";
    const targetTool = selectedTools.join(",");

    const schedules: RoutineScheduleItem[] = timeConditions.map((cond) => {
      let rawHour = parseInt(cond.targetHour, 10);
      if (cond.ampm === "PM" && rawHour < 12) rawHour += 12;
      if (cond.ampm === "AM" && rawHour === 12) rawHour = 0;
      const finalTime = `${String(rawHour).padStart(2, "0")}:${cond.targetMinute.padStart(2, "0")}`;
      return {
        days: cond.selectedDays,
        time: finalTime,
        repeatType: cond.repeatType,
      };
    });

    const schedulesJson = JSON.stringify(schedules);
    const primaryTime = schedules[0]?.time || "08:30";
    const primaryRepeatType = schedules[0]?.repeatType || "WEEKDAYS";

    setIsSaving(true);
    try {
      if (isNew || isPreset) {
        await createAgentReminder({
          title: title.trim(),
          targetTime: primaryTime,
          repeatType: primaryRepeatType,
          targetTool,
          toolParamsJson,
          schedulesJson,
          titleTemplate: `🔔 ${title.trim()}`,
          bodyTemplate: "",
          route: "/home",
        });
        alert(`'${title.trim()}' 루틴을 저장했어요!`);
        trackEvent("[Daily Brief] 맞춤 루틴 생성", {
          title: title.trim(),
          conditionsCount: timeConditions.length,
        });
        navigate(-1);
      } else if (reminder) {
        await updateAgentReminder(reminder.id, {
          title: title.trim(),
          targetTime: primaryTime,
          repeatType: primaryRepeatType,
          targetTool,
          toolParamsJson,
          schedulesJson,
          enabled: reminder.enabled,
        });

        alert(`'${title.trim()}' 루틴을 수정했어요!`);
        trackEvent("[Daily Brief] 맞춤 루틴 수정", {
          id: reminder.id,
          title: title.trim(),
          conditionsCount: timeConditions.length,
        });
        setIsEditing(false);
        loadData();
      }
    } catch (error) {
      console.error("루틴 저장 실패:", error);
      alert("루틴 저장에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (isNew) {
      navigate(-1);
      return;
    }
    if (isSystemRoutine) {
      setSysTimetableDailyBrief(dailyBriefSettings.timetableDailyBriefEnabled ?? true);
      setSysTimetableTime(dailyBriefSettings.timetableDailyBriefTime || "08:00");
      setSysTimetablePreAlertEnabled(dailyBriefSettings.timetablePreAlertEnabled ?? true);
      setSysTimetablePreAlert(dailyBriefSettings.timetablePreAlertMinutes || 10);
      setSysScheduleTime(dailyBriefSettings.scheduleDailyBriefTime || "08:30");
      setSysScheduleAdvanceDays(dailyBriefSettings.advanceDays ?? 1);
      setSysScheduleScope(dailyBriefSettings.scheduleScope || "ALL");
      setIsEditing(false);
      return;
    }
    syncFormFromData(reminder, preset);
    setIsEditing(false);
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

  if (isLoading) {
    return (
      <PageWrapper>
        <SkeletonWrapper>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="100%" height={120} />
          <Skeleton variant="text" width="100%" height={80} />
        </SkeletonWrapper>
      </PageWrapper>
    );
  }

  const primaryCondition = timeConditions[0];
  const displayTitle = isSystemRoutine
    ? systemType === "timetable"
      ? "오늘의 강의 & 시간표 알림"
      : systemType === "schedule"
      ? "학사일정 알림"
      : systemType === "school-notice"
      ? "학교 공지 알림"
      : "학과 공지 알림"
    : title || (reminder ? reminder.title : preset?.title || "나만의 루틴");

  const displayDesc = isSystemRoutine
    ? systemType === "timetable"
      ? dailyBriefSettings.timetableAlertEnabled
        ? `매일 아침 ${dailyBriefSettings.timetableDailyBriefTime || "08:00"}에 오늘 시간표를 안내하고 수업 ${dailyBriefSettings.timetablePreAlertMinutes || 10}분 전에 알림을 받아요.`
        : "시간표 알림이 꺼져 있어요."
      : systemType === "schedule"
      ? dailyBriefSettings.scheduleAlertEnabled
        ? `매일 아침 ${dailyBriefSettings.scheduleDailyBriefTime || "08:30"}에 ${dailyBriefSettings.advanceDays === 0 ? "당일" : `${dailyBriefSettings.advanceDays || 1}일 전`} 학사일정 알림을 받아요.`
        : "학사일정 알림이 꺼져 있어요."
      : systemType === "school-notice"
      ? isSchoolNoticeEnabled
        ? `새 학교 공지사항 및 등록된 관심 키워드 알림을 실시간으로 받아요.`
        : "학교 공지 알림이 꺼져 있어요."
      : isDeptAllNoticeEnabled
      ? `${userInfo.department ? `${userInfo.department} 새 공지사항 및 관심 키워드 알림을 받아요.` : "내 학과 새 공지사항 및 관심 키워드 알림을 받아요."}`
      : "학과 공지 알림이 꺼져 있어요."
    : reminder
    ? `${reminder.repeatTypeDesc} ${reminder.targetTime}에 ${getToolsDescription(reminder.targetTool)} 정보를 안내해요.`
    : preset?.description ||
      (primaryCondition
        ? `${formatDaysSummary(primaryCondition.selectedDays)} ${primaryCondition.ampm === "AM" ? "오전" : "오후"} ${primaryCondition.targetHour}:${primaryCondition.targetMinute}에 안내해요.`
        : "언제 어떤 캠퍼스 알림을 받을지 설정해 보세요.");

  const availableToAdd = AVAILABLE_ACTIONS.filter((a) => !selectedTools.includes(a.id));

  // Notice Keywords Filtered
  const filteredSchoolKeywords = schoolKeywords.filter((k) =>
    keywordFilterTab === "exclude" ? k.isExcluded : !k.isExcluded,
  );
  const filteredDeptKeywords = deptKeywords.filter((k) =>
    keywordFilterTab === "exclude" ? k.isExcluded : !k.isExcluded,
  );

  return (
    <PageWrapper>
      <ScrollContainer>
        {/* 상단 대표 히어로 카드 */}
        <DetailHeroWrapper>
          <DetailFloatingIcon
            $bgColor={selectedColor}
            $isInteractive={isEditing && !isSystemRoutine}
            onClick={handleOpenIconModal}
            title={isEditing && !isSystemRoutine ? "아이콘 및 색상 변경" : undefined}
          >
            {renderRoutineIcon(selectedIcon, 28, "#ffffff")}
            {isEditing && !isSystemRoutine && (
              <IconEditBadge title="아이콘 변경">
                <Palette size={12} color="#ffffff" strokeWidth={2.5} />
              </IconEditBadge>
            )}
          </DetailFloatingIcon>

          <DetailHeroCard>
            {isEditing && !isSystemRoutine ? (
              <UnderlineInputWrapper>
                <UnderlineInput
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="루틴 이름을 입력해 주세요"
                  maxLength={30}
                  autoFocus={isNew}
                />
              </UnderlineInputWrapper>
            ) : (
              <>
                <DetailHeroTitle>{displayTitle}</DetailHeroTitle>
                <DetailHeroDescription>{displayDesc}</DetailHeroDescription>
                <HeroActionRow>
                  {isSystemRoutine ? (
                    systemType === "timetable" ? (
                      <CapsuleButton
                        variant={dailyBriefSettings.timetableAlertEnabled ? "primary" : "secondary"}
                        onClick={handleToggleTimetable}
                        style={{
                          padding: "8px 24px",
                          fontSize: "14.5px",
                          fontWeight: 700,
                          height: "40px",
                          borderRadius: "9999px",
                        }}
                      >
                        {dailyBriefSettings.timetableAlertEnabled ? "루틴 끄기" : "루틴 켜기"}
                      </CapsuleButton>
                    ) : systemType === "schedule" ? (
                      <CapsuleButton
                        variant={dailyBriefSettings.scheduleAlertEnabled ? "primary" : "secondary"}
                        onClick={handleToggleSchedule}
                        style={{
                          padding: "8px 24px",
                          fontSize: "14.5px",
                          fontWeight: 700,
                          height: "40px",
                          borderRadius: "9999px",
                        }}
                      >
                        {dailyBriefSettings.scheduleAlertEnabled ? "루틴 끄기" : "루틴 켜기"}
                      </CapsuleButton>
                    ) : systemType === "school-notice" ? (
                      <CapsuleButton
                        variant={isSchoolNoticeEnabled ? "primary" : "secondary"}
                        onClick={handleToggleSchoolNotice}
                        style={{
                          padding: "8px 24px",
                          fontSize: "14.5px",
                          fontWeight: 700,
                          height: "40px",
                          borderRadius: "9999px",
                        }}
                      >
                        {isSchoolNoticeEnabled ? "루틴 끄기" : "루틴 켜기"}
                      </CapsuleButton>
                    ) : (
                      <CapsuleButton
                        variant={isDeptAllNoticeEnabled ? "primary" : "secondary"}
                        onClick={handleToggleDeptAllNotice}
                        style={{
                          padding: "8px 24px",
                          fontSize: "14.5px",
                          fontWeight: 700,
                          height: "40px",
                          borderRadius: "9999px",
                        }}
                      >
                        {isDeptAllNoticeEnabled ? "루틴 끄기" : "루틴 켜기"}
                      </CapsuleButton>
                    )
                  ) : reminder ? (
                    <CapsuleButton
                      variant={reminder.enabled ? "primary" : "secondary"}
                      onClick={handleToggle}
                      style={{
                        padding: "8px 24px",
                        fontSize: "14.5px",
                        fontWeight: 700,
                        height: "40px",
                        borderRadius: "9999px",
                      }}
                    >
                      {reminder.enabled ? "루틴 끄기" : "루틴 켜기"}
                    </CapsuleButton>
                  ) : preset ? (
                    <CapsuleButton
                      variant="primary"
                      onClick={handleSavePresetDirect}
                      style={{
                        padding: "8px 24px",
                        fontSize: "14.5px",
                        fontWeight: 700,
                        height: "40px",
                        borderRadius: "9999px",
                      }}
                    >
                      루틴 켜기
                    </CapsuleButton>
                  ) : null}
                </HeroActionRow>
              </>
            )}
          </DetailHeroCard>
        </DetailHeroWrapper>

        {/* =========================================================================
         * 1. 시스템 루틴 상세 뷰 & 편집 모드
         * ========================================================================= */}
        {isSystemRoutine ? (
          <>
            {/* 시간표 알림 (system-timetable) */}
            {systemType === "timetable" && (
              <>
                <DetailSection>
                  <DetailSectionHeader>언제 알림을 받을까요?</DetailSectionHeader>

                  {/* 1. 아침 당일 브리핑 시간 */}
                  <OneUiCard>
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <CardIconWrapper>
                      <Clock size={24} color="#111827" />
                    </CardIconWrapper>
                    <CardContent>
                      <CardMainText>당일 시간표 요약 브리핑</CardMainText>
                      <CardBlueText>
                        매일 아침 {isEditing ? sysTimetableTime : (dailyBriefSettings.timetableDailyBriefTime || "08:00")}
                      </CardBlueText>
                      {isEditing && (
                        <InlineSelectRow data-no-ripple="true">
                          <InlineSelect
                            value={sysTimetableTime}
                            onChange={(e) => setSysTimetableTime(e.target.value)}
                          >
                            {BRIEF_TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                아침 {t}
                              </option>
                            ))}
                          </InlineSelect>
                        </InlineSelectRow>
                      )}
                    </CardContent>
                    {isEditing && (
                      <div style={{ position: "relative", zIndex: 2 }} data-no-ripple="true">
                        <Switch
                          checked={sysTimetableDailyBrief}
                          onCheckedChange={setSysTimetableDailyBrief}
                        />
                      </div>
                    )}
                  </OneUiCard>

                  {/* 2. 수업 시작 전 알림 */}
                  <OneUiCard>
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <CardIconWrapper>
                      <Calendar size={24} color="#a855f7" />
                    </CardIconWrapper>
                    <CardContent>
                      <CardMainText>강의 시작 전 알림</CardMainText>
                      <CardBlueText>
                        수업 시작 {isEditing ? sysTimetablePreAlert : (dailyBriefSettings.timetablePreAlertMinutes || 10)}분 전 알림
                      </CardBlueText>
                      {isEditing && (
                        <InlineSelectWrapper data-no-ripple="true">
                          <InlineSelect
                            value={sysTimetablePreAlert}
                            onChange={(e) => setSysTimetablePreAlert(Number(e.target.value))}
                          >
                            {PRE_ALERT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </InlineSelect>
                        </InlineSelectWrapper>
                      )}
                    </CardContent>
                    {isEditing && (
                      <div style={{ position: "relative", zIndex: 2 }} data-no-ripple="true">
                        <Switch
                          checked={sysTimetablePreAlertEnabled}
                          onCheckedChange={setSysTimetablePreAlertEnabled}
                        />
                      </div>
                    )}
                  </OneUiCard>
                </DetailSection>

                <DetailSection>
                  <DetailSectionHeader>어떤 알림을 받을까요?</DetailSectionHeader>

                  <OneUiCard>
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <CardIconWrapper>
                      <Calendar size={24} color="#a855f7" />
                    </CardIconWrapper>
                    <CardContent>
                      <CardMainText>시간표 / 강의실</CardMainText>
                      <CardBlueText>수강 중인 과목의 강의실 위치와 수업 시작 시간 안내</CardBlueText>
                    </CardContent>
                  </OneUiCard>

                  <OneUiCard>
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <CardIconWrapper>
                      <Sun size={24} color="#5c9cf8" />
                    </CardIconWrapper>
                    <CardContent>
                      <CardMainText>캠퍼스 날씨</CardMainText>
                      <CardBlueText>송도 캠퍼스 당일 기온 및 강수 정보 함께 안내</CardBlueText>
                    </CardContent>
                  </OneUiCard>
                </DetailSection>

                {/* 알림 미리보기 섹션 */}
                <DetailSection>
                  <DetailSectionHeader>알림 미리보기</DetailSectionHeader>
                  <PreviewCardsWrapper>
                    <PushNotificationPreviewCard
                      title="오늘의 강의 안내 (08:00 브리핑)"
                      body="📅 오늘 2개의 강의가 있어요. 첫 수업: 09:00 자연과학대학 101호\n송도 캠퍼스 기온: 18°C (맑음)"
                      time="오전 08:00"
                    />
                    <PushNotificationPreviewCard
                      title="강의 시작 10분 전 안내"
                      body="🏃‍♂️ 곧 '컴퓨터구조' 수업이 시작돼요! 강의실: 28호관 204호"
                      time="수업 10분 전"
                    />
                  </PreviewCardsWrapper>
                </DetailSection>
              </>
            )}

            {/* 학사일정 알림 (system-schedule) */}
            {systemType === "schedule" && (
              <>
                <DetailSection>
                  <DetailSectionHeader>언제 알림을 받을까요?</DetailSectionHeader>

                  {/* 1. 아침 학사일정 브리핑 시간 */}
                  <OneUiCard>
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <CardIconWrapper>
                      <Clock size={24} color="#111827" />
                    </CardIconWrapper>
                    <CardContent>
                      <CardMainText>학사일정 브리핑 시간</CardMainText>
                      <CardBlueText>
                        매일 아침 {isEditing ? sysScheduleTime : (dailyBriefSettings.scheduleDailyBriefTime || "08:30")}
                      </CardBlueText>
                      {isEditing && (
                        <InlineSelectWrapper data-no-ripple="true">
                          <InlineSelect
                            value={sysScheduleTime}
                            onChange={(e) => setSysScheduleTime(e.target.value)}
                          >
                            {BRIEF_TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                아침 {t}
                              </option>
                            ))}
                          </InlineSelect>
                        </InlineSelectWrapper>
                      )}
                    </CardContent>
                  </OneUiCard>

                  {/* 2. 사전 알림 기준 */}
                  <OneUiCard>
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <CardIconWrapper>
                      <GraduationCap size={24} color="#3b82f6" />
                    </CardIconWrapper>
                    <CardContent>
                      <CardMainText>사전 알림 기준</CardMainText>
                      <CardBlueText>
                        {(() => {
                          const days = isEditing ? sysScheduleAdvanceDays : (dailyBriefSettings.advanceDays ?? 1);
                          return days === 0 ? "당일 알림" : `${days}일 전 사전 알림`;
                        })()}
                      </CardBlueText>
                      {isEditing && (
                        <InlineSelectWrapper data-no-ripple="true">
                          <InlineSelect
                            value={sysScheduleAdvanceDays}
                            onChange={(e) => setSysScheduleAdvanceDays(Number(e.target.value))}
                          >
                            {ADVANCE_DAYS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </InlineSelect>
                        </InlineSelectWrapper>
                      )}
                    </CardContent>
                  </OneUiCard>
                </DetailSection>

                <DetailSection>
                  <DetailSectionHeader>어떤 알림을 받을까요?</DetailSectionHeader>

                  <OneUiCard>
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <CardIconWrapper>
                      <GraduationCap size={24} color="#3b82f6" />
                    </CardIconWrapper>
                    <CardContent>
                      <CardMainText>학사일정 알림 대상</CardMainText>
                      <CardBlueText>
                        {(() => {
                          const scope = isEditing ? sysScheduleScope : (dailyBriefSettings.scheduleScope || "ALL");
                          if (scope === "SCHOOL_ONLY") return "학교 공식 학사일정만";
                          if (scope === "DEPT_ONLY") return "내 학과 게시판 학사일정만";
                          return "학교 및 학과 전체 학사일정";
                        })()}
                      </CardBlueText>
                      {isEditing && (
                        <InlineSelectWrapper data-no-ripple="true">
                          <InlineSelect
                            value={sysScheduleScope}
                            onChange={(e) => setSysScheduleScope(e.target.value as ScheduleScope)}
                          >
                            {SCHEDULE_SCOPE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </InlineSelect>
                        </InlineSelectWrapper>
                      )}
                    </CardContent>
                  </OneUiCard>
                </DetailSection>

                {/* 알림 미리보기 섹션 */}
                <DetailSection>
                  <DetailSectionHeader>알림 미리보기</DetailSectionHeader>
                  <PreviewCardsWrapper>
                    <PushNotificationPreviewCard
                      title="학사일정 알림 (08:30 브리핑)"
                      body="🎓 다가오는 주요 학사일정:\n- 2026학년도 2학기 수강신청 변경 기간 (D-1)\n- 성적 정정 마감일 (D-3)"
                      time="오전 08:30"
                    />
                  </PreviewCardsWrapper>
                </DetailSection>
              </>
            )}

            {/* 학교 공지 알림 (system-school-notice) */}
            {systemType === "school-notice" && (
              <>
                <DetailSection>
                  <DetailSectionHeader>언제 알림을 받을까요?</DetailSectionHeader>

                  <OneUiCard>
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <CardIconWrapper>
                      <Clock size={24} color="#111827" />
                    </CardIconWrapper>
                    <CardContent>
                      <CardMainText>새 공지 등록 시</CardMainText>
                      <CardBlueText>학교 홈페이지에 새 글이 등록되면 실시간 즉시 알림</CardBlueText>
                    </CardContent>
                  </OneUiCard>
                </DetailSection>

                {/* 카테고리 구독 섹션 */}
                <DetailSection>
                  <DetailSectionHeader>구독할 공지 카테고리</DetailSectionHeader>
                  <CategoryChipsCard>
                    <CardSubDesc>선택한 카테고리의 새로운 공지사항 알림을 받아요.</CardSubDesc>
                    <CategoryChipsRow>
                      {schoolCategories.length === 0 ? (
                        <CategorySkeletonRow>
                          <Skeleton variant="text" width={60} height={32} />
                          <Skeleton variant="text" width={70} height={32} />
                          <Skeleton variant="text" width={65} height={32} />
                        </CategorySkeletonRow>
                      ) : (
                        schoolCategories.map((cat) => {
                          const isSub = subscribedSchoolCategories.includes(cat);
                          return (
                            <CategoryChip
                              key={cat}
                              $active={isSub}
                              onClick={() => handleToggleSchoolCategory(cat)}
                            >
                              <Ripple color={isSub ? "rgba(255, 255, 255, 0.25)" : "rgba(37, 99, 235, 0.12)"} />
                              {isSub && <Check size={13} strokeWidth={3} />}
                              <span>{cat}</span>
                            </CategoryChip>
                          );
                        })
                      )}
                    </CategoryChipsRow>
                  </CategoryChipsCard>
                </DetailSection>

                {/* 관심/제외 키워드 알림 섹션 */}
                <DetailSection>
                  <DetailSectionHeader>키워드 알림 설정</DetailSectionHeader>
                  <KeywordSectionCard>
                    <KeywordHeaderRow>
                      <KeywordTabGroup>
                        <KeywordTabBtn
                          $active={keywordFilterTab === "include"}
                          onClick={() => setKeywordFilterTab("include")}
                        >
                          <Ripple color="rgba(0, 0, 0, 0.06)" />
                          관심 키워드 ({schoolKeywords.filter((k) => !k.isExcluded).length})
                        </KeywordTabBtn>
                        <KeywordTabBtn
                          $active={keywordFilterTab === "exclude"}
                          onClick={() => setKeywordFilterTab("exclude")}
                        >
                          <Ripple color="rgba(0, 0, 0, 0.06)" />
                          제외 키워드 ({schoolKeywords.filter((k) => k.isExcluded).length})
                        </KeywordTabBtn>
                      </KeywordTabGroup>

                      <AddKeywordChipButton onClick={handleOpenAddKeyword}>
                        <Ripple color="rgba(37, 99, 235, 0.15)" />
                        <Plus size={14} strokeWidth={2.5} />
                        <span>키워드 추가</span>
                      </AddKeywordChipButton>
                    </KeywordHeaderRow>

                    {filteredSchoolKeywords.length === 0 ? (
                      <EmptyKeywordGuide>
                        {keywordFilterTab === "include"
                          ? "등록된 관심 키워드가 없어요. 키워드를 등록하면 관련 공지를 놓치지 않고 알려드려요!"
                          : "등록된 제외 키워드가 없어요. 제외할 키워드를 등록하면 해당 단어가 들어간 공지는 알림에서 제외돼요."}
                      </EmptyKeywordGuide>
                    ) : (
                      <KeywordChipsContainer>
                        {filteredSchoolKeywords.map((kw) => (
                          <KeywordChip key={kw.keywordId} $isExclude={kw.isExcluded}>
                            <span>{kw.isExcluded ? `-${kw.keyword}` : `#${kw.keyword}`}</span>
                            <ChipDeleteBtn data-no-ripple="true" onClick={() => handleDeleteKeyword(kw.keywordId, kw.keyword || "")}>
                              <X size={13} color="#64748b" />
                            </ChipDeleteBtn>
                          </KeywordChip>
                        ))}
                      </KeywordChipsContainer>
                    )}
                  </KeywordSectionCard>
                </DetailSection>

                {/* 알림 미리보기 섹션 */}
                <DetailSection>
                  <DetailSectionHeader>알림 미리보기</DetailSectionHeader>
                  <PreviewCardsWrapper>
                    <PushNotificationPreviewCard
                      title="[학교 공지] 2026학년도 2학기 장학금 신청 안내"
                      body="📢 장학 • 등록금 카테고리에 새로운 공지사항이 등록되었습니다."
                      time="지금"
                    />
                  </PreviewCardsWrapper>
                </DetailSection>
              </>
            )}

            {/* 학과 공지 알림 (system-dept-notice) */}
            {systemType === "dept-notice" && (
              <>
                <DetailSection>
                  <DetailSectionHeader>언제 알림을 받을까요?</DetailSectionHeader>

                  <OneUiCard>
                    <Ripple color="rgba(0, 0, 0, 0.04)" />
                    <CardIconWrapper>
                      <Clock size={24} color="#111827" />
                    </CardIconWrapper>
                    <CardContent>
                      <CardMainText>새 공지 등록 시</CardMainText>
                      <CardBlueText>내 학과 홈페이지에 새 글이 등록되면 실시간 즉시 알림</CardBlueText>
                    </CardContent>
                  </OneUiCard>
                </DetailSection>

                <DetailSection>
                  <DetailSectionHeader>내 소속 학과</DetailSectionHeader>

                  <OneUiCard onClick={() => navigate(ROUTES.MYPAGE.PROFILE)}>
                    <Ripple color="rgba(0, 0, 0, 0.06)" />
                    <CardIconWrapper>
                      <Building2 size={24} color="#ff7a00" />
                    </CardIconWrapper>
                    <CardContent>
                      <CardMainText>
                        {userInfo.department ? `${userInfo.department}` : "소속 학과를 설정해 주세요"}
                      </CardMainText>
                      <CardBlueText>
                        {userInfo.department
                          ? "학과 공지사항 및 졸업/행사 알림을 받아요"
                          : "마이페이지에서 학과를 등록하면 맞춤 공지 알림을 받을 수 있어요"}
                      </CardBlueText>
                    </CardContent>
                  </OneUiCard>
                </DetailSection>

                {/* 학과 관심/제외 키워드 알림 섹션 */}
                <DetailSection>
                  <DetailSectionHeader>학과 키워드 알림 설정</DetailSectionHeader>
                  <KeywordSectionCard>
                    <KeywordHeaderRow>
                      <KeywordTabGroup>
                        <KeywordTabBtn
                          $active={keywordFilterTab === "include"}
                          onClick={() => setKeywordFilterTab("include")}
                        >
                          <Ripple color="rgba(0, 0, 0, 0.06)" />
                          관심 키워드 ({deptKeywords.filter((k) => !k.isExcluded).length})
                        </KeywordTabBtn>
                        <KeywordTabBtn
                          $active={keywordFilterTab === "exclude"}
                          onClick={() => setKeywordFilterTab("exclude")}
                        >
                          <Ripple color="rgba(0, 0, 0, 0.06)" />
                          제외 키워드 ({deptKeywords.filter((k) => k.isExcluded).length})
                        </KeywordTabBtn>
                      </KeywordTabGroup>

                      <AddKeywordChipButton onClick={handleOpenAddKeyword}>
                        <Ripple color="rgba(37, 99, 235, 0.15)" />
                        <Plus size={14} strokeWidth={2.5} />
                        <span>키워드 추가</span>
                      </AddKeywordChipButton>
                    </KeywordHeaderRow>

                    {filteredDeptKeywords.length === 0 ? (
                      <EmptyKeywordGuide>
                        {keywordFilterTab === "include"
                          ? "등록된 학과 관심 키워드가 없어요. 키워드를 등록하면 관련 학과 공지를 놓치지 않고 알려드려요!"
                          : "등록된 학과 제외 키워드가 없어요."}
                      </EmptyKeywordGuide>
                    ) : (
                      <KeywordChipsContainer>
                        {filteredDeptKeywords.map((kw) => (
                          <KeywordChip key={kw.keywordId} $isExclude={kw.isExcluded}>
                            <span>{kw.isExcluded ? `-${kw.keyword}` : `#${kw.keyword}`}</span>
                            <ChipDeleteBtn data-no-ripple="true" onClick={() => handleDeleteKeyword(kw.keywordId, kw.keyword || "")}>
                              <X size={13} color="#64748b" />
                            </ChipDeleteBtn>
                          </KeywordChip>
                        ))}
                      </KeywordChipsContainer>
                    )}
                  </KeywordSectionCard>
                </DetailSection>

                {/* 알림 미리보기 섹션 */}
                <DetailSection>
                  <DetailSectionHeader>알림 미리보기</DetailSectionHeader>
                  <PreviewCardsWrapper>
                    <PushNotificationPreviewCard
                      title={`[${userInfo.department || "컴퓨터공학부"}] 캡스톤디자인 발표회 안내`}
                      body="🏢 학과 공지사항 게시판에 새로운 소식이 등록되었습니다."
                      time="지금"
                    />
                  </PreviewCardsWrapper>
                </DetailSection>
              </>
            )}
          </>
        ) : (
          /* =========================================================================
           * 2. 사용자 맞춤 루틴 & 프리셋 뷰 / 편집 모드
           * ========================================================================= */
          <>
            {/* 언제 알림을 받을까요? 섹션 */}
            <DetailSection>
              <DetailSectionHeader>언제 알림을 받을까요?</DetailSectionHeader>

              {timeConditions.length === 0 ? (
                <EmptyGuideCard>
                  <EmptyGuideIconCircle>
                    <Clock size={20} color="#94a3b8" />
                  </EmptyGuideIconCircle>
                  <EmptyGuideText>
                    <EmptyGuideTitle>설정된 알림 시간이 없어요</EmptyGuideTitle>
                    <EmptyGuideSub>알림을 받을 시간과 요일을 추가해 주세요.</EmptyGuideSub>
                  </EmptyGuideText>
                </EmptyGuideCard>
              ) : (
                timeConditions.map((cond) => {
                  const timeSubtitle = `${cond.ampm === "AM" ? "오전" : "오후"} ${cond.targetHour}:${cond.targetMinute}\n${formatDaysSummary(cond.selectedDays)}`;

                  return (
                    <OneUiCard
                      key={cond.id}
                      onClick={() => isEditing && handleOpenEditCondition(cond)}
                    >
                      <Ripple color="rgba(0, 0, 0, 0.06)" />
                      <CardIconWrapper>
                        <Clock size={24} color="#111827" />
                      </CardIconWrapper>

                      <CardContent>
                        <CardMainText>{formatDaysSummary(cond.selectedDays)} 알림</CardMainText>
                        <CardBlueText>{timeSubtitle}</CardBlueText>
                      </CardContent>

                      {isEditing && (
                        <MinusButton
                          data-no-ripple="true"
                          type="button"
                          onClick={(e) => handleRemoveCondition(cond.id, e)}
                          title="시간 조건 삭제"
                        >
                          <Minus size={18} color="#ef4444" strokeWidth={3} />
                        </MinusButton>
                      )}
                    </OneUiCard>
                  );
                })
              )}

              {isEditing && (
                <AddConditionCard onClick={handleOpenAddCondition}>
                  <Ripple color="rgba(16, 185, 129, 0.12)" />
                  <Plus size={18} color="#10b981" strokeWidth={2.5} />
                  <span>알림 시간 추가</span>
                </AddConditionCard>
              )}
            </DetailSection>

            {/* 어떤 알림을 받을까요? 섹션 */}
            <DetailSection>
              <DetailSectionHeader>어떤 알림을 받을까요?</DetailSectionHeader>

              {selectedTools.length === 0 ? (
                <EmptyGuideCard>
                  <EmptyGuideIconCircle>
                    <Bell size={20} color="#94a3b8" />
                  </EmptyGuideIconCircle>
                  <EmptyGuideText>
                    <EmptyGuideTitle>선택된 알림 내용이 없어요</EmptyGuideTitle>
                    <EmptyGuideSub>받고 싶은 캠퍼스 정보 알림을 추가해 주세요.</EmptyGuideSub>
                  </EmptyGuideText>
                </EmptyGuideCard>
              ) : (
                selectedTools.map((toolId) => {
                  const actionInfo = AVAILABLE_ACTIONS.find((a) => a.id === toolId);
                  if (!actionInfo) return null;

                  return (
                    <OneUiCard key={toolId}>
                      <Ripple color="rgba(0, 0, 0, 0.04)" />
                      <CardIconWrapper>{actionInfo.icon}</CardIconWrapper>

                      <CardContent>
                        <CardMainText>{actionInfo.title}</CardMainText>

                        {toolId === "BUS" && (
                          <>
                            <CardBlueText>{selectedBusStop}</CardBlueText>
                            {isEditing && (
                              <InlineSelectWrapper data-no-ripple="true">
                                <InlineSelect
                                  value={selectedBusStop}
                                  onChange={(e) => setSelectedBusStop(e.target.value)}
                                >
                                  {BUS_STOP_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </InlineSelect>
                              </InlineSelectWrapper>
                            )}
                          </>
                        )}

                        {toolId === "CAFETERIA" && (
                          <>
                            <CardBlueText>
                              {selectedCafeteria} • {selectedMealType === "DINNER" ? "석식" : "중식"}
                            </CardBlueText>
                            {isEditing && (
                              <InlineSelectRow data-no-ripple="true">
                                <InlineSelect
                                  value={selectedCafeteria}
                                  onChange={(e) => setSelectedCafeteria(e.target.value)}
                                >
                                  {CAFETERIA_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </InlineSelect>
                                <InlineSelect
                                  value={selectedMealType}
                                  onChange={(e) => setSelectedMealType(e.target.value)}
                                >
                                  <option value="AUTO">자동 (시간대별)</option>
                                  <option value="LUNCH">중식</option>
                                  <option value="DINNER">석식</option>
                                </InlineSelect>
                              </InlineSelectRow>
                            )}
                          </>
                        )}

                        {toolId === "WEATHER" && (
                          <CardBlueText>송도 캠퍼스 기온 및 강수 정보</CardBlueText>
                        )}

                        {toolId === "TIMETABLE" && (
                          <CardBlueText>오늘 첫 수업 시간 및 강의실 위치</CardBlueText>
                        )}

                        {toolId === "NOTICE" && (
                          <CardBlueText>학교 및 학과 최신 주요 공지</CardBlueText>
                        )}
                      </CardContent>

                      {isEditing && (
                        <MinusButton
                          data-no-ripple="true"
                          type="button"
                          onClick={() => removeTool(toolId)}
                          title="알림 내용 삭제"
                        >
                          <Minus size={18} color="#ef4444" strokeWidth={3} />
                        </MinusButton>
                      )}
                    </OneUiCard>
                  );
                })
              )}

              {/* 알림 내용 추가 버튼 */}
              {isEditing && availableToAdd.length > 0 && (
                <AddConditionCard onClick={() => setIsToolDrawerOpen(true)}>
                  <Ripple color="rgba(16, 185, 129, 0.12)" />
                  <Plus size={18} color="#10b981" strokeWidth={2.5} />
                  <span>알림 내용 추가</span>
                </AddConditionCard>
              )}
            </DetailSection>
          </>
        )}
      </ScrollContainer>

      {/* =========================================================================
       * 하단 플로팅 메뉴 바
       * ========================================================================= */}
      {isEditing ? (
        <EditFloatingPill>
          <EditPillButton onClick={handleCancelEdit} type="button">
            <Ripple color="rgba(0, 0, 0, 0.08)" />
            <span>취소</span>
          </EditPillButton>
          <EditPillDivider />
          <EditPillButton
            $isPrimary={true}
            onClick={handleSaveEdit}
            disabled={isSaving}
            type="button"
          >
            <Ripple color="rgba(37, 99, 235, 0.15)" />
            <span>{isSaving ? "저장 중..." : "저장"}</span>
          </EditPillButton>
        </EditFloatingPill>
      ) : (
        <FloatingActionPill>
          <PillActionButton onClick={() => setIsEditing(true)}>
            <Ripple color="rgba(0, 0, 0, 0.08)" />
            <Pencil size={20} color="#111827" />
            <span>편집</span>
          </PillActionButton>

          <PillActionButton onClick={handleTestDispatch} disabled={isTesting}>
            <Ripple color="rgba(0, 0, 0, 0.08)" />
            <Send size={20} color={isTesting ? "#9ca3af" : "#111827"} />
            <span>{isTesting ? "발송 중" : "테스트"}</span>
          </PillActionButton>

          {/* 시스템 루틴은 삭제 불가 */}
          {isSystemRoutine ? null : reminder ? (
            <PillActionButton onClick={() => setIsDeleteModalOpen(true)}>
              <Ripple color="rgba(239, 68, 68, 0.12)" />
              <Trash2 size={20} color="#ef4444" />
              <span style={{ color: "#ef4444" }}>삭제</span>
            </PillActionButton>
          ) : preset ? (
            <PillActionButton onClick={handleSavePresetDirect}>
              <Ripple color="rgba(0, 0, 0, 0.08)" />
              <Download size={20} color="#111827" />
              <span>저장</span>
            </PillActionButton>
          ) : null}
        </FloatingActionPill>
      )}

      {/* =========================================================================
       * 모달 컴포넌트들
       * ========================================================================= */}

      {/* 키워드 추가 모달 */}
      <Modal
        isOpen={isAddKeywordModalOpen}
        onClose={() => setIsAddKeywordModalOpen(false)}
        title={isKeywordExcluded ? "제외 키워드 등록" : "관심 키워드 등록"}
        description={
          isKeywordExcluded
            ? "등록한 키워드가 포함된 공지사항은 알림에서 제외돼요."
            : "등록한 키워드가 포함된 새 공지사항이 올라오면 실시간 알림을 받아요."
        }
        secondaryButton={{
          text: "취소",
          onClick: () => setIsAddKeywordModalOpen(false),
        }}
        primaryButton={{
          text: "등록",
          variant: "primary",
          onClick: handleConfirmAddKeyword,
        }}
      >
        <KeywordModalContent>
          <KeywordModalInput
            type="text"
            value={newKeywordInput}
            onChange={(e) => setNewKeywordInput(e.target.value)}
            placeholder={isKeywordExcluded ? "제외할 키워드 입력 (예: 채용, 봉사)" : "키워드 입력 (예: 장학금, 수강신청, 인턴)"}
            maxLength={20}
            autoFocus={true}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirmAddKeyword();
              }
            }}
          />

          <ExcludeToggleRow onClick={() => setIsKeywordExcluded(!isKeywordExcluded)}>
            <ExcludeCheckCircle $checked={isKeywordExcluded}>
              {isKeywordExcluded && <Check size={12} color="#ffffff" strokeWidth={3} />}
            </ExcludeCheckCircle>
            <ExcludeLabel>이 키워드가 들어간 공지는 알림에서 제외하기</ExcludeLabel>
          </ExcludeToggleRow>
        </KeywordModalContent>
      </Modal>

      {/* 아이콘 및 색상 선택 모달 */}
      <Modal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        title="아이콘 및 테마 색상 선택"
        description="루틴을 대표할 아이콘과 색상을 자유롭게 선택해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsIconModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleConfirmIconModal,
        }}
      >
        <IconPickerModalContent>
          <PickerSectionTitle>테마 색상</PickerSectionTitle>
          <ColorPickerRow>
            {ROUTINE_COLORS.map((c) => {
              const isSelected = tempColor === c.hex;
              return (
                <ColorSelectButton
                  key={c.id}
                  $color={c.hex}
                  $selected={isSelected}
                  onClick={() => setTempColor(c.hex)}
                  type="button"
                  title={c.label}
                >
                  <Ripple color="rgba(255, 255, 255, 0.3)" />
                  {isSelected && <Check size={16} color="#ffffff" strokeWidth={3} />}
                </ColorSelectButton>
              );
            })}
          </ColorPickerRow>

          <PickerSectionTitle style={{ marginTop: "14px" }}>아이콘</PickerSectionTitle>
          <IconGrid>
            {ROUTINE_ICONS.map((item) => {
              const isSelected = tempIcon === item.id;
              return (
                <IconGridItem
                  key={item.id}
                  $selected={isSelected}
                  $bgColor={tempColor}
                  onClick={() => setTempIcon(item.id)}
                  type="button"
                >
                  <Ripple color="rgba(37, 99, 235, 0.1)" />
                  <IconCirclePreview $selected={isSelected} $bgColor={tempColor}>
                    {renderRoutineIcon(item.id, 22, isSelected ? "#ffffff" : "#475569")}
                  </IconCirclePreview>
                  <IconGridLabel $selected={isSelected}>{item.label}</IconGridLabel>
                </IconGridItem>
              );
            })}
          </IconGrid>
        </IconPickerModalContent>
      </Modal>

      {/* 조건 설정 모달 */}
      <Modal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
        title={editingConditionId === "new" ? "알림 시간 추가" : "알림 시간 및 요일 설정"}
        description="Daily Brief 알림을 받을 시간과 반복할 요일을 설정해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsConditionModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveConditionModal,
        }}
      >
        <TimePickerModalContent>
          <PickerRow>
            <AmPmToggle>
              <AmPmButton
                $active={modalAmpm === "AM"}
                onClick={() => setModalAmpm("AM")}
                type="button"
              >
                <Ripple color={modalAmpm === "AM" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.08)"} />
                오전
              </AmPmButton>
              <AmPmButton
                $active={modalAmpm === "PM"}
                onClick={() => setModalAmpm("PM")}
                type="button"
              >
                <Ripple color={modalAmpm === "PM" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.08)"} />
                오후
              </AmPmButton>
            </AmPmToggle>

            <TimeInputGroup>
              <TimeSelect
                value={modalHour}
                onChange={(e) => setModalHour(e.target.value)}
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
                value={modalMinute}
                onChange={(e) => setModalMinute(e.target.value)}
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

          <DayCircleRow>
            {DAYS.map((day) => {
              const isSelected = modalSelectedDays.includes(day.key);
              return (
                <DayCircleButton
                  key={day.key}
                  type="button"
                  $active={isSelected}
                  onClick={() => toggleModalDay(day.key)}
                >
                  <Ripple color={isSelected ? "rgba(255, 255, 255, 0.25)" : "rgba(37, 99, 235, 0.1)"} />
                  {day.label}
                </DayCircleButton>
              );
            })}
          </DayCircleRow>
        </TimePickerModalContent>
      </Modal>

      {/* 루틴 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="루틴 삭제"
        description={`'${reminder?.title}' 루틴을 정말 삭제할까요?`}
        secondaryButton={{
          text: "취소",
          onClick: () => setIsDeleteModalOpen(false),
        }}
        primaryButton={{
          text: "삭제",
          variant: "danger",
          onClick: handleDelete,
        }}
      />

      {/* 알림 내용 추가 드로어 */}
      {isToolDrawerOpen && (
        <DrawerBackdrop onClick={() => setIsToolDrawerOpen(false)}>
          <DrawerContainer onClick={(e) => e.stopPropagation()}>
            <DrawerHeader>
              <DrawerTitle>알림 내용 추가</DrawerTitle>
              <DrawerCloseButton onClick={() => setIsToolDrawerOpen(false)}>
                <X size={20} color="#6b7280" />
              </DrawerCloseButton>
            </DrawerHeader>

            <DrawerList>
              {availableToAdd.map((action) => (
                <DrawerItem key={action.id} onClick={() => addTool(action.id)}>
                  <Ripple color="rgba(0, 0, 0, 0.06)" />
                  <DrawerIconCircle $bgColor={action.iconBg}>
                    {React.cloneElement(action.icon, { size: 20, color: "#ffffff" })}
                  </DrawerIconCircle>
                  <DrawerItemText>
                    <DrawerItemTitle>{action.title}</DrawerItemTitle>
                    <DrawerItemDesc>{action.description}</DrawerItemDesc>
                  </DrawerItemText>
                  <Plus size={18} color="#3b82f6" />
                </DrawerItem>
              ))}
            </DrawerList>
          </DrawerContainer>
        </DrawerBackdrop>
      )}
    </PageWrapper>
  );
}

/**
 * 모바일 OS 푸시 알림 프리뷰 컴포넌트
 */
function PushNotificationPreviewCard({
  title,
  body,
  time = "지금",
}: {
  title: string;
  body: string;
  time?: string;
}) {
  return (
    <OsNotificationBanner>
      <OsHeader>
        <OsAppIconWrapper>
          <Bell size={10} color="#ffffff" />
        </OsAppIconWrapper>
        <OsAppName>INTIP Daily Brief</OsAppName>
        <OsTimeText>{time}</OsTimeText>
      </OsHeader>
      <OsTitle>{title}</OsTitle>
      <OsBody>{body}</OsBody>
    </OsNotificationBanner>
  );
}

/* =========================================================================
 * Samsung Galaxy One UI 스타일드 컴포넌트
 * ========================================================================= */

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f7f8fa;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ScrollContainer = styled.div`
  flex: 1;
  padding: 16px 20px 120px 20px;
  display: flex;
  flex-direction: column;
  gap: 26px;
`;

const SkeletonWrapper = styled.div`
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DetailHeroWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
`;

const DetailFloatingIcon = styled.div<{ $bgColor: string; $isInteractive?: boolean }>`
  position: absolute;
  top: -28px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  z-index: 2;
  cursor: ${({ $isInteractive }) => ($isInteractive ? "pointer" : "default")};
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  ${({ $isInteractive }) =>
    $isInteractive &&
    `
    &:hover {
      transform: scale(1.06);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
    }
  `}
`;

const IconEditBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #111827;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
`;

const DetailHeroCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 26px;
  border: 1px solid #e9ecef;
  padding: 46px 20px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
`;

const DetailHeroTitle = styled.h2`
  font-size: 21px;
  font-weight: 800;
  color: #000000;
  margin: 0;
  letter-spacing: -0.4px;
`;

const DetailHeroDescription = styled.p`
  font-size: 13.5px;
  color: #666666;
  margin: 0;
  line-height: 1.45;
`;

const HeroActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  width: 100%;
`;

const UnderlineInputWrapper = styled.div`
  width: 100%;
  padding: 10px 4px 6px 4px;
`;

const UnderlineInput = styled.input`
  width: 100%;
  border: none;
  border-bottom: 2px solid #111827;
  padding: 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  text-align: left;
  outline: none;
  background: transparent;
  box-sizing: border-box;

  &::placeholder {
    color: #9ca3af;
    font-weight: 500;
  }
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DetailSectionHeader = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: #000000;
  margin: 0 0 0 4px;
  letter-spacing: -0.3px;
`;

const OneUiCard = styled.div`
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e9ecef;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;
  cursor: pointer;
`;

const CardIconWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
`;

const CardMainText = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #000000;
  letter-spacing: -0.2px;
`;

const CardBlueText = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  color: #2d79f3;
  line-height: 1.35;
  white-space: pre-line;
`;

const CardSubDesc = styled.div`
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.35;
`;

const MinusButton = styled.button`
  position: relative;
  z-index: 2;
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
  border-radius: 50%;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #fee2e2;
  }
`;

const AddConditionCard = styled.button`
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e9ecef;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: background-color 0.15s ease;

  > * {
    position: relative;
    z-index: 1;
  }

  span {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
  }

  &:hover {
    background-color: #f8fafc;
  }
`;

const EmptyGuideCard = styled.div`
  background: #ffffff;
  border-radius: 24px;
  border: 1px dashed #cbd5e1;
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
`;

const EmptyGuideIconCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const EmptyGuideText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const EmptyGuideTitle = styled.div`
  font-size: 14.5px;
  font-weight: 700;
  color: #334155;
`;

const EmptyGuideSub = styled.div`
  font-size: 12.5px;
  color: #94a3b8;
`;

const TimePickerModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 8px 0;
`;

const PickerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const AmPmToggle = styled.div`
  display: flex;
  background-color: #f1f5f9;
  border-radius: 9999px;
  padding: 3px;
  gap: 2px;
`;

const AmPmButton = styled.button<{ $active: boolean }>`
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 9999px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background-color: ${({ $active }) => ($active ? "#2563eb" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#64748b")};
  transition: all 0.15s ease;

  > * {
    position: relative;
    z-index: 1;
  }
`;

const TimeInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TimeSelect = styled.select`
  appearance: none;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  cursor: pointer;
`;

const TimeColon = styled.span`
  font-size: 16px;
  font-weight: 800;
  color: #64748b;
`;

const DayCircleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding-top: 4px;
`;

const DayCircleButton = styled.button<{ $active: boolean }>`
  position: relative;
  overflow: hidden;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13.5px;
  font-weight: 700;
  background-color: ${({ $active }) => ($active ? "#2563eb" : "#f1f5f9")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#64748b")};
  transition: all 0.15s ease;

  > * {
    position: relative;
    z-index: 1;
  }
`;

const InlineSelectWrapper = styled.div`
  position: relative;
  z-index: 2;
  margin-top: 6px;
`;

const InlineSelectRow = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  gap: 8px;
  margin-top: 6px;
`;

const InlineSelect = styled.select`
  appearance: none;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 5px 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  cursor: pointer;
`;

/* 카테고리 칩 카드 */
const CategoryChipsCard = styled.div`
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e9ecef;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
`;

const CategoryChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CategorySkeletonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const CategoryChip = styled.button<{ $active: boolean }>`
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: ${({ $active }) => ($active ? "#2563eb" : "#f1f5f9")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#475569")};
  border: none;
  border-radius: 9999px;
  padding: 7px 14px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    opacity: 0.9;
  }
`;

/* 키워드 관리 One UI 카드 & 칩 */
const KeywordSectionCard = styled.div`
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e9ecef;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
`;

const KeywordHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const KeywordTabGroup = styled.div`
  display: flex;
  background-color: #f1f5f9;
  border-radius: 9999px;
  padding: 3px;
  gap: 2px;
`;

const KeywordTabBtn = styled.button<{ $active: boolean }>`
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 9999px;
  padding: 5px 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  background-color: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#111827" : "#64748b")};
  box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none")};
  transition: all 0.15s ease;

  > * {
    position: relative;
    z-index: 1;
  }
`;

const AddKeywordChipButton = styled.button`
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #f1f5f9;
  color: #2563eb;
  border: none;
  border-radius: 9999px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    background-color: #e2e8f0;
  }
`;

const EmptyKeywordGuide = styled.div`
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.4;
  padding: 4px 0;
`;

const KeywordChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const KeywordChip = styled.div<{ $isExclude?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: ${({ $isExclude }) => ($isExclude ? "#fee2e2" : "#f8fafc")};
  border: 1px solid ${({ $isExclude }) => ($isExclude ? "#fca5a5" : "#e2e8f0")};
  border-radius: 9999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $isExclude }) => ($isExclude ? "#b91c1c" : "#1e293b")};
`;

const ChipDeleteBtn = styled.button`
  position: relative;
  z-index: 2;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.7;
  }
`;

const KeywordModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 10px 0;
`;

const KeywordModalInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14.5px;
  font-weight: 600;
  color: #111827;
  outline: none;

  &:focus {
    border-color: #2563eb;
  }

  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
`;

const ExcludeToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
`;

const ExcludeCheckCircle = styled.div<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid ${({ $checked }) => ($checked ? "#ef4444" : "#cbd5e1")};
  background-color: ${({ $checked }) => ($checked ? "#ef4444" : "#ffffff")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
`;

const ExcludeLabel = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: #475569;
`;

/* 알림 미리보기 컴포넌트 스타일 */
const PreviewCardsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OsNotificationBanner = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e9ecef;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

const OsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-bottom: 2px;
`;

const OsAppIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background-color: #2563eb;
  flex-shrink: 0;
`;

const OsAppName = styled.span`
  font-size: 11.5px;
  font-weight: 700;
  color: #4b5563;
  flex: 1;
  letter-spacing: -0.2px;
`;

const OsTimeText = styled.span`
  font-size: 11px;
  color: #9ca3af;
`;

const OsTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
  letter-spacing: -0.2px;
`;

const OsBody = styled.div`
  font-size: 12.5px;
  color: #374151;
  line-height: 1.45;
  white-space: pre-line;
  letter-spacing: -0.1px;
`;

/* 아이콘 & 컬러 피커 모달 스타일 */
const IconPickerModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 6px 0;
  max-height: 55vh;
  overflow-y: auto;
`;

const PickerSectionTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #334155;
`;

const ColorPickerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ColorSelectButton = styled.button<{ $color: string; $selected: boolean }>`
  position: relative;
  overflow: hidden;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: ${({ $selected }) => ($selected ? "3px solid #111827" : "2px solid transparent")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
`;

const IconGridItem = styled.button<{ $selected: boolean; $bgColor: string }>`
  position: relative;
  overflow: hidden;
  background-color: ${({ $selected }) => ($selected ? "#f1f5f9" : "#ffffff")};
  border: ${({ $selected }) => ($selected ? "2px solid #2563eb" : "1px solid #e2e8f0")};
  border-radius: 16px;
  padding: 12px 6px 10px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    background-color: #f8fafc;
  }
`;

const IconCirclePreview = styled.div<{ $selected: boolean; $bgColor: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ $selected, $bgColor }) => ($selected ? $bgColor : "#f1f5f9")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
`;

const IconGridLabel = styled.div<{ $selected: boolean }>`
  font-size: 11px;
  font-weight: ${({ $selected }) => ($selected ? "700" : "500")};
  color: ${({ $selected }) => ($selected ? "#2563eb" : "#64748b")};
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

/* 하단 플로팅 뷰 액션 바 */
const FloatingActionPill = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 9999px;
  padding: 8px 32px;
  display: flex;
  align-items: center;
  gap: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  white-space: nowrap;
`;

const PillActionButton = styled.button`
  position: relative;
  overflow: hidden;
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 12px;
  white-space: nowrap;
  transition: transform 0.1s ease;

  > * {
    position: relative;
    z-index: 1;
    white-space: nowrap;
  }

  span {
    font-size: 11.5px;
    font-weight: 700;
    color: #111827;
  }

  &:hover {
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* 하단 플로팅 편집 액션 바 */
const EditFloatingPill = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 9999px;
  padding: 8px 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  white-space: nowrap;
`;

const EditPillButton = styled.button<{ $isPrimary?: boolean }>`
  position: relative;
  overflow: hidden;
  background: none;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 800;
  color: ${({ $isPrimary }) => ($isPrimary ? "#2563eb" : "#111827")};
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 9999px;
  transition: transform 0.1s ease, opacity 0.15s ease;

  span {
    position: relative;
    z-index: 1;
    white-space: nowrap;
  }

  &:hover {
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditPillDivider = styled.div`
  width: 1px;
  height: 18px;
  background-color: #e2e8f0;
`;

/* 드로어 모달 */
const DrawerBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const DrawerContainer = styled.div`
  width: 100%;
  max-width: 480px;
  background-color: #ffffff;
  border-top-left-radius: 26px;
  border-top-right-radius: 26px;
  padding: 24px 20px 36px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DrawerTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin: 0;
`;

const DrawerCloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DrawerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DrawerItem = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 18px;
  background-color: #f8fafc;
  border: 1px solid #edf2f7;
  cursor: pointer;
  transition: all 0.15s ease;

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const DrawerIconCircle = styled.div<{ $bgColor: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DrawerItemText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const DrawerItemTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

const DrawerItemDesc = styled.div`
  font-size: 12.5px;
  color: #64748b;
`;
