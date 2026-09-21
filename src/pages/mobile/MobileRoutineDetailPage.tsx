import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import CapsuleButton from "@/components/common/CapsuleButton";
import Modal from "@/components/common/Modal";
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
  Search,
} from "lucide-react";
import {
  getAgentReminders,
  toggleAgentReminder,
  deleteAgentReminder,
  testAgentReminder,
  testCustomAgentReminder,
  createAgentReminder,
  updateAgentReminder,
} from "@/apis/agentReminder";
import { notifyRoutineUpdated } from "@/utils/routineSync";
import {
  getDailyBriefSettings,
  updateDailyBriefSettings,
  getLocalDailyBriefSettings,
} from "@/apis/dailyBrief";
import {
  getKeywords,
  getKeywordsNotice,
  subscribeKeywordsNotice,
  getSubscribedDepartments,
  subscribeSchoolDepartment,
} from "@/apis/notices";
import { getSchoolDepartments, type SchoolDepartment } from "@/apis/departments";
import { getSchoolNoticeCategories } from "@/apis/categories";
import {
  getTimetableNowBarSettings,
  setTimetableNowBarSettings,
  testTimetableNowBar,
} from "@/apis/timetableNowBarBridge";
import type {
  AgentReminder,
  AgentReminderRepeatType,
  RoutineScheduleItem,
  RoutineTriggerCondition,
  RoutineTriggerType,
  RoutineActionBlock,
  RoutineActionType,
} from "@/types/agentReminder";
import type { DailyBriefSettings, ScheduleScope } from "@/types/dailyBrief";
import Skeleton from "@/components/common/Skeleton";
import { trackEvent } from "@/utils/mixpanel";
import useUserStore from "@/stores/useUserStore";
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
    title: "당일 강의 & 시간표 브리핑",
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
          title: "평일 (월~금) 알림",
          subtitle: "오전 08:00",
          timeParams: { ampm: "AM", hour: "08", minute: "00", selectedDays: ["MON", "TUE", "WED", "THU", "FRI"], repeatType: "WEEKDAYS" },
        },
      ],
      actions: [
        {
          id: "act-time-1",
          type: "TIMETABLE",
          title: "시간표 / 강의실",
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
          title: "각 수업 시작 전 알림",
          subtitle: "수업 시작 10분 전",
          beforeClassParams: { minutes: 10 },
        },
      ],
      actions: [
        {
          id: "act-time-1",
          type: "TIMETABLE",
          title: "시간표 / 강의실",
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
          title: "실시간 Now Bar & Dynamic Island 띄우기",
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
    title: "학사일정 알림",
    description: "수강신청, 시험 기간 등 주요 학교 및 학과 학사일정을 사전에 안내받아요.",
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
          title: "평일 (월~금) 알림",
          subtitle: "오전 08:30",
          timeParams: { ampm: "AM", hour: "08", minute: "30", selectedDays: ["MON", "TUE", "WED", "THU", "FRI"], repeatType: "WEEKDAYS" },
        },
      ],
      actions: [
        {
          id: "act-sched-1",
          type: "SCHEDULE",
          title: "학사일정 알림",
          subtitle: "학교 및 학과 전체 • 1일 전 사전 알림",
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
    title: "학교 공지사항 알림",
    description: "인천대학교 대표 홈페이지에 새 공지사항이 등록되면 알림을 받아요.",
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
          title: "학교 공지 알림",
          subtitle: "전체 카테고리 공지 알림",
          iconBg: "#5c9cf8",
          schoolNoticeParams: { categories: [], includeKeywords: [], excludeKeywords: [] },
        },
      ],
    },
    iconType: "notice",
    iconBg: "#5c9cf8",
    whenTitle: "새 공지 등록 시",
    whenSubtitle: "학교 새 공지 등록 시 실시간",
    whatTitle: "새 학교 공지사항 알림",
  },
  {
    id: "preset-dept-notice",
    category: "study",
    title: "학과 공지사항 알림",
    description: "내 학과 홈페이지에 새 공지사항 또는 관심 키워드 글이 올라오면 알림을 받아요.",
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
          title: "학과 공지 알림",
          subtitle: "새 공지 및 관심 키워드 알림",
          iconBg: "#ff7a00",
          deptNoticeParams: { deptCode: "", deptName: "내 학과", includeKeywords: [], excludeKeywords: [] },
        },
      ],
    },
    iconType: "dept",
    iconBg: "#ff7a00",
    whenTitle: "새 공지 등록 시",
    whenSubtitle: "학과 새 공지 등록 시 실시간",
    whatTitle: "새 학과 공지사항 알림",
  },

  // 2. 이동 및 교통
  {
    id: "preset-bus-inip",
    category: "transit",
    title: "등교 버스 알림",
    description: "출근 및 등교 시간에 맞춰 인천대입구역 버스 도착 정보를 받아요.",
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
    title: "하교길 버스 알림",
    description: "수업 후 귀가할 때 정문 정류소 버스 도착 정보를 받아요.",
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
    description: "일어나는 시간에 오늘 캠퍼스 날씨와 첫 수업 시간표를 받아요.",
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
    description: "점심시간 전에 학생식당과 기숙사 식당 메뉴를 받아요.",
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

export const AVAILABLE_ACTIONS = [
  {
    id: "DEPT_NOTICE" as RoutineActionType,
    title: "학과 공지 알림",
    description: "선택한 학과의 새 공지와 관심 키워드 소식을 받아요",
    icon: <Building2 size={24} color="#ff7a00" />,
    iconBg: "#ff7a00",
  },
  {
    id: "SCHOOL_NOTICE" as RoutineActionType,
    title: "학교 공지 알림",
    description: "학교 대표 공지 및 관심 카테고리/키워드 소식을 받아요",
    icon: <Bell size={24} color="#5c9cf8" />,
    iconBg: "#5c9cf8",
  },
  {
    id: "TIMETABLE" as RoutineActionType,
    title: "시간표 / 강의실",
    description: "오늘 수업 시간표와 이동할 강의실 위치를 안내받아요",
    icon: <Calendar size={24} color="#a855f7" />,
    iconBg: "#a855f7",
  },
  {
    id: "SCHEDULE" as RoutineActionType,
    title: "학사일정 알림",
    description: "다가오는 주요 학사일정과 시험/수강신청 일정을 받아요",
    icon: <GraduationCap size={24} color="#3b82f6" />,
    iconBg: "#3b82f6",
  },
  {
    id: "WEATHER" as RoutineActionType,
    title: "캠퍼스 날씨",
    description: "송도 캠퍼스 오늘 날씨와 기온 예보를 받아요",
    icon: <Sun size={24} color="#5c9cf8" />,
    iconBg: "#5c9cf8",
  },
  {
    id: "BUS" as RoutineActionType,
    title: "버스 도착 알림",
    description: "인천대입구역 및 교내 정류소 버스 도착 정보를 받아요",
    icon: <Bus size={24} color="#ff7a00" />,
    iconBg: "#ff7a00",
  },
  {
    id: "CAFETERIA" as RoutineActionType,
    title: "학식 식단",
    description: "학생식당 및 기숙사 식당의 오늘 식단표를 받아요",
    icon: <Utensils size={24} color="#22c55e" />,
    iconBg: "#22c55e",
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
  { id: "dept", label: "학과/전공" },
];

export const ROUTINE_COLORS = [
  { id: "blue", hex: "#5c9cf8", label: "블루" },
  { id: "purple", hex: "#a855f7", label: "퍼플" },
  { id: "violet", hex: "#8b5cf6", label: "바이올렛" },
  { id: "orange", hex: "#ff7a00", label: "오렌지" },
  { id: "green", hex: "#22c55e", label: "그린" },
  { id: "red", hex: "#ef4444", label: "레드" },
  { id: "amber", hex: "#f59e0b", label: "앰버" },
  { id: "indigo", hex: "#6366f1", label: "인디고" },
  { id: "pink", hex: "#ec4899", label: "핑크" },
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
    case "dept":
      return <Building2 size={size} color={color} />;
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
  if (upper.includes("DEPT_NOTICE")) return { iconId: "dept", bg: "#ff7a00" };
  if (upper.includes("NOTICE")) return { iconId: "notice", bg: "#3b82f6" };
  if (upper.includes("SCHEDULE")) return { iconId: "graduation", bg: "#3b82f6" };
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
  { label: "5분 전 알림", value: 5 },
  { label: "10분 전 알림 (추천)", value: 10 },
  { label: "15분 전 알림", value: 15 },
  { label: "20분 전 알림", value: 20 },
  { label: "30분 전 알림", value: 30 },
  { label: "45분 전 알림", value: 45 },
  { label: "60분 전 (1시간 전)", value: 60 },
];

const BEFORE_FIRST_CLASS_OPTIONS = [
  { label: "30분 전 알림", value: 30 },
  { label: "60분 (1시간) 전 알림 (추천)", value: 60 },
  { label: "90분 (1시간 30분) 전 알림", value: 90 },
  { label: "120분 (2시간) 전 알림", value: 120 },
];

const AFTER_LAST_CLASS_OPTIONS = [
  { label: "수업 종료 10분 전 알림", value: -10 },
  { label: "수업 종료 직후 알림", value: 0 },
  { label: "수업 종료 10분 후 알림 (추천)", value: 10 },
  { label: "수업 종료 20분 후 알림", value: 20 },
  { label: "수업 종료 30분 후 알림", value: 30 },
];

const LONG_BREAK_OPTIONS = [
  { label: "1시간 이상 공강 시", value: 60 },
  { label: "2시간 이상 공강 시 (추천)", value: 120 },
  { label: "3시간 이상 공강 시", value: 180 },
];

const ADVANCE_DAYS_OPTIONS = [
  { label: "당일 알림", value: 0 },
  { label: "1일 전 사전 알림 (추천)", value: 1 },
  { label: "3일 전 사전 알림", value: 3 },
  { label: "7일 전 (1주일 전) 사전 알림", value: 7 },
];

const SCHEDULE_SCOPE_OPTIONS = [
  { label: "학교 및 학과 전체 학사일정", value: "ALL" as ScheduleScope },
  { label: "학교 공식 학사일정만", value: "SCHOOL_ONLY" as ScheduleScope },
  { label: "내 학과 학사일정만", value: "DEPT_ONLY" as ScheduleScope },
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

type SystemRoutineType = "timetable-brief" | "timetable-pre" | "timetable-nowbar" | "schedule" | "school-notice" | "dept-notice";

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

  // System routine sub-type mapping
  const systemType = useMemo<SystemRoutineType | null>(() => {
    if (id === "system-timetable-brief" || id === "system-timetable") return "timetable-brief";
    if (id === "system-timetable-pre") return "timetable-pre";
    if (id === "system-timetable-nowbar" || id === "preset-timetable-nowbar") return "timetable-nowbar";
    if (id === "system-schedule") return "schedule";
    if (id === "system-school-notice") return "school-notice";
    if (id === "system-dept-notice") return "dept-notice";
    return null;
  }, [id]);

  const [reminder, setReminder] = useState<AgentReminder | null>(null);
  const [preset, setPreset] = useState<RoutinePreset | null>(null);
  const [dailyBriefSettings, setDailyBriefSettings] = useState<DailyBriefSettings>(getLocalDailyBriefSettings);
  const [isSchoolNoticeEnabled, setIsSchoolNoticeEnabled] = useState(true);
  const [isDeptNoticeEnabled, setIsDeptNoticeEnabled] = useState(true);
  
  // Notice & Categories & Departments states
  const [schoolCategories, setSchoolCategories] = useState<string[]>([]);
  const [allDepartments, setAllDepartments] = useState<SchoolDepartment[]>([]);

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Icon & Theme Color modal
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("sparkles");
  const [selectedColor, setSelectedColor] = useState<string>("#5c9cf8");
  const [tempIcon, setTempIcon] = useState<string>("sparkles");
  const [tempColor, setTempColor] = useState<string>("#5c9cf8");

  // Routine Form States (Custom & Builder)
  const [title, setTitle] = useState("");
  const [triggers, setTriggers] = useState<RoutineTriggerCondition[]>([]);
  const [actions, setActions] = useState<RoutineActionBlock[]>([]);

  // Trigger Selection & Configuration Modals
  const [isTriggerSelectModalOpen, setIsTriggerSelectModalOpen] = useState(false);
  const [isTimeConditionModalOpen, setIsTimeConditionModalOpen] = useState(false);
  const [editingTriggerId, setEditingTriggerId] = useState<string | "new" | null>(null);
  const [modalAmpm, setModalAmpm] = useState<"AM" | "PM">("AM");
  const [modalHour, setModalHour] = useState("08");
  const [modalMinute, setModalMinute] = useState("30");
  const [modalSelectedDays, setModalSelectedDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI"]);

  // Action Selection & Configuration Modals
  const [isActionSelectModalOpen, setIsActionSelectModalOpen] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  // Department Action Modal (특정 학과 선택 + 전용 키워드 세부 설정)
  const [isDeptActionModalOpen, setIsDeptActionModalOpen] = useState(false);
  const [tempDeptCode, setTempDeptCode] = useState("");
  const [tempDeptName, setTempDeptName] = useState("");
  const [tempDeptIncludeKeywords, setTempDeptIncludeKeywords] = useState<string[]>([]);
  const [tempDeptExcludeKeywords, setTempDeptExcludeKeywords] = useState<string[]>([]);
  const [deptKeywordInput, setDeptKeywordInput] = useState("");
  const [deptKeywordTab, setDeptKeywordTab] = useState<"include" | "exclude">("include");
  const [deptSearchQuery, setDeptSearchQuery] = useState("");

  // School Notice Action Modal
  const [isSchoolNoticeActionModalOpen, setIsSchoolNoticeActionModalOpen] = useState(false);
  const [tempSchoolCategories, setTempSchoolCategories] = useState<string[]>([]);
  const [tempSchoolIncludeKeywords, setTempSchoolIncludeKeywords] = useState<string[]>([]);
  const [tempSchoolExcludeKeywords, setTempSchoolExcludeKeywords] = useState<string[]>([]);
  const [schoolKeywordInput, setSchoolKeywordInput] = useState("");
  const [schoolKeywordTab, setSchoolKeywordTab] = useState<"include" | "exclude">("include");

  // Bus Action Modal
  const [isBusActionModalOpen, setIsBusActionModalOpen] = useState(false);
  const [tempBusStop, setTempBusStop] = useState("인천대입구역 1번출구");

  // Cafeteria Action Modal
  const [isCafeteriaActionModalOpen, setIsCafeteriaActionModalOpen] = useState(false);
  const [tempCafeteria, setTempCafeteria] = useState("전체");
  const [tempMealType, setTempMealType] = useState<"AUTO" | "LUNCH" | "DINNER">("AUTO");

  // Schedule Action Modal
  const [isScheduleActionModalOpen, setIsScheduleActionModalOpen] = useState(false);
  const [tempScheduleScope, setTempScheduleScope] = useState<ScheduleScope>("ALL");
  const [tempScheduleAdvanceDays, setTempScheduleAdvanceDays] = useState(1);

  // Before Class Trigger Modal
  const [isBeforeClassTriggerModalOpen, setIsBeforeClassTriggerModalOpen] = useState(false);
  const [tempBeforeClassMinutes, setTempBeforeClassMinutes] = useState(10);

  // Before First Class Trigger Modal
  const [isBeforeFirstClassModalOpen, setIsBeforeFirstClassModalOpen] = useState(false);
  const [tempBeforeFirstClassMinutes, setTempBeforeFirstClassMinutes] = useState(60);

  // After Last Class Trigger Modal
  const [isAfterLastClassModalOpen, setIsAfterLastClassModalOpen] = useState(false);
  const [tempAfterLastClassOffset, setTempAfterLastClassOffset] = useState(10);

  // Long Break Trigger Modal
  const [isLongBreakModalOpen, setIsLongBreakModalOpen] = useState(false);
  const [tempLongBreakMinGap, setTempLongBreakMinGap] = useState(120);

  // No Class Day Trigger Modal
  const [isNoClassDayModalOpen, setIsNoClassDayModalOpen] = useState(false);
  const [tempNoClassDayAmpm, setTempNoClassDayAmpm] = useState<"AM" | "PM">("AM");
  const [tempNoClassDayHour, setTempNoClassDayHour] = useState("10");
  const [tempNoClassDayMinute, setTempNoClassDayMinute] = useState("00");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const syncFormFromData = useCallback(
    (rem: AgentReminder | null, pre: RoutinePreset | null) => {
      if (rem) {
        setTitle(rem.title);

        let customIconVal = "";
        let customColorVal = "";
        let parsedTriggers: RoutineTriggerCondition[] = [];
        let parsedActions: RoutineActionBlock[] = [];

        if (rem.toolParamsJson) {
          try {
            const parsed = JSON.parse(rem.toolParamsJson);
            if (parsed.iconType) customIconVal = parsed.iconType;
            if (parsed.iconBg) customColorVal = parsed.iconBg;
            if (parsed.triggers && Array.isArray(parsed.triggers)) parsedTriggers = parsed.triggers;
            if (parsed.actions && Array.isArray(parsed.actions)) parsedActions = parsed.actions;
          } catch (ignored) {}
        }

        const fallback = getDefaultIconAndBgForTools(rem.targetTool);
        setSelectedIcon(customIconVal || fallback.iconId);
        setSelectedColor(customColorVal || fallback.bg);

        // Fallback for triggers if not in toolParamsJson
        if (parsedTriggers.length === 0) {
          if (rem.schedulesJson) {
            try {
              const schedules: RoutineScheduleItem[] = JSON.parse(rem.schedulesJson);
              parsedTriggers = schedules.map((s, idx) => {
                const parts = (s.time || "08:30").split(":");
                const rawHour = parseInt(parts[0] || "8", 10);
                const rawMin = parts[1] || "30";
                const isPm = rawHour >= 12;
                const h = isPm ? (rawHour === 12 ? 12 : rawHour - 12) : (rawHour === 0 ? 12 : rawHour);
                const days = s.days || ["MON", "TUE", "WED", "THU", "FRI"];
                return {
                  id: `trigger-time-${idx + 1}`,
                  type: "TIME",
                  title: `${formatDaysSummary(days)} 알림`,
                  subtitle: `${isPm ? "오후" : "오전"} ${String(h).padStart(2, "0")}:${rawMin}`,
                  timeParams: {
                    ampm: isPm ? "PM" : "AM",
                    hour: String(h).padStart(2, "0"),
                    minute: rawMin,
                    selectedDays: days,
                    repeatType: s.repeatType || "WEEKDAYS",
                  },
                };
              });
            } catch (ignored) {}
          } else if (rem.targetTime) {
            const parts = rem.targetTime.split(":");
            const rawHour = parseInt(parts[0] || "8", 10);
            const rawMin = parts[1] || "30";
            const isPm = rawHour >= 12;
            const h = isPm ? (rawHour === 12 ? 12 : rawHour - 12) : (rawHour === 0 ? 12 : rawHour);
            const days = rem.repeatType === "WEEKDAYS" ? ["MON", "TUE", "WED", "THU", "FRI"] : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            parsedTriggers = [
              {
                id: "trigger-time-1",
                type: "TIME",
                title: `${formatDaysSummary(days)} 알림`,
                subtitle: `${isPm ? "오후" : "오전"} ${String(h).padStart(2, "0")}:${rawMin}`,
                timeParams: {
                  ampm: isPm ? "PM" : "AM",
                  hour: String(h).padStart(2, "0"),
                  minute: rawMin,
                  selectedDays: days,
                  repeatType: rem.repeatType || "WEEKDAYS",
                },
              },
            ];
          }
        }
        setTriggers(parsedTriggers);

        // Fallback for actions if not in toolParamsJson
        if (parsedActions.length === 0 && rem.targetTool) {
          const tools = rem.targetTool.split(",").map((s) => s.trim().toUpperCase());
          parsedActions = tools.map((tool, idx) => {
            if (tool === "BUS") {
              return {
                id: `act-${idx + 1}`,
                type: "BUS",
                title: "버스 도착 알림",
                subtitle: "인천대입구역 1번출구",
                iconBg: "#ff7a00",
                busParams: { stopName: "인천대입구역 1번출구" },
              };
            }
            if (tool === "CAFETERIA") {
              return {
                id: `act-${idx + 1}`,
                type: "CAFETERIA",
                title: "학식 식단",
                subtitle: "전체 식당 • 당일 식단",
                iconBg: "#22c55e",
                cafeteriaParams: { restaurant: "전체", mealType: "AUTO" },
              };
            }
            if (tool === "TIMETABLE") {
              return {
                id: `act-${idx + 1}`,
                type: "TIMETABLE",
                title: "시간표 / 강의실",
                subtitle: "오늘 수업 시간표 및 강의실 위치",
                iconBg: "#a855f7",
              };
            }
            if (tool === "SCHEDULE") {
              return {
                id: `act-${idx + 1}`,
                type: "SCHEDULE",
                title: "학사일정 알림",
                subtitle: "학교 및 학과 학사일정",
                iconBg: "#3b82f6",
                scheduleParams: { scope: "ALL", advanceDays: 1 },
              };
            }
            if (tool === "DEPT_NOTICE") {
              return {
                id: `act-${idx + 1}`,
                type: "DEPT_NOTICE",
                title: "학과 공지 알림",
                subtitle: "내 학과 새 공지 및 키워드",
                iconBg: "#ff7a00",
                deptNoticeParams: {
                  deptCode: "",
                  deptName: "내 학과",
                  includeKeywords: [],
                  excludeKeywords: [],
                },
              };
            }
            if (tool === "NOTICE") {
              return {
                id: `act-${idx + 1}`,
                type: "SCHOOL_NOTICE",
                title: "학교 공지 알림",
                subtitle: "학교 대표 새 공지사항",
                iconBg: "#5c9cf8",
                schoolNoticeParams: {
                  categories: [],
                  includeKeywords: [],
                  excludeKeywords: [],
                },
              };
            }
            return {
              id: `act-${idx + 1}`,
              type: "WEATHER",
              title: "캠퍼스 날씨",
              subtitle: "송도 캠퍼스 오늘 날씨 예보",
              iconBg: "#5c9cf8",
            };
          });
        }
        setActions(parsedActions);
      } else if (pre) {
        setTitle(pre.title);
        setSelectedIcon(pre.iconType || "sun");
        setSelectedColor(pre.iconBg || "#5c9cf8");

        const parts = (pre.targetTime || "08:30").split(":");
        const rawHour = parseInt(parts[0] || "8", 10);
        const rawMin = parts[1] || "30";
        const isPm = rawHour >= 12;
        const h = isPm ? (rawHour === 12 ? 12 : rawHour - 12) : (rawHour === 0 ? 12 : rawHour);
        const days = pre.repeatType === "WEEKDAYS" ? ["MON", "TUE", "WED", "THU", "FRI"] : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

        setTriggers([
          {
            id: "trigger-time-1",
            type: "TIME",
            title: pre.whenTitle || `${formatDaysSummary(days)} 알림`,
            subtitle: pre.whenSubtitle || `${isPm ? "오후" : "오전"} ${String(h).padStart(2, "0")}:${rawMin}`,
            timeParams: {
              ampm: isPm ? "PM" : "AM",
              hour: String(h).padStart(2, "0"),
              minute: rawMin,
              selectedDays: days,
              repeatType: pre.repeatType || "WEEKDAYS",
            },
          },
        ]);

        const preActions: RoutineActionBlock[] = (pre.targetTools || ["WEATHER"]).map((tool, idx) => {
          if (tool === "BUS") {
            return {
              id: `act-${idx + 1}`,
              type: "BUS",
              title: "버스 도착 알림",
              subtitle: pre.toolParams?.stopName || "인천대입구역 1번출구",
              iconBg: "#ff7a00",
              busParams: { stopName: pre.toolParams?.stopName || "인천대입구역 1번출구" },
            };
          }
          if (tool === "CAFETERIA") {
            return {
              id: `act-${idx + 1}`,
              type: "CAFETERIA",
              title: "학식 식단",
              subtitle: `${pre.toolParams?.cafeteria || "전체"} • ${pre.toolParams?.mealType === "DINNER" ? "석식" : "중식"}`,
              iconBg: "#22c55e",
              cafeteriaParams: {
                restaurant: pre.toolParams?.cafeteria || "전체",
                mealType: pre.toolParams?.mealType || "LUNCH",
              },
            };
          }
          if (tool === "TIMETABLE") {
            return {
              id: `act-${idx + 1}`,
              type: "TIMETABLE",
              title: "시간표 / 강의실",
              subtitle: "오늘 수업 시간표 및 강의실 위치",
              iconBg: "#a855f7",
            };
          }
          if (tool === "NOTICE") {
            return {
              id: `act-${idx + 1}`,
              type: "SCHOOL_NOTICE",
              title: "학교 공지 알림",
              subtitle: "학교 대표 새 공지사항",
              iconBg: "#3b82f6",
              schoolNoticeParams: { categories: [], includeKeywords: [], excludeKeywords: [] },
            };
          }
          return {
            id: `act-${idx + 1}`,
            type: "WEATHER",
            title: "캠퍼스 날씨",
            subtitle: "송도 캠퍼스 오늘 날씨 예보",
            iconBg: "#5c9cf8",
          };
        });
        setActions(preActions);
      } else {
        // [나만의 새 루틴 만들기] 기본 템플릿
        setTitle("");
        setTriggers([]);
        setActions([]);
        setSelectedIcon("sparkles");
        setSelectedColor("#5c9cf8");
      }
    },
    [],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [noticeCatRes, deptsRes] = await Promise.all([
        getSchoolNoticeCategories().catch(() => ({ data: [] })),
        getSchoolDepartments().catch(() => ({ data: [] })),
      ]);

      let loadedDepts: SchoolDepartment[] = [];
      if (noticeCatRes?.data) setSchoolCategories(noticeCatRes.data);
      if (deptsRes?.data) {
        setAllDepartments(deptsRes.data);
        loadedDepts = deptsRes.data;
      }

      if (isNew) {
        syncFormFromData(null, null);
        setIsLoading(false);
        return;
      }

      if (isSystemRoutine) {
        const [briefRes, keywordsRes, subCatRes, subDeptsRes] = await Promise.all([
          getDailyBriefSettings().catch(() => ({ data: null })),
          getKeywords().catch(() => ({ data: [] })),
          getKeywordsNotice().catch(() => ({ data: [] })),
          getSubscribedDepartments().catch(() => ({ data: [] })),
        ]);

        const curSettings = briefRes?.data || getLocalDailyBriefSettings();
        setDailyBriefSettings(curSettings);

        const subCats = subCatRes?.data?.map((k) => k.category || "") || [];
        const subDepts = subDeptsRes?.data || [];
        const allKw = keywordsRes?.data || [];

        if (systemType === "timetable-brief") {
          const time = curSettings.timetableDailyBriefTime || "08:00";
          const parts = time.split(":");
          const rawH = parseInt(parts[0] || "8", 10);
          const isPm = rawH >= 12;
          const h = isPm ? (rawH === 12 ? 12 : rawH - 12) : (rawH === 0 ? 12 : rawH);
          const min = parts[1] || "00";

          setTitle("당일 강의 & 시간표 브리핑");
          setSelectedIcon("timetable");
          setSelectedColor("#a855f7");
          setTriggers([
            {
              id: "sys-trigger-brief",
              type: "TIME",
              title: "평일 (월~금) 알림",
              subtitle: `${isPm ? "오후" : "오전"} ${String(h).padStart(2, "0")}:${min}`,
              timeParams: {
                ampm: isPm ? "PM" : "AM",
                hour: String(h).padStart(2, "0"),
                minute: min,
                selectedDays: ["MON", "TUE", "WED", "THU", "FRI"],
                repeatType: "WEEKDAYS",
              },
            },
          ]);
          setActions([
            {
              id: "sys-act-timetable",
              type: "TIMETABLE",
              title: "오늘의 수업 & 시간표",
              subtitle: "오늘 수업 시간표 및 강의실 위치",
              iconBg: "#a855f7",
            },
          ]);
        } else if (systemType === "timetable-pre") {
          const mins = curSettings.timetablePreAlertMinutes || 10;
          setTitle("강의 시작 전 알림");
          setSelectedIcon("clock");
          setSelectedColor("#8b5cf6");
          setTriggers([
            {
              id: "sys-trigger-pre",
              type: "BEFORE_CLASS",
              title: "강의 시작 전 알림",
              subtitle: `수업 시작 ${mins}분 전`,
              beforeClassParams: { minutes: mins },
            },
          ]);
          setActions([
            {
              id: "sys-act-pre",
              type: "TIMETABLE",
              title: "시간표 / 강의실",
              subtitle: "다음 수업 시간표 및 이동할 강의실 위치",
              iconBg: "#8b5cf6",
            },
          ]);
        } else if (systemType === "timetable-nowbar") {
          const nowBarRes = await getTimetableNowBarSettings().catch(() => null);
          const lead = nowBarRes?.leadTimeMinutes || 15;
          setTitle("실시간 시간표 & Now Bar (Dynamic Island)");
          setSelectedIcon("graduation");
          setSelectedColor("#0055D4");
          setTriggers([
            {
              id: "sys-trigger-nowbar",
              type: "BEFORE_CLASS",
              title: "수업 시작 전부터",
              subtitle: `수업 시작 ${lead}분 전부터 종료 시까지`,
              beforeClassParams: { minutes: lead },
            },
          ]);
          setActions([
            {
              id: "sys-act-nowbar",
              type: "TIMETABLE_NOWBAR",
              title: "실시간 Now Bar & Dynamic Island 띄우기",
              subtitle: "잠금화면 및 상태바에 실시간 강의실 및 카운트다운 카드 렌더링",
              iconBg: "#0055D4",
              timetableNowBarParams: { leadTimeMinutes: lead },
            },
          ]);
        } else if (systemType === "schedule") {
          const time = curSettings.scheduleDailyBriefTime || "08:30";
          const adv = curSettings.advanceDays ?? 1;
          const scope = curSettings.scheduleScope || "ALL";
          const advText = adv === 0 ? "당일" : `${adv}일 전`;
          const scopeText =
            scope === "SCHOOL_ONLY" ? "학교 공식만" : scope === "DEPT_ONLY" ? "내 학과만" : "학교 및 학과 전체";
          const parts = time.split(":");
          const rawH = parseInt(parts[0] || "8", 10);
          const isPm = rawH >= 12;
          const h = isPm ? (rawH === 12 ? 12 : rawH - 12) : (rawH === 0 ? 12 : rawH);
          const min = parts[1] || "30";

          setTitle("학사일정 알림");
          setSelectedIcon("graduation");
          setSelectedColor("#3b82f6");
          setTriggers([
            {
              id: "sys-trigger-schedule",
              type: "TIME",
              title: "평일 (월~금) 알림",
              subtitle: `${isPm ? "오후" : "오전"} ${String(h).padStart(2, "0")}:${min}`,
              timeParams: {
                ampm: isPm ? "PM" : "AM",
                hour: String(h).padStart(2, "0"),
                minute: min,
                selectedDays: ["MON", "TUE", "WED", "THU", "FRI"],
                repeatType: "WEEKDAYS",
              },
            },
          ]);
          setActions([
            {
              id: "sys-act-schedule",
              type: "SCHEDULE",
              title: "학사일정 알림",
              subtitle: `${scopeText} • ${advText} 알림`,
              iconBg: "#3b82f6",
              scheduleParams: { scope, advanceDays: adv },
            },
          ]);
        } else if (systemType === "school-notice") {
          const schoolKws = allKw.filter((k) => k.type === "SCHOOL_NOTICE");
          const incKws = schoolKws.filter((k) => !k.isExcluded).map((k) => k.keyword || "").filter(Boolean);
          const excKws = schoolKws.filter((k) => k.isExcluded).map((k) => k.keyword || "").filter(Boolean);
          const catText =
            subCats.length > 0
              ? `${subCats.slice(0, 2).join(", ")}${subCats.length > 2 ? ` 외 ${subCats.length - 2}개` : ""}`
              : "전체 카테고리";
          const kwText = incKws.length > 0 ? ` • 키워드 ${incKws.length}개` : "";

          setTitle("학교 공지 알림");
          setSelectedIcon("notice");
          setSelectedColor("#5c9cf8");
          setTriggers([
            {
              id: "sys-trigger-school-notice",
              type: "SCHOOL_NOTICE",
              title: "새 학교 공지 등록 시",
              subtitle: "학교 대표 홈페이지에 새 공지가 올라올 때",
            },
          ]);
          setActions([
            {
              id: "sys-act-school-notice",
              type: "SCHOOL_NOTICE",
              title: "학교 공지 알림",
              subtitle: `${catText}${kwText}`,
              iconBg: "#5c9cf8",
              schoolNoticeParams: {
                categories: subCats,
                includeKeywords: incKws,
                excludeKeywords: excKws,
              },
            },
          ]);
        } else if (systemType === "dept-notice") {
          const deptKws = allKw.filter((k) => k.type === "DEPARTMENT");
          const subDeptCodes = subDepts.map((k) => (k as any).departmentCode || k.department || "").filter(Boolean);

          setTitle("학과 공지 알림");
          setSelectedIcon("dept");
          setSelectedColor("#ff7a00");
          setTriggers([
            {
              id: "sys-trigger-dept-notice",
              type: "DEPT_NOTICE",
              title: "새 학과 공지 등록 시",
              subtitle: "선택한 학과 홈페이지에 새 공지가 올라올 때",
            },
          ]);

          if (subDeptCodes.length > 0) {
            const deptActions: RoutineActionBlock[] = subDeptCodes.map((code) => {
              const foundDept = loadedDepts.find((d) => d.code === code);
              const dName = foundDept ? foundDept.name : code;
              const incKws = deptKws
                .filter((k) => !k.isExcluded && (k.department === dName || k.department === code || !k.department))
                .map((k) => k.keyword || "")
                .filter(Boolean);
              const excKws = deptKws
                .filter((k) => k.isExcluded && (k.department === dName || k.department === code || !k.department))
                .map((k) => k.keyword || "")
                .filter(Boolean);
              return {
                id: `sys-act-dept-${code}`,
                type: "DEPT_NOTICE",
                title: `${dName} 공지 알림`,
                subtitle: incKws.length > 0 ? `키워드: ${incKws.join(", ")}` : "새 공지 및 관심 키워드 알림",
                iconBg: "#ff7a00",
                deptNoticeParams: {
                  deptCode: code,
                  deptName: dName,
                  includeKeywords: incKws,
                  excludeKeywords: excKws,
                },
              };
            });
            setActions(deptActions);
          } else {
            const myDept = userInfo.department || "내 학과";
            const myCode = userInfo.departmentCode || "";
            const incKws = deptKws.filter((k) => !k.isExcluded).map((k) => k.keyword || "").filter(Boolean);
            const excKws = deptKws.filter((k) => k.isExcluded).map((k) => k.keyword || "").filter(Boolean);
            setActions([
              {
                id: "sys-act-dept-default",
                type: "DEPT_NOTICE",
                title: `${myDept} 공지 알림`,
                subtitle: incKws.length > 0 ? `키워드: ${incKws.join(", ")}` : "새 공지 및 관심 키워드 알림",
                iconBg: "#ff7a00",
                deptNoticeParams: {
                  deptCode: myCode,
                  deptName: myDept,
                  includeKeywords: incKws,
                  excludeKeywords: excKws,
                },
              },
            ]);
          }
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
  }, [id, isNew, isPreset, isSystemRoutine, systemType, userInfo, syncFormFromData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const headerTitle = useMemo(() => {
    if (isNew) return "새 루틴 만들기";
    if (isEditing) return isSystemRoutine ? "기본 루틴 설정" : "루틴 편집";
    return isSystemRoutine ? "기본 루틴" : "루틴 설정";
  }, [isNew, isEditing, isSystemRoutine]);

  useHeader({
    title: headerTitle,
    hasback: true,
    rightArea: null,
  });

  // 조건 추가 모달에서 보여줄 수 있는 트리거 목록 필터링 (공지 이벤트 vs 시간 브리핑 분리)
  const visibleTriggerOptions = useMemo(() => {
    const hasSchoolNoticeAction = actions.some((a) => a.type === "SCHOOL_NOTICE");
    const hasDeptNoticeAction = actions.some((a) => a.type === "DEPT_NOTICE");
    const hasTimeAction = actions.some((a) =>
      ["TIMETABLE", "SCHEDULE", "WEATHER", "BUS", "CAFETERIA"].includes(a.type)
    );
    const hasSchoolNoticeTrigger = triggers.some((t) => t.type === "SCHOOL_NOTICE");
    const hasDeptNoticeTrigger = triggers.some((t) => t.type === "DEPT_NOTICE");
    const hasTimeTrigger = triggers.some((t) =>
      ["TIME", "BEFORE_FIRST_CLASS", "BEFORE_CLASS", "AFTER_LAST_CLASS", "LONG_BREAK", "NO_CLASS_DAY"].includes(t.type)
    );

    // 1. 이미 학교 공지 관련 동작이나 트리거가 있는 경우 -> 학교 공지 트리거만 가능
    if (hasSchoolNoticeAction || hasSchoolNoticeTrigger) {
      return { time: false, schoolNotice: true, deptNotice: false };
    }
    // 2. 이미 학과 공지 관련 동작이나 트리거가 있는 경우 -> 학과 공지 트리거만 가능
    if (hasDeptNoticeAction || hasDeptNoticeTrigger) {
      return { time: false, schoolNotice: false, deptNotice: true };
    }
    // 3. 이미 시간/시간표 기반 동작이나 트리거가 있는 경우 -> 시간/시간표 트리거만 가능 (공지 이벤트 불가)
    if (hasTimeAction || hasTimeTrigger) {
      return { time: true, schoolNotice: false, deptNotice: false };
    }
    // 4. 초기 상태 -> 모든 조건 선택 가능
    return { time: true, schoolNotice: true, deptNotice: true };
  }, [triggers, actions]);

  // 동작 추가 모달에서 선택 가능한 동작 목록 필터링 (신규 이벤트 트리거와 시간 브리핑 상호 배타적 분리)
  const filteredAvailableActions = useMemo(() => {
    // 조건(Trigger)이 하나도 없으면 동작을 추가할 수 없음 (조건 선행 원칙)
    if (triggers.length === 0) return [];

    const hasSchoolNoticeTrigger = triggers.some((t) => t.type === "SCHOOL_NOTICE");
    const hasDeptNoticeTrigger = triggers.some((t) => t.type === "DEPT_NOTICE");
    const hasTimeTrigger = triggers.some((t) =>
      ["TIME", "BEFORE_FIRST_CLASS", "BEFORE_CLASS", "AFTER_LAST_CLASS", "LONG_BREAK", "NO_CLASS_DAY"].includes(t.type)
    );

    return AVAILABLE_ACTIONS.filter((action) => {
      // 1. 학교 공지 동작: 반드시 '새 학교 공지 등록 시' 트리거가 있을 때만 선택 가능
      if (action.id === "SCHOOL_NOTICE") {
        return hasSchoolNoticeTrigger && !hasDeptNoticeTrigger && !hasTimeTrigger;
      }
      // 2. 학과 공지 동작: 반드시 '새 학과 공지 등록 시' 트리거가 있을 때만 선택 가능
      if (action.id === "DEPT_NOTICE") {
        return hasDeptNoticeTrigger && !hasSchoolNoticeTrigger && !hasTimeTrigger;
      }
      // 3. 일반 시간/시간표 기반 동작 (TIMETABLE, SCHEDULE, WEATHER, BUS, CAFETERIA):
      // 시간/시간표 트리거가 있을 때만 가능
      if (hasTimeTrigger && !hasSchoolNoticeTrigger && !hasDeptNoticeTrigger) {
        return true;
      }
      return false;
    });
  }, [triggers]);

  // =========================================================================
  // 1. 트리거 조건 (Trigger) 핸들러
  // =========================================================================

  // 트리거 추가 선택 모달에서 특정 트리거 클릭
  const handleSelectTriggerType = (type: RoutineTriggerType) => {
    setIsTriggerSelectModalOpen(false);
    setEditingTriggerId("new");

    if (type === "TIME") {
      setModalAmpm("AM");
      setModalHour("08");
      setModalMinute("30");
      setModalSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);
      setIsTimeConditionModalOpen(true);
    } else if (type === "BEFORE_FIRST_CLASS") {
      setTempBeforeFirstClassMinutes(60);
      setIsBeforeFirstClassModalOpen(true);
    } else if (type === "BEFORE_CLASS") {
      setTempBeforeClassMinutes(10);
      setIsBeforeClassTriggerModalOpen(true);
    } else if (type === "AFTER_LAST_CLASS") {
      setTempAfterLastClassOffset(10);
      setIsAfterLastClassModalOpen(true);
    } else if (type === "LONG_BREAK") {
      setTempLongBreakMinGap(120);
      setIsLongBreakModalOpen(true);
    } else if (type === "NO_CLASS_DAY") {
      setTempNoClassDayAmpm("AM");
      setTempNoClassDayHour("10");
      setTempNoClassDayMinute("00");
      setIsNoClassDayModalOpen(true);
    } else if (type === "SCHOOL_NOTICE") {
      const newTrigger: RoutineTriggerCondition = {
        id: `trigger-school-${Date.now()}`,
        type: "SCHOOL_NOTICE",
        title: "새 학교 공지 등록 시",
        subtitle: "학교 대표 홈페이지에 새 공지가 올라올 때",
      };
      setTriggers((prev) => [...prev, newTrigger]);

      // 종속 동작 자동 연동: 학교 공지 동작이 없으면 추천 추가
      if (!actions.some((a) => a.type === "SCHOOL_NOTICE")) {
        const autoAction: RoutineActionBlock = {
          id: `act-school-${Date.now()}`,
          type: "SCHOOL_NOTICE",
          title: "학교 공지 알림",
          subtitle: "전체 카테고리 공지 알림",
          iconBg: "#5c9cf8",
          schoolNoticeParams: { categories: [], includeKeywords: [], excludeKeywords: [] },
        };
        setActions((prev) => [...prev, autoAction]);
      }
    } else if (type === "DEPT_NOTICE") {
      // 학과 선택 모달 열기
      setTempDeptCode(userInfo.departmentCode || "");
      setTempDeptName(userInfo.department || "학과 선택");
      setTempDeptIncludeKeywords([]);
      setTempDeptExcludeKeywords([]);
      setDeptSearchQuery("");
      setEditingActionId(null);
      setIsDeptActionModalOpen(true);
    }
  };

  // 시간 트리거 모달 저장
  const handleSaveTimeConditionModal = () => {
    if (modalSelectedDays.length === 0) {
      alert("최소 1개 이상의 요일을 선택해 주세요.");
      return;
    }

    let calculatedRepeatType: AgentReminderRepeatType = "WEEKDAYS";
    if (modalSelectedDays.length === 7) calculatedRepeatType = "EVERYDAY";
    else if (modalSelectedDays.length === 5 && ["MON", "TUE", "WED", "THU", "FRI"].every((d) => modalSelectedDays.includes(d))) calculatedRepeatType = "WEEKDAYS";
    else if (modalSelectedDays.length === 2 && ["SUN", "SAT"].every((d) => modalSelectedDays.includes(d))) calculatedRepeatType = "WEEKENDS";

    const daysSummary = formatDaysSummary(modalSelectedDays);
    const timeSubtitle = `${modalAmpm === "AM" ? "오전" : "오후"} ${modalHour}:${modalMinute}`;

    if (editingTriggerId === "new" || !editingTriggerId) {
      const newTrigger: RoutineTriggerCondition = {
        id: `trigger-time-${Date.now()}`,
        type: "TIME",
        title: `${daysSummary} 알림`,
        subtitle: timeSubtitle,
        timeParams: {
          ampm: modalAmpm,
          hour: modalHour,
          minute: modalMinute,
          selectedDays: modalSelectedDays,
          repeatType: calculatedRepeatType,
        },
      };
      setTriggers((prev) => [...prev, newTrigger]);
    } else if (editingTriggerId) {
      setTriggers((prev) =>
        prev.map((t) =>
          t.id === editingTriggerId
            ? {
                ...t,
                title: `${daysSummary} 알림`,
                subtitle: timeSubtitle,
                timeParams: {
                  ampm: modalAmpm,
                  hour: modalHour,
                  minute: modalMinute,
                  selectedDays: modalSelectedDays,
                  repeatType: calculatedRepeatType,
                },
              }
            : t,
        ),
      );
    }
    setIsTimeConditionModalOpen(false);
  };

  // 1. 당일 첫 수업 시작 전 트리거 저장
  const handleSaveBeforeFirstClassTrigger = () => {
    const isEdit = editingTriggerId && editingTriggerId !== "new";
    const newTrigger: RoutineTriggerCondition = {
      id: isEdit ? editingTriggerId! : `trigger-first-class-${Date.now()}`,
      type: "BEFORE_FIRST_CLASS",
      title: "당일 첫 수업 시작 전",
      subtitle: `첫 수업 시작 ${tempBeforeFirstClassMinutes}분 전`,
      beforeFirstClassParams: { minutes: tempBeforeFirstClassMinutes },
    };

    setTriggers((prev) => {
      if (isEdit) {
        return prev.map((t) => (t.id === editingTriggerId ? newTrigger : t));
      }
      return [...prev, newTrigger];
    });
    setIsBeforeFirstClassModalOpen(false);

    // 종속 동작: 시간표가 없으면 추천 추가
    if (!actions.some((a) => a.type === "TIMETABLE")) {
      const autoAction: RoutineActionBlock = {
        id: `act-timetable-${Date.now()}`,
        type: "TIMETABLE",
        title: "시간표 / 강의실",
        subtitle: "오늘 수업 시간표 및 강의실 위치",
        iconBg: "#a855f7",
      };
      setActions((prev) => [...prev, autoAction]);
    }
  };

  // 2. 강의 시작 전 트리거 저장
  const handleSaveBeforeClassTrigger = () => {
    const isEdit = editingTriggerId && editingTriggerId !== "new";
    const newTrigger: RoutineTriggerCondition = {
      id: isEdit ? editingTriggerId! : `trigger-before-class-${Date.now()}`,
      type: "BEFORE_CLASS",
      title: "각 수업 시작 전",
      subtitle: `수업 시작 ${tempBeforeClassMinutes}분 전`,
      beforeClassParams: { minutes: tempBeforeClassMinutes },
    };

    setTriggers((prev) => {
      if (isEdit) {
        return prev.map((t) => (t.id === editingTriggerId ? newTrigger : t));
      }
      return [...prev, newTrigger];
    });
    setIsBeforeClassTriggerModalOpen(false);

    // 종속 동작 자동 연동: 시간표 동작 추가
    if (!actions.some((a) => a.type === "TIMETABLE")) {
      const autoAction: RoutineActionBlock = {
        id: `act-timetable-${Date.now()}`,
        type: "TIMETABLE",
        title: "시간표 / 강의실",
        subtitle: "다음 수업 시간표 및 이동할 강의실 위치",
        iconBg: "#8b5cf6",
      };
      setActions((prev) => [...prev, autoAction]);
    }
  };

  // 3. 마지막 수업 종료 전/후 트리거 저장
  const handleSaveAfterLastClassTrigger = () => {
    const isEdit = editingTriggerId && editingTriggerId !== "new";
    const offsetLabel =
      tempAfterLastClassOffset < 0
        ? `종료 ${Math.abs(tempAfterLastClassOffset)}분 전`
        : tempAfterLastClassOffset === 0
        ? "종료 직후"
        : `종료 ${tempAfterLastClassOffset}분 후`;

    const newTrigger: RoutineTriggerCondition = {
      id: isEdit ? editingTriggerId! : `trigger-last-class-${Date.now()}`,
      type: "AFTER_LAST_CLASS",
      title: "마지막 수업 종료 전/후",
      subtitle: `마지막 수업 ${offsetLabel}`,
      afterLastClassParams: { offsetMinutes: tempAfterLastClassOffset },
    };

    setTriggers((prev) => {
      if (isEdit) {
        return prev.map((t) => (t.id === editingTriggerId ? newTrigger : t));
      }
      return [...prev, newTrigger];
    });
    setIsAfterLastClassModalOpen(false);

    // 종속 동작: 버스 알림이 없으면 하교 버스 추천 연동
    if (!actions.some((a) => a.type === "BUS")) {
      const autoAction: RoutineActionBlock = {
        id: `act-bus-${Date.now()}`,
        type: "BUS",
        title: "실시간 버스",
        subtitle: "인천대 정문",
        iconBg: "#ff7a00",
        busParams: { stopName: "인천대 정문" },
      };
      setActions((prev) => [...prev, autoAction]);
    }
  };

  // 4. 긴 공강 시작 시 트리거 저장
  const handleSaveLongBreakTrigger = () => {
    const isEdit = editingTriggerId && editingTriggerId !== "new";
    const hours = Math.floor(tempLongBreakMinGap / 60);
    const newTrigger: RoutineTriggerCondition = {
      id: isEdit ? editingTriggerId! : `trigger-long-break-${Date.now()}`,
      type: "LONG_BREAK",
      title: "공강 시작 시 알림",
      subtitle: `${hours}시간 이상 긴 공강 시작 시`,
      longBreakParams: { minGapMinutes: tempLongBreakMinGap },
    };

    setTriggers((prev) => {
      if (isEdit) {
        return prev.map((t) => (t.id === editingTriggerId ? newTrigger : t));
      }
      return [...prev, newTrigger];
    });
    setIsLongBreakModalOpen(false);

    // 종속 동작: 학식 알림 추천 연동
    if (!actions.some((a) => a.type === "CAFETERIA")) {
      const autoAction: RoutineActionBlock = {
        id: `act-cafe-${Date.now()}`,
        type: "CAFETERIA",
        title: "학식 식단",
        subtitle: "전체 식당 • 시간대별 자동",
        iconBg: "#22c55e",
        cafeteriaParams: { restaurant: "전체", mealType: "AUTO" },
      };
      setActions((prev) => [...prev, autoAction]);
    }
  };

  // 5. 수업 없는 공강일 브리핑 트리거 저장
  const handleSaveNoClassDayTrigger = () => {
    const isEdit = editingTriggerId && editingTriggerId !== "new";
    let rawHour = parseInt(tempNoClassDayHour, 10);
    if (tempNoClassDayAmpm === "PM" && rawHour < 12) rawHour += 12;
    if (tempNoClassDayAmpm === "AM" && rawHour === 12) rawHour = 0;
    const finalTime = `${String(rawHour).padStart(2, "0")}:${tempNoClassDayMinute.padStart(2, "0")}`;
    const timeSubtitle = `${tempNoClassDayAmpm === "AM" ? "오전" : "오후"} ${tempNoClassDayHour}:${tempNoClassDayMinute}`;

    const newTrigger: RoutineTriggerCondition = {
      id: isEdit ? editingTriggerId! : `trigger-no-class-${Date.now()}`,
      type: "NO_CLASS_DAY",
      title: "수업 없는 공강일 브리핑",
      subtitle: `${timeSubtitle}에 여유 브리핑`,
      noClassDayParams: {
        time: finalTime,
        ampm: tempNoClassDayAmpm,
        hour: tempNoClassDayHour,
        minute: tempNoClassDayMinute,
      },
    };

    setTriggers((prev) => {
      if (isEdit) {
        return prev.map((t) => (t.id === editingTriggerId ? newTrigger : t));
      }
      return [...prev, newTrigger];
    });
    setIsNoClassDayModalOpen(false);

    // 종속 동작: 학사일정 추천 연동
    if (!actions.some((a) => a.type === "SCHEDULE")) {
      const autoAction: RoutineActionBlock = {
        id: `act-schedule-${Date.now()}`,
        type: "SCHEDULE",
        title: "학사일정 알림",
        subtitle: "학교 및 학과 전체 • 당일 사전 알림",
        iconBg: "#3b82f6",
        scheduleParams: { scope: "ALL", advanceDays: 0 },
      };
      setActions((prev) => [...prev, autoAction]);
    }
  };

  // 트리거 삭제 시 동작과의 정합성 유지 (조건이 사라지면 종속된 동작도 자동 정리)
  const handleRemoveTrigger = (triggerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTriggers = triggers.filter((t) => t.id !== triggerId);
    setTriggers(newTriggers);

    if (newTriggers.length === 0) {
      // 모든 조건이 삭제되면 동작도 모두 초기화 (조건 없는 동작 불가)
      setActions([]);
    } else {
      // 남은 조건과 호환되지 않는 동작들 필터링
      const hasSchoolNotice = newTriggers.some((t) => t.type === "SCHOOL_NOTICE");
      const hasDeptNotice = newTriggers.some((t) => t.type === "DEPT_NOTICE");
      const hasTime = newTriggers.some((t) =>
        ["TIME", "BEFORE_FIRST_CLASS", "BEFORE_CLASS", "AFTER_LAST_CLASS", "LONG_BREAK", "NO_CLASS_DAY"].includes(t.type)
      );

      setActions((prevActions) =>
        prevActions.filter((act) => {
          if (act.type === "SCHOOL_NOTICE") return hasSchoolNotice;
          if (act.type === "DEPT_NOTICE") return hasDeptNotice;
          return hasTime;
        })
      );
    }
  };

  // =========================================================================
  // 2. 동작 블록 (Action) 핸들러
  // =========================================================================

  // 동작 추가 모달에서 액션 선택
  const handleSelectActionType = (type: RoutineActionType) => {
    setIsActionSelectModalOpen(false);
    setEditingActionId(null);

    if (type === "DEPT_NOTICE") {
      setTempDeptCode(userInfo.departmentCode || "");
      setTempDeptName(userInfo.department || "학과 선택");
      setTempDeptIncludeKeywords([]);
      setTempDeptExcludeKeywords([]);
      setDeptSearchQuery("");
      setIsDeptActionModalOpen(true);
    } else if (type === "SCHOOL_NOTICE") {
      setTempSchoolCategories([]);
      setTempSchoolIncludeKeywords([]);
      setTempSchoolExcludeKeywords([]);
      setIsSchoolNoticeActionModalOpen(true);
    } else if (type === "BUS") {
      setTempBusStop("인천대입구역 1번출구");
      setIsBusActionModalOpen(true);
    } else if (type === "CAFETERIA") {
      setTempCafeteria("전체");
      setTempMealType("AUTO");
      setIsCafeteriaActionModalOpen(true);
    } else if (type === "SCHEDULE") {
      setTempScheduleScope("ALL");
      setTempScheduleAdvanceDays(1);
      setIsScheduleActionModalOpen(true);
    } else if (type === "TIMETABLE") {
      const newAction: RoutineActionBlock = {
        id: `act-time-${Date.now()}`,
        type: "TIMETABLE",
        title: "시간표 / 강의실",
        subtitle: "오늘 수업 시간표 및 강의실 위치",
        iconBg: "#a855f7",
      };
      setActions((prev) => [...prev, newAction]);
    } else if (type === "WEATHER") {
      const newAction: RoutineActionBlock = {
        id: `act-weather-${Date.now()}`,
        type: "WEATHER",
        title: "캠퍼스 날씨",
        subtitle: "송도 캠퍼스 오늘 날씨 예보",
        iconBg: "#5c9cf8",
      };
      setActions((prev) => [...prev, newAction]);
    }
  };

  // 학과 공지 동작 저장 (학과 선택 + 독립 키워드 설정)
  const handleSaveDeptActionModal = () => {
    if (!tempDeptName || tempDeptName === "학과 선택") {
      alert("공지사항을 수신할 학과를 선택해 주세요.");
      return;
    }

    const kwDesc =
      tempDeptIncludeKeywords.length > 0
        ? `키워드: ${tempDeptIncludeKeywords.join(", ")}`
        : "새 공지 및 관심 키워드 알림";

    if (editingActionId) {
      setActions((prev) =>
        prev.map((a) =>
          a.id === editingActionId
            ? {
                ...a,
                title: `${tempDeptName} 공지 알림`,
                subtitle: kwDesc,
                deptNoticeParams: {
                  deptCode: tempDeptCode,
                  deptName: tempDeptName,
                  includeKeywords: tempDeptIncludeKeywords,
                  excludeKeywords: tempDeptExcludeKeywords,
                },
              }
            : a,
        ),
      );
      // 트리거 조건 중 학과 공지 트리거도 동일한 학과로 동기화
      setTriggers((prev) =>
        prev.map((t) =>
          t.type === "DEPT_NOTICE"
            ? {
                ...t,
                title: `새 학과 공지 등록 시 (${tempDeptName})`,
                subtitle: `${tempDeptName} 홈페이지에 새 공지가 올라올 때`,
                deptParams: { deptCode: tempDeptCode, deptName: tempDeptName },
              }
            : t,
        ),
      );
    } else {
      const newAction: RoutineActionBlock = {
        id: `act-dept-${Date.now()}`,
        type: "DEPT_NOTICE",
        title: `${tempDeptName} 공지 알림`,
        subtitle: kwDesc,
        iconBg: "#ff7a00",
        deptNoticeParams: {
          deptCode: tempDeptCode,
          deptName: tempDeptName,
          includeKeywords: tempDeptIncludeKeywords,
          excludeKeywords: tempDeptExcludeKeywords,
        },
      };
      setActions((prev) => [...prev, newAction]);

      // 만약 트리거에 학과 공지 조건이 없다면 자동으로 '새 학과 공지 등록 시' 트리거도 연계 추가
      if (!triggers.some((t) => t.type === "DEPT_NOTICE")) {
        const autoTrigger: RoutineTriggerCondition = {
          id: `trigger-dept-${Date.now()}`,
          type: "DEPT_NOTICE",
          title: `새 학과 공지 등록 시 (${tempDeptName})`,
          subtitle: `${tempDeptName} 홈페이지에 새 공지가 올라올 때`,
          deptParams: { deptCode: tempDeptCode, deptName: tempDeptName },
        };
        setTriggers((prev) => [...prev, autoTrigger]);
      }
    }
    setIsDeptActionModalOpen(false);
  };

  // 학교 공지 동작 저장
  const handleSaveSchoolNoticeActionModal = () => {
    const catDesc =
      tempSchoolCategories.length > 0
        ? `${tempSchoolCategories.slice(0, 2).join(", ")}${tempSchoolCategories.length > 2 ? ` 외 ${tempSchoolCategories.length - 2}개` : ""}`
        : "전체 카테고리";
    const kwDesc =
      tempSchoolIncludeKeywords.length > 0
        ? ` • 키워드 ${tempSchoolIncludeKeywords.length}개`
        : "";

    if (editingActionId) {
      setActions((prev) =>
        prev.map((a) =>
          a.id === editingActionId
            ? {
                ...a,
                title: "학교 공지 알림",
                subtitle: `${catDesc}${kwDesc}`,
                schoolNoticeParams: {
                  categories: tempSchoolCategories,
                  includeKeywords: tempSchoolIncludeKeywords,
                  excludeKeywords: tempSchoolExcludeKeywords,
                },
              }
            : a,
        ),
      );
    } else {
      const newAction: RoutineActionBlock = {
        id: `act-school-${Date.now()}`,
        type: "SCHOOL_NOTICE",
        title: "학교 공지 알림",
        subtitle: `${catDesc}${kwDesc}`,
        iconBg: "#5c9cf8",
        schoolNoticeParams: {
          categories: tempSchoolCategories,
          includeKeywords: tempSchoolIncludeKeywords,
          excludeKeywords: tempSchoolExcludeKeywords,
        },
      };
      setActions((prev) => [...prev, newAction]);
    }
    setIsSchoolNoticeActionModalOpen(false);
  };

  // 버스 동작 저장
  const handleSaveBusActionModal = () => {
    if (editingActionId) {
      setActions((prev) =>
        prev.map((a) =>
          a.id === editingActionId
            ? {
                ...a,
                title: "실시간 버스",
                subtitle: tempBusStop,
                busParams: { stopName: tempBusStop },
              }
            : a,
        ),
      );
    } else {
      const newAction: RoutineActionBlock = {
        id: `act-bus-${Date.now()}`,
        type: "BUS",
        title: "실시간 버스",
        subtitle: tempBusStop,
        iconBg: "#ff7a00",
        busParams: { stopName: tempBusStop },
      };
      setActions((prev) => [...prev, newAction]);
    }
    setIsBusActionModalOpen(false);
  };

  // 학식 동작 저장
  const handleSaveCafeteriaActionModal = () => {
    const mealLabel = tempMealType === "DINNER" ? "석식" : tempMealType === "LUNCH" ? "중식" : "시간대별 자동";
    const sub = `${tempCafeteria} • ${mealLabel}`;

    if (editingActionId) {
      setActions((prev) =>
        prev.map((a) =>
          a.id === editingActionId
            ? {
                ...a,
                title: "학식 식단",
                subtitle: sub,
                cafeteriaParams: { restaurant: tempCafeteria, mealType: tempMealType },
              }
            : a,
        ),
      );
    } else {
      const newAction: RoutineActionBlock = {
        id: `act-cafe-${Date.now()}`,
        type: "CAFETERIA",
        title: "학식 식단",
        subtitle: sub,
        iconBg: "#22c55e",
        cafeteriaParams: { restaurant: tempCafeteria, mealType: tempMealType },
      };
      setActions((prev) => [...prev, newAction]);
    }
    setIsCafeteriaActionModalOpen(false);
  };

  // 학사일정 동작 저장
  const handleSaveScheduleActionModal = () => {
    const scopeLabel =
      tempScheduleScope === "SCHOOL_ONLY"
        ? "학교 공식만"
        : tempScheduleScope === "DEPT_ONLY"
        ? "내 학과만"
        : "학교 및 학과 전체";
    const advanceLabel = tempScheduleAdvanceDays === 0 ? "당일" : `${tempScheduleAdvanceDays}일 전`;
    const sub = `${scopeLabel} • ${advanceLabel} 사전 알림`;

    if (editingActionId) {
      setActions((prev) =>
        prev.map((a) =>
          a.id === editingActionId
            ? {
                ...a,
                title: "학사일정 알림",
                subtitle: sub,
                scheduleParams: { scope: tempScheduleScope, advanceDays: tempScheduleAdvanceDays },
              }
            : a,
        ),
      );
    } else {
      const newAction: RoutineActionBlock = {
        id: `act-schedule-${Date.now()}`,
        type: "SCHEDULE",
        title: "학사일정 알림",
        subtitle: sub,
        iconBg: "#3b82f6",
        scheduleParams: { scope: tempScheduleScope, advanceDays: tempScheduleAdvanceDays },
      };
      setActions((prev) => [...prev, newAction]);
    }
    setIsScheduleActionModalOpen(false);
  };

  // 동작 카드 클릭 시 세부 모달 오픈
  const handleOpenActionDetail = (action: RoutineActionBlock) => {
    if (!isEditing && !isSystemRoutine) return;
    setEditingActionId(action.id);

    if (action.type === "DEPT_NOTICE") {
      setTempDeptCode(action.deptNoticeParams?.deptCode || userInfo.departmentCode || "");
      setTempDeptName(action.deptNoticeParams?.deptName || userInfo.department || "컴퓨터공학부");
      setTempDeptIncludeKeywords(action.deptNoticeParams?.includeKeywords || []);
      setTempDeptExcludeKeywords(action.deptNoticeParams?.excludeKeywords || []);
      setDeptSearchQuery("");
      setIsDeptActionModalOpen(true);
    } else if (action.type === "SCHOOL_NOTICE") {
      setTempSchoolCategories(action.schoolNoticeParams?.categories || []);
      setTempSchoolIncludeKeywords(action.schoolNoticeParams?.includeKeywords || []);
      setTempSchoolExcludeKeywords(action.schoolNoticeParams?.excludeKeywords || []);
      setIsSchoolNoticeActionModalOpen(true);
    } else if (action.type === "BUS") {
      setTempBusStop(action.busParams?.stopName || "인천대입구역 1번출구");
      setIsBusActionModalOpen(true);
    } else if (action.type === "CAFETERIA") {
      setTempCafeteria(action.cafeteriaParams?.restaurant || "전체");
      setTempMealType(action.cafeteriaParams?.mealType || "AUTO");
      setIsCafeteriaActionModalOpen(true);
    } else if (action.type === "SCHEDULE") {
      setTempScheduleScope(action.scheduleParams?.scope || "ALL");
      setTempScheduleAdvanceDays(action.scheduleParams?.advanceDays ?? 1);
      setIsScheduleActionModalOpen(true);
    }
  };

  // 동작 삭제
  const handleRemoveAction = (actionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActions((prev) => prev.filter((a) => a.id !== actionId));
  };

  // =========================================================================
  // 3. 루틴 저장 & 삭제 & 테스트 핸들러
  // =========================================================================

  const handleSaveEdit = async () => {
    if (!title.trim()) {
      alert("루틴 이름을 입력해 주세요.");
      return;
    }
    if (triggers.length === 0) {
      alert("언제 알림을 받을지 조건을 최소 1개 이상 추가해 주세요.");
      return;
    }
    if (actions.length === 0) {
      alert("어떤 알림을 받을지 동작을 최소 1개 이상 추가해 주세요.");
      return;
    }

    if (isSystemRoutine) {
      setIsSaving(true);
      try {
        if (systemType === "timetable-brief") {
          const timeTrig = triggers.find((t) => t.type === "TIME");
          if (timeTrig && timeTrig.timeParams) {
            let rawHour = parseInt(timeTrig.timeParams.hour, 10);
            if (timeTrig.timeParams.ampm === "PM" && rawHour < 12) rawHour += 12;
            if (timeTrig.timeParams.ampm === "AM" && rawHour === 12) rawHour = 0;
            const finalTime = `${String(rawHour).padStart(2, "0")}:${timeTrig.timeParams.minute.padStart(2, "0")}`;
            await updateDailyBriefSettings({ timetableDailyBriefTime: finalTime });
          }
          alert("당일 시간표 브리핑 설정을 저장했어요!");
        } else if (systemType === "timetable-pre") {
          const preTrig = triggers.find((t) => t.type === "BEFORE_CLASS");
          if (preTrig && preTrig.beforeClassParams) {
            await updateDailyBriefSettings({ timetablePreAlertMinutes: preTrig.beforeClassParams.minutes });
          }
          alert("강의 시작 전 알림 설정을 저장했어요!");
        } else if (systemType === "timetable-nowbar") {
          const preTrig = triggers.find((t) => t.type === "BEFORE_CLASS");
          const lead = preTrig?.beforeClassParams?.minutes || 15;
          await setTimetableNowBarSettings({ leadTimeMinutes: lead, enabled: true });
          alert("실시간 시간표 & Now Bar 설정을 저장했어요!");
        } else if (systemType === "schedule") {
          const timeTrig = triggers.find((t) => t.type === "TIME");
          const schedAct = actions.find((a) => a.type === "SCHEDULE");
          let finalTime = "08:30";
          if (timeTrig && timeTrig.timeParams) {
            let rawHour = parseInt(timeTrig.timeParams.hour, 10);
            if (timeTrig.timeParams.ampm === "PM" && rawHour < 12) rawHour += 12;
            if (timeTrig.timeParams.ampm === "AM" && rawHour === 12) rawHour = 0;
            finalTime = `${String(rawHour).padStart(2, "0")}:${timeTrig.timeParams.minute.padStart(2, "0")}`;
          }
          await updateDailyBriefSettings({
            scheduleDailyBriefTime: finalTime,
            scheduleScope: schedAct?.scheduleParams?.scope || "ALL",
            advanceDays: schedAct?.scheduleParams?.advanceDays ?? 1,
          });
          alert("학사일정 알림 설정을 저장했어요!");
        } else if (systemType === "school-notice") {
          const schoolAct = actions.find((a) => a.type === "SCHOOL_NOTICE");
          if (schoolAct && schoolAct.schoolNoticeParams) {
            await subscribeKeywordsNotice(schoolAct.schoolNoticeParams.categories || []);
          }
          alert("학교 공지 알림 설정을 저장했어요!");
        } else if (systemType === "dept-notice") {
          const deptActs = actions.filter((a) => a.type === "DEPT_NOTICE");
          const deptCodes = deptActs
            .map((a) => a.deptNoticeParams?.deptCode)
            .filter(Boolean) as string[];
          if (deptCodes.length > 0) {
            await subscribeSchoolDepartment(deptCodes);
          }
          alert("학과 공지 알림 설정을 저장했어요!");
        }
        notifyRoutineUpdated();
        setIsEditing(false);
      } catch (error) {
        console.error("시스템 루틴 저장 실패:", error);
        alert("설정을 저장하지 못했어요.");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const toolParams: Record<string, any> = {
      iconType: selectedIcon,
      iconBg: selectedColor,
      triggers,
      actions,
    };

    const cafeAction = actions.find((a) => a.type === "CAFETERIA");
    if (cafeAction && cafeAction.cafeteriaParams) {
      toolParams.cafeteria = cafeAction.cafeteriaParams.restaurant || (cafeAction.cafeteriaParams as any).cafeteria;
      toolParams.mealType = cafeAction.cafeteriaParams.mealType;
    }
    const busAction = actions.find((a) => a.type === "BUS");
    if (busAction && busAction.busParams) {
      toolParams.stopName = busAction.busParams.stopName;
    }

    // 타겟 도구 목록
    const targetToolsList = actions.map((a) => a.type);
    const targetTool = targetToolsList.join(",");

    // 시간 트리거들 추출
    const timeTriggers = triggers.filter((t) => t.type === "TIME" && t.timeParams);
    const schedules: RoutineScheduleItem[] = timeTriggers.map((t) => {
      const p = t.timeParams!;
      let rawHour = parseInt(p.hour, 10);
      if (p.ampm === "PM" && rawHour < 12) rawHour += 12;
      if (p.ampm === "AM" && rawHour === 12) rawHour = 0;
      const finalTime = `${String(rawHour).padStart(2, "0")}:${p.minute.padStart(2, "0")}`;
      return {
        days: p.selectedDays,
        time: finalTime,
        repeatType: p.repeatType,
      };
    });

    const schedulesJson = schedules.length > 0 ? JSON.stringify(schedules) : "";
    const primaryTime = schedules[0]?.time || "08:30";
    const primaryRepeatType = schedules[0]?.repeatType || "WEEKDAYS";
    const toolParamsJson = JSON.stringify(toolParams);

    setIsSaving(true);
    try {
      if (isNew || isPreset) {
        await createAgentReminder({
          title: title.trim(),
          targetTime: primaryTime,
          repeatType: primaryRepeatType,
          targetTool: targetTool || "TIMETABLE",
          toolParamsJson,
          schedulesJson,
          titleTemplate: `🔔 ${title.trim()}`,
          bodyTemplate: "",
          route: "/home",
        });
        alert(`'${title.trim()}' 루틴을 저장했어요!`);
        trackEvent("[Daily Brief] 맞춤 루틴 생성", { title: title.trim() });
        notifyRoutineUpdated();
        navigate(-1);
      } else if (reminder) {
        await updateAgentReminder(reminder.id, {
          title: title.trim(),
          targetTime: primaryTime,
          repeatType: primaryRepeatType,
          targetTool: targetTool || "TIMETABLE",
          toolParamsJson,
          schedulesJson,
          enabled: reminder.enabled,
        });
        alert(`'${title.trim()}' 루틴을 수정했어요!`);
        trackEvent("[Daily Brief] 맞춤 루틴 수정", { id: reminder.id, title: title.trim() });
        notifyRoutineUpdated();
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
      setIsEditing(false);
      loadData();
      return;
    }
    syncFormFromData(reminder, preset);
    setIsEditing(false);
  };

  const handleSavePresetDirect = async () => {
    if (!preset) return;
    try {
      await createAgentReminder({
        title: preset.title,
        targetTime: preset.targetTime,
        repeatType: preset.repeatType,
        targetTool: preset.targetTools.join(","),
        toolParamsJson: JSON.stringify(preset.toolParams || {}),
        schedulesJson: JSON.stringify([
          {
            days: preset.repeatType === "WEEKDAYS" ? ["MON", "TUE", "WED", "THU", "FRI"] : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
            time: preset.targetTime,
            repeatType: preset.repeatType,
          },
        ]),
        titleTemplate: `🔔 ${preset.title}`,
        bodyTemplate: "",
        route: "/home",
      });
      alert(`'${preset.title}' 루틴을 내 루틴에 등록했어요!`);
      trackEvent("[Daily Brief] 프리셋 루틴 등록", { title: preset.title });
      notifyRoutineUpdated();
      navigate(-1);
    } catch (error) {
      console.error("루틴 등록 실패:", error);
      alert("루틴을 등록하지 못했어요.");
    }
  };

  const handleDelete = async () => {
    if (isSystemRoutine) {
      setIsDeleteModalOpen(false);
      try {
        if (systemType === "timetable-brief") {
          await updateDailyBriefSettings({ timetableDailyBriefEnabled: false });
        } else if (systemType === "timetable-pre") {
          await updateDailyBriefSettings({ timetablePreAlertEnabled: false });
        } else if (systemType === "timetable-nowbar") {
          await setTimetableNowBarSettings({ enabled: false });
        } else if (systemType === "schedule") {
          await updateDailyBriefSettings({ scheduleAlertEnabled: false });
        } else if (systemType === "school-notice") {
          setIsSchoolNoticeEnabled(false);
        } else if (systemType === "dept-notice") {
          setIsDeptNoticeEnabled(false);
        }
        trackEvent("[Daily Brief] 시스템 루틴 삭제/해제", { systemType });
        notifyRoutineUpdated();
        navigate(-1);
      } catch (error) {
        console.error("시스템 루틴 해제 실패:", error);
        alert("루틴을 해제하지 못했어요.");
      }
      return;
    }

    if (!reminder) return;
    setIsDeleteModalOpen(false);
    try {
      await deleteAgentReminder(reminder.id);
      trackEvent("[Daily Brief] 맞춤 루틴 삭제", { id: reminder.id, title: reminder.title });
      notifyRoutineUpdated();
      navigate(-1);
    } catch (error) {
      console.error("루틴 삭제 실패:", error);
      alert("루틴을 삭제하지 못했어요.");
    }
  };

  const handleTestDispatch = async () => {
    setIsTesting(true);
    try {
      if (isSystemRoutine) {
        if (systemType === "timetable-brief") {
          await testCustomAgentReminder({
            title: "당일 강의 & 시간표 브리핑",
            targetTool: "TIMETABLE",
            titleTemplate: "📅 오늘의 시간표 브리핑",
            bodyTemplate: "",
            route: "/timetable",
          });
        } else if (systemType === "timetable-pre") {
          await testCustomAgentReminder({
            title: "강의 시작 전 알림",
            targetTool: "TIMETABLE",
            titleTemplate: "🔔 강의 시작 전 알림",
            bodyTemplate: "",
            route: "/timetable",
          });
        } else if (systemType === "timetable-nowbar") {
          const ok = await testTimetableNowBar({
            title: "컴퓨터네트워크 (모의 수업)",
            location: "정보기술대학 7호관 314호",
            professor: "홍길동 교수님",
            minutes: 75,
          });
          if (ok) {
            alert("테스트 Now Bar & Dynamic Island가 실행되었습니다!\n(휴대폰 잠금화면, AOD 또는 상단 상태표시줄을 확인해 보세요)");
          } else {
            alert("모바일 앱(INTIP 앱) 환경에서만 실시간 Now Bar를 띄울 수 있습니다.");
          }
          return;
        } else if (systemType === "schedule") {
          await testCustomAgentReminder({
            title: "학사일정 알림",
            targetTool: "SCHEDULE",
            titleTemplate: "🎓 주요 학사일정 안내",
            bodyTemplate: "",
            route: "/schedule",
          });
        } else if (systemType === "school-notice") {
          await testCustomAgentReminder({
            title: "학교 공지사항 알림",
            targetTool: "NOTICE",
            titleTemplate: "📢 학교 새 공지사항",
            bodyTemplate: "",
            route: "/notices",
          });
        } else {
          await testCustomAgentReminder({
            title: "학과 공지사항 알림",
            targetTool: "DEPT_NOTICE",
            toolParamsJson: JSON.stringify({ deptCode: userInfo.departmentCode }),
            titleTemplate: "🏢 학과 새 공지사항",
            bodyTemplate: "",
            route: "/notices",
          });
        }
        alert("테스트 알림을 발송했어요!\n(기기 상단 알림창을 확인해 보세요)");
        return;
      }

      if (reminder) {
        await testAgentReminder(reminder.id);
        alert(`'${reminder.title}' 테스트 알림을 보냈어요!\n(기기 상단 알림창을 확인해 보세요)`);
        trackEvent("[Daily Brief] 맞춤 루틴 테스트 발송", { id: reminder.id, title: reminder.title });
        return;
      }

      // 프리셋 또는 저장 전 루틴인 경우 현재 구성된 데이터로 즉시 발송
      const targetToolsList = actions.map((a) => a.type);
      const targetTool = targetToolsList.join(",") || preset?.targetTools?.join(",") || "TIMETABLE";
      const toolParams: Record<string, any> = {
        triggers,
        actions,
      };
      const cafeAction = actions.find((a) => a.type === "CAFETERIA");
      if (cafeAction && cafeAction.cafeteriaParams) {
        toolParams.cafeteria = cafeAction.cafeteriaParams.restaurant || (cafeAction.cafeteriaParams as any).cafeteria;
        toolParams.mealType = cafeAction.cafeteriaParams.mealType;
      }
      const busAction = actions.find((a) => a.type === "BUS");
      if (busAction && busAction.busParams) {
        toolParams.stopName = busAction.busParams.stopName;
      }

      await testCustomAgentReminder({
        title: title.trim() || preset?.title || "AI 맞춤 루틴",
        targetTool,
        toolParamsJson: JSON.stringify(toolParams),
        titleTemplate: `🔔 ${title.trim() || preset?.title || "AI 맞춤 알림"}`,
        bodyTemplate: "",
        route: "/home",
      });

      alert(`'${title.trim() || preset?.title || "AI 맞춤 알림"}' 테스트 알림을 보냈어요!\n(기기 상단 알림창을 확인해 보세요)`);
    } catch (error) {
      console.error("테스트 발송 실패:", error);
      alert("테스트 알림 발송 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsTesting(false);
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

  // Helper for rendering action icons
  const renderActionIcon = (type: RoutineActionType, _iconBg?: string) => {
    switch (type) {
      case "DEPT_NOTICE":
        return <Building2 size={24} color="#ff7a00" />;
      case "SCHOOL_NOTICE":
        return <Bell size={24} color="#5c9cf8" />;
      case "TIMETABLE":
        return <Calendar size={24} color="#a855f7" />;
      case "TIMETABLE_NOWBAR":
        return <GraduationCap size={24} color="#0055D4" />;
      case "SCHEDULE":
        return <GraduationCap size={24} color="#3b82f6" />;
      case "WEATHER":
        return <Sun size={24} color="#5c9cf8" />;
      case "BUS":
        return <Bus size={24} color="#ff7a00" />;
      case "CAFETERIA":
        return <Utensils size={24} color="#22c55e" />;
      default:
        return <Sparkles size={24} color="#5c9cf8" />;
    }
  };

  const renderTriggerIcon = (type: RoutineTriggerType) => {
    switch (type) {
      case "TIME":
        return <Clock size={24} color="#3b82f6" />;
      case "BEFORE_FIRST_CLASS":
        return <Sun size={24} color="#f59e0b" />;
      case "BEFORE_CLASS":
        return <Clock size={24} color="#8b5cf6" />;
      case "AFTER_LAST_CLASS":
        return <Moon size={24} color="#6366f1" />;
      case "LONG_BREAK":
        return <Coffee size={24} color="#10b981" />;
      case "NO_CLASS_DAY":
        return <Smile size={24} color="#ec4899" />;
      case "SCHOOL_NOTICE":
        return <Bell size={24} color="#5c9cf8" />;
      case "DEPT_NOTICE":
        return <Building2 size={24} color="#ff7a00" />;
      default:
        return <Clock size={24} color="#111827" />;
    }
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

  const displayTitle = title || (reminder ? reminder.title : preset?.title || "나만의 루틴");
  const displayDesc = isSystemRoutine
    ? systemType === "timetable-brief"
      ? dailyBriefSettings.timetableDailyBriefEnabled
        ? `매일 아침 ${dailyBriefSettings.timetableDailyBriefTime || "08:00"}에 오늘 수업 시간표와 강의실 위치를 알려드려요.`
        : "당일 시간표 브리핑 알림이 꺼져 있어요."
      : systemType === "timetable-pre"
      ? dailyBriefSettings.timetablePreAlertEnabled
        ? `각 수업 시작 ${dailyBriefSettings.timetablePreAlertMinutes || 10}분 전에 다음 강의실 위치를 알려드려요.`
        : "강의 시작 전 알림이 꺼져 있어요."
      : systemType === "schedule"
      ? dailyBriefSettings.scheduleAlertEnabled
        ? `매일 아침 ${dailyBriefSettings.scheduleDailyBriefTime || "08:30"}에 ${dailyBriefSettings.advanceDays === 0 ? "당일" : `${dailyBriefSettings.advanceDays || 1}일 전`} 주요 학사일정을 알려드려요.`
        : "학사일정 알림이 꺼져 있어요."
      : systemType === "school-notice"
      ? isSchoolNoticeEnabled
        ? "학교 새 공지와 설정한 관심 키워드 알림을 받아요."
        : "학교 공지 알림이 꺼져 있어요."
      : isDeptNoticeEnabled
      ? `${userInfo.department ? `${userInfo.department} 새 공지와 관심 키워드 알림을 받아요.` : "내 학과 새 공지와 관심 키워드 알림을 받아요."}`
      : "학과 공지 알림이 꺼져 있어요."
    : triggers.length > 0 && actions.length > 0
    ? `${triggers[0]?.title}에 ${actions.map((a) => a.title).join(" • ")} 알림을 받아요.`
    : preset?.description || "언제 어떤 캠퍼스 알림을 받을지 자유롭게 조합해 보세요.";

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
                  placeholder="루틴 이름을 입력해 주세요 (예: 등교길 알리미)"
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
                    systemType === "timetable-brief" ? (
                      <CapsuleButton
                        variant={dailyBriefSettings.timetableDailyBriefEnabled ? "primary" : "secondary"}
                        onClick={async () => {
                          const next = !dailyBriefSettings.timetableDailyBriefEnabled;
                          setDailyBriefSettings((prev) => ({ ...prev, timetableDailyBriefEnabled: next }));
                          await updateDailyBriefSettings({ timetableDailyBriefEnabled: next });
                        }}
                        style={{ padding: "8px 24px", fontSize: "14.5px", fontWeight: 700, height: "40px", borderRadius: "9999px" }}
                      >
                        {dailyBriefSettings.timetableDailyBriefEnabled ? "루틴 끄기" : "루틴 켜기"}
                      </CapsuleButton>
                    ) : systemType === "timetable-pre" ? (
                      <CapsuleButton
                        variant={dailyBriefSettings.timetablePreAlertEnabled ? "primary" : "secondary"}
                        onClick={async () => {
                          const next = !dailyBriefSettings.timetablePreAlertEnabled;
                          setDailyBriefSettings((prev) => ({ ...prev, timetablePreAlertEnabled: next }));
                          await updateDailyBriefSettings({ timetablePreAlertEnabled: next });
                        }}
                        style={{ padding: "8px 24px", fontSize: "14.5px", fontWeight: 700, height: "40px", borderRadius: "9999px" }}
                      >
                        {dailyBriefSettings.timetablePreAlertEnabled ? "루틴 끄기" : "루틴 켜기"}
                      </CapsuleButton>
                    ) : systemType === "schedule" ? (
                      <CapsuleButton
                        variant={dailyBriefSettings.scheduleAlertEnabled ? "primary" : "secondary"}
                        onClick={async () => {
                          const next = !dailyBriefSettings.scheduleAlertEnabled;
                          setDailyBriefSettings((prev) => ({ ...prev, scheduleAlertEnabled: next }));
                          await updateDailyBriefSettings({ scheduleAlertEnabled: next });
                        }}
                        style={{ padding: "8px 24px", fontSize: "14.5px", fontWeight: 700, height: "40px", borderRadius: "9999px" }}
                      >
                        {dailyBriefSettings.scheduleAlertEnabled ? "루틴 끄기" : "루틴 켜기"}
                      </CapsuleButton>
                    ) : systemType === "school-notice" ? (
                      <CapsuleButton
                        variant={isSchoolNoticeEnabled ? "primary" : "secondary"}
                        onClick={() => setIsSchoolNoticeEnabled(!isSchoolNoticeEnabled)}
                        style={{ padding: "8px 24px", fontSize: "14.5px", fontWeight: 700, height: "40px", borderRadius: "9999px" }}
                      >
                        {isSchoolNoticeEnabled ? "루틴 끄기" : "루틴 켜기"}
                      </CapsuleButton>
                    ) : (
                      <CapsuleButton
                        variant={isDeptNoticeEnabled ? "primary" : "secondary"}
                        onClick={() => setIsDeptNoticeEnabled(!isDeptNoticeEnabled)}
                        style={{ padding: "8px 24px", fontSize: "14.5px", fontWeight: 700, height: "40px", borderRadius: "9999px" }}
                      >
                        {isDeptNoticeEnabled ? "루틴 끄기" : "루틴 켜기"}
                      </CapsuleButton>
                    )
                  ) : reminder ? (
                    <CapsuleButton
                      variant={reminder.enabled ? "primary" : "secondary"}
                      onClick={async () => {
                        const next = !reminder.enabled;
                        setReminder({ ...reminder, enabled: next });
                        await toggleAgentReminder(reminder.id, next);
                      }}
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
         * 1. 언제 실행할까요? (IF Trigger Conditions)
         * ========================================================================= */}
        <DetailSection>
          <DetailSectionHeader>언제 실행할까요?</DetailSectionHeader>

          {triggers.length === 0 ? (
            <EmptyGuideCard>
              <EmptyGuideIconCircle>
                <Clock size={20} color="#94a3b8" />
              </EmptyGuideIconCircle>
              <EmptyGuideText>
                <EmptyGuideTitle>설정된 실행 조건이 없어요</EmptyGuideTitle>
                <EmptyGuideSub>특정 시간, 수업 전후, 공지 등록 등 실행할 조건을 추가해 주세요.</EmptyGuideSub>
              </EmptyGuideText>
            </EmptyGuideCard>
          ) : (
            triggers.map((trig) => (
              <OneUiCard
                key={trig.id}
                $isInteractive={isEditing}
                onClick={() => {
                  if (!isEditing) return;
                  setEditingTriggerId(trig.id);
                  if (trig.type === "TIME" && trig.timeParams) {
                    setModalAmpm(trig.timeParams.ampm);
                    setModalHour(trig.timeParams.hour);
                    setModalMinute(trig.timeParams.minute);
                    setModalSelectedDays(trig.timeParams.selectedDays);
                    setIsTimeConditionModalOpen(true);
                  } else if (trig.type === "BEFORE_FIRST_CLASS") {
                    setTempBeforeFirstClassMinutes(trig.beforeFirstClassParams?.minutes || 60);
                    setIsBeforeFirstClassModalOpen(true);
                  } else if (trig.type === "BEFORE_CLASS") {
                    setTempBeforeClassMinutes(trig.beforeClassParams?.minutes || 10);
                    setIsBeforeClassTriggerModalOpen(true);
                  } else if (trig.type === "AFTER_LAST_CLASS") {
                    setTempAfterLastClassOffset(trig.afterLastClassParams?.offsetMinutes ?? 10);
                    setIsAfterLastClassModalOpen(true);
                  } else if (trig.type === "LONG_BREAK") {
                    setTempLongBreakMinGap(trig.longBreakParams?.minGapMinutes || 120);
                    setIsLongBreakModalOpen(true);
                  } else if (trig.type === "NO_CLASS_DAY") {
                    setTempNoClassDayAmpm(trig.noClassDayParams?.ampm || "AM");
                    setTempNoClassDayHour(trig.noClassDayParams?.hour || "10");
                    setTempNoClassDayMinute(trig.noClassDayParams?.minute || "00");
                    setIsNoClassDayModalOpen(true);
                  }
                }}
              >
                {isEditing && <Ripple color="rgba(0, 0, 0, 0.06)" />}
                <CardIconWrapper>{renderTriggerIcon(trig.type)}</CardIconWrapper>

                <CardContent>
                  <CardMainText>{trig.title}</CardMainText>
                  <CardBlueText>{trig.subtitle}</CardBlueText>
                </CardContent>

                {isEditing && (
                  <MinusButton
                    data-no-ripple="true"
                    type="button"
                    onClick={(e) => handleRemoveTrigger(trig.id, e)}
                    title="조건 삭제"
                  >
                    <Minus size={18} color="#ef4444" strokeWidth={3} />
                  </MinusButton>
                )}
              </OneUiCard>
            ))
          )}

          {isEditing && (
            <AddConditionCard onClick={() => setIsTriggerSelectModalOpen(true)}>
              <Ripple color="rgba(16, 185, 129, 0.12)" />
              <Plus size={18} color="#10b981" strokeWidth={2.5} />
              <span>조건 추가</span>
            </AddConditionCard>
          )}
        </DetailSection>

        {/* =========================================================================
         * 2. 무엇을 할까요? (THEN Action Blocks)
         * ========================================================================= */}
        <DetailSection>
          <DetailSectionHeader>무엇을 할까요?</DetailSectionHeader>

          {actions.length === 0 ? (
            <EmptyGuideCard>
              <EmptyGuideIconCircle>
                <Bell size={20} color="#94a3b8" />
              </EmptyGuideIconCircle>
              <EmptyGuideText>
                {triggers.length === 0 ? (
                  <>
                    <EmptyGuideTitle>조건을 먼저 추가해 주세요</EmptyGuideTitle>
                    <EmptyGuideSub>설정된 실행 조건에 맞춰 가능한 실행 동작을 선택할 수 있어요.</EmptyGuideSub>
                  </>
                ) : (
                  <>
                    <EmptyGuideTitle>선택된 실행 동작이 없어요</EmptyGuideTitle>
                    <EmptyGuideSub>시간표 브리핑, 실시간 Now Bar, 공지사항, 버스, 학식 등 실행할 동작을 추가해 주세요.</EmptyGuideSub>
                  </>
                )}
              </EmptyGuideText>
            </EmptyGuideCard>
          ) : (
            actions.map((act) => (
              <OneUiCard
                key={act.id}
                $isInteractive={isEditing}
                onClick={() => {
                  if (!isEditing) return;
                  handleOpenActionDetail(act);
                }}
              >
                {isEditing && <Ripple color="rgba(0, 0, 0, 0.04)" />}
                <CardIconWrapper>{renderActionIcon(act.type, act.iconBg)}</CardIconWrapper>

                <CardContent>
                  <CardMainText>{act.title}</CardMainText>
                  <CardBlueText>{act.subtitle}</CardBlueText>
                </CardContent>

                {isEditing && (
                  <MinusButton
                    data-no-ripple="true"
                    type="button"
                    onClick={(e) => handleRemoveAction(act.id, e)}
                    title="동작 삭제"
                  >
                    <Minus size={18} color="#ef4444" strokeWidth={3} />
                  </MinusButton>
                )}
              </OneUiCard>
            ))
          )}

          {isEditing && (
            <AddConditionCard
              onClick={() => {
                if (triggers.length === 0) {
                  alert("언제 알림을 받을지 조건을 먼저 추가해 주세요.");
                  setIsTriggerSelectModalOpen(true);
                  return;
                }
                setIsActionSelectModalOpen(true);
              }}
            >
              <Ripple color="rgba(59, 130, 246, 0.12)" />
              <Plus size={18} color="#3b82f6" strokeWidth={2.5} />
              <span>동작 추가</span>
            </AddConditionCard>
          )}
        </DetailSection>
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

          {isSystemRoutine ? (
            <PillActionButton onClick={() => setIsDeleteModalOpen(true)}>
              <Ripple color="rgba(239, 68, 68, 0.12)" />
              <Trash2 size={20} color="#ef4444" />
              <span style={{ color: "#ef4444" }}>삭제</span>
            </PillActionButton>
          ) : reminder ? (
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
       * 트리거 선택 모달
       * ========================================================================= */}
      <Modal
        isOpen={isTriggerSelectModalOpen}
        onClose={() => setIsTriggerSelectModalOpen(false)}
        title="조건 추가 (언제 알림을 받을까요?)"
        description="알림을 받을 조건을 선택해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsTriggerSelectModalOpen(false),
        }}
      >
        <ModalOptionsList style={{ maxHeight: "420px", overflowY: "auto", paddingRight: "2px" }}>
          {/* 1. 고정 시간 */}
          {visibleTriggerOptions.time && (
            <ModalOptionItem onClick={() => handleSelectTriggerType("TIME")}>
              <Ripple color="rgba(37, 99, 235, 0.1)" />
              <OptionIconTextRow>
                <Clock size={20} color="#3b82f6" />
                <div>
                  <ModalOptionText>특정 시간</ModalOptionText>
                  <CardSubDesc>원하는 시간과 요일에 맞춰 알림</CardSubDesc>
                </div>
              </OptionIconTextRow>
              <Plus size={18} color="#3b82f6" />
            </ModalOptionItem>
          )}

          {/* 2. 당일 첫 수업 시작 전 */}
          {visibleTriggerOptions.time && (
            <ModalOptionItem onClick={() => handleSelectTriggerType("BEFORE_FIRST_CLASS")}>
              <Ripple color="rgba(245, 158, 11, 0.1)" />
              <OptionIconTextRow>
                <Sun size={20} color="#f59e0b" />
                <div>
                  <ModalOptionText>당일 첫 수업 시작 전</ModalOptionText>
                  <CardSubDesc>오늘 첫 수업 시간과 강의실 사전 안내</CardSubDesc>
                </div>
              </OptionIconTextRow>
              <Plus size={18} color="#f59e0b" />
            </ModalOptionItem>
          )}

          {/* 3. 각 수업 시작 전 */}
          {visibleTriggerOptions.time && (
            <ModalOptionItem onClick={() => handleSelectTriggerType("BEFORE_CLASS")}>
              <Ripple color="rgba(139, 92, 246, 0.1)" />
              <OptionIconTextRow>
                <Clock size={20} color="#8b5cf6" />
                <div>
                  <ModalOptionText>각 수업 시작 전 알림</ModalOptionText>
                  <CardSubDesc>매 수업 시작 전 다음 강의실 위치 안내</CardSubDesc>
                </div>
              </OptionIconTextRow>
              <Plus size={18} color="#8b5cf6" />
            </ModalOptionItem>
          )}

          {/* 4. 마지막 수업 종료 전/후 */}
          {visibleTriggerOptions.time && (
            <ModalOptionItem onClick={() => handleSelectTriggerType("AFTER_LAST_CLASS")}>
              <Ripple color="rgba(99, 102, 241, 0.1)" />
              <OptionIconTextRow>
                <Moon size={20} color="#6366f1" />
                <div>
                  <ModalOptionText>마지막 수업 종료 전/후</ModalOptionText>
                  <CardSubDesc>하교 시점 버스 도착 및 주변 정보</CardSubDesc>
                </div>
              </OptionIconTextRow>
              <Plus size={18} color="#6366f1" />
            </ModalOptionItem>
          )}

          {/* 5. 긴 공강 시작 시 */}
          {visibleTriggerOptions.time && (
            <ModalOptionItem onClick={() => handleSelectTriggerType("LONG_BREAK")}>
              <Ripple color="rgba(16, 185, 129, 0.1)" />
              <OptionIconTextRow>
                <Coffee size={20} color="#10b981" />
                <div>
                  <ModalOptionText>공강 시작 시 알림</ModalOptionText>
                  <CardSubDesc>2시간 이상 비는 긴 공강 시작 시 학식/카페 정보</CardSubDesc>
                </div>
              </OptionIconTextRow>
              <Plus size={18} color="#10b981" />
            </ModalOptionItem>
          )}

          {/* 6. 수업 없는 공강일 브리핑 */}
          {visibleTriggerOptions.time && (
            <ModalOptionItem onClick={() => handleSelectTriggerType("NO_CLASS_DAY")}>
              <Ripple color="rgba(236, 72, 153, 0.1)" />
              <OptionIconTextRow>
                <Smile size={20} color="#ec4899" />
                <div>
                  <ModalOptionText>수업 없는 공강일 브리핑</ModalOptionText>
                  <CardSubDesc>수업이 없는 날 여유로운 오전 브리핑</CardSubDesc>
                </div>
              </OptionIconTextRow>
              <Plus size={18} color="#ec4899" />
            </ModalOptionItem>
          )}

          {/* 7. 학과 공지 */}
          {visibleTriggerOptions.deptNotice && (
            <ModalOptionItem onClick={() => handleSelectTriggerType("DEPT_NOTICE")}>
              <Ripple color="rgba(255, 122, 0, 0.1)" />
              <OptionIconTextRow>
                <Building2 size={20} color="#ff7a00" />
                <div>
                  <ModalOptionText>새 학과 공지 등록 시</ModalOptionText>
                  <CardSubDesc>선택한 학과 홈페이지에 새 공지가 올라올 때</CardSubDesc>
                </div>
              </OptionIconTextRow>
              <Plus size={18} color="#ff7a00" />
            </ModalOptionItem>
          )}

          {/* 8. 학교 공지 */}
          {visibleTriggerOptions.schoolNotice && (
            <ModalOptionItem onClick={() => handleSelectTriggerType("SCHOOL_NOTICE")}>
              <Ripple color="rgba(92, 156, 248, 0.1)" />
              <OptionIconTextRow>
                <Bell size={20} color="#5c9cf8" />
                <div>
                  <ModalOptionText>새 학교 공지 등록 시</ModalOptionText>
                  <CardSubDesc>학교 대표 홈페이지에 새 공지가 올라올 때</CardSubDesc>
                </div>
              </OptionIconTextRow>
              <Plus size={18} color="#5c9cf8" />
            </ModalOptionItem>
          )}
        </ModalOptionsList>
      </Modal>

      {/* 1. 시간 트리거 설정 모달 */}
      <Modal
        isOpen={isTimeConditionModalOpen}
        onClose={() => setIsTimeConditionModalOpen(false)}
        title={editingTriggerId === "new" ? "알림 시간 설정" : "알림 시간 수정"}
        description="Daily Brief 알림을 받을 시간과 반복할 요일을 설정해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsTimeConditionModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveTimeConditionModal,
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
                  onClick={() => {
                    setModalSelectedDays((prev) =>
                      prev.includes(day.key)
                        ? prev.length === 1 ? prev : prev.filter((d) => d !== day.key)
                        : [...prev, day.key],
                    );
                  }}
                >
                  <Ripple color={isSelected ? "rgba(255, 255, 255, 0.25)" : "rgba(37, 99, 235, 0.1)"} />
                  {day.label}
                </DayCircleButton>
              );
            })}
          </DayCircleRow>
        </TimePickerModalContent>
      </Modal>

      {/* 2. 당일 첫 수업 시작 전 모달 */}
      <Modal
        isOpen={isBeforeFirstClassModalOpen}
        onClose={() => setIsBeforeFirstClassModalOpen(false)}
        title="당일 첫 수업 시작 전 알림"
        description="첫 수업 시작 몇 분 전에 알림을 받을지 선택해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsBeforeFirstClassModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveBeforeFirstClassTrigger,
        }}
      >
        <ModalOptionsList>
          {BEFORE_FIRST_CLASS_OPTIONS.map((opt) => (
            <ModalOptionItem
              key={opt.value}
              $selected={tempBeforeFirstClassMinutes === opt.value}
              onClick={() => setTempBeforeFirstClassMinutes(opt.value)}
            >
              <Ripple color="rgba(37, 99, 235, 0.1)" />
              <ModalOptionText $selected={tempBeforeFirstClassMinutes === opt.value}>
                {opt.label}
              </ModalOptionText>
              {tempBeforeFirstClassMinutes === opt.value && <Check size={18} color="#2563eb" strokeWidth={3} />}
            </ModalOptionItem>
          ))}
        </ModalOptionsList>
      </Modal>

      {/* 3. 각 수업 시작 전 트리거 모달 */}
      <Modal
        isOpen={isBeforeClassTriggerModalOpen}
        onClose={() => setIsBeforeClassTriggerModalOpen(false)}
        title="각 수업 시작 전 알림 시간"
        description="수업 시작 몇 분 전에 알림을 받을지 선택해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsBeforeClassTriggerModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveBeforeClassTrigger,
        }}
      >
        <ModalOptionsList>
          {PRE_ALERT_OPTIONS.map((opt) => (
            <ModalOptionItem
              key={opt.value}
              $selected={tempBeforeClassMinutes === opt.value}
              onClick={() => setTempBeforeClassMinutes(opt.value)}
            >
              <Ripple color="rgba(37, 99, 235, 0.1)" />
              <ModalOptionText $selected={tempBeforeClassMinutes === opt.value}>
                {opt.label}
              </ModalOptionText>
              {tempBeforeClassMinutes === opt.value && <Check size={18} color="#2563eb" strokeWidth={3} />}
            </ModalOptionItem>
          ))}
        </ModalOptionsList>
      </Modal>

      {/* 4. 마지막 수업 종료 전/후 모달 */}
      <Modal
        isOpen={isAfterLastClassModalOpen}
        onClose={() => setIsAfterLastClassModalOpen(false)}
        title="마지막 수업 종료 전/후 알림"
        description="당일 마지막 수업 종료 시점을 기준으로 언제 알림을 받을지 선택해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsAfterLastClassModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveAfterLastClassTrigger,
        }}
      >
        <ModalOptionsList>
          {AFTER_LAST_CLASS_OPTIONS.map((opt) => (
            <ModalOptionItem
              key={opt.value}
              $selected={tempAfterLastClassOffset === opt.value}
              onClick={() => setTempAfterLastClassOffset(opt.value)}
            >
              <Ripple color="rgba(37, 99, 235, 0.1)" />
              <ModalOptionText $selected={tempAfterLastClassOffset === opt.value}>
                {opt.label}
              </ModalOptionText>
              {tempAfterLastClassOffset === opt.value && <Check size={18} color="#2563eb" strokeWidth={3} />}
            </ModalOptionItem>
          ))}
        </ModalOptionsList>
      </Modal>

      {/* 5. 긴 공강 시작 시 모달 */}
      <Modal
        isOpen={isLongBreakModalOpen}
        onClose={() => setIsLongBreakModalOpen(false)}
        title="공강 시작 시 알림 조건"
        description="몇 시간 이상 비는 공강이 생겼을 때 알림을 받을지 선택해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsLongBreakModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveLongBreakTrigger,
        }}
      >
        <ModalOptionsList>
          {LONG_BREAK_OPTIONS.map((opt) => (
            <ModalOptionItem
              key={opt.value}
              $selected={tempLongBreakMinGap === opt.value}
              onClick={() => setTempLongBreakMinGap(opt.value)}
            >
              <Ripple color="rgba(37, 99, 235, 0.1)" />
              <ModalOptionText $selected={tempLongBreakMinGap === opt.value}>
                {opt.label}
              </ModalOptionText>
              {tempLongBreakMinGap === opt.value && <Check size={18} color="#2563eb" strokeWidth={3} />}
            </ModalOptionItem>
          ))}
        </ModalOptionsList>
      </Modal>

      {/* 6. 수업 없는 공강일 브리핑 모달 */}
      <Modal
        isOpen={isNoClassDayModalOpen}
        onClose={() => setIsNoClassDayModalOpen(false)}
        title="공강일 브리핑 시간 설정"
        description="수업이 없는 공강일에 알림을 받을 시간을 설정해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsNoClassDayModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveNoClassDayTrigger,
        }}
      >
        <TimePickerModalContent>
          <PickerRow>
            <AmPmToggle>
              <AmPmButton
                $active={tempNoClassDayAmpm === "AM"}
                onClick={() => setTempNoClassDayAmpm("AM")}
                type="button"
              >
                <Ripple color={tempNoClassDayAmpm === "AM" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.08)"} />
                오전
              </AmPmButton>
              <AmPmButton
                $active={tempNoClassDayAmpm === "PM"}
                onClick={() => setTempNoClassDayAmpm("PM")}
                type="button"
              >
                <Ripple color={tempNoClassDayAmpm === "PM" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.08)"} />
                오후
              </AmPmButton>
            </AmPmToggle>

            <TimeInputGroup>
              <TimeSelect
                value={tempNoClassDayHour}
                onChange={(e) => setTempNoClassDayHour(e.target.value)}
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
                value={tempNoClassDayMinute}
                onChange={(e) => setTempNoClassDayMinute(e.target.value)}
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
      </Modal>

      {/* =========================================================================
       * 동작 선택 모달 (Action Select Modal)
       * ========================================================================= */}
      <Modal
        isOpen={isActionSelectModalOpen}
        onClose={() => setIsActionSelectModalOpen(false)}
        title="동작 추가 (어떤 알림을 받을까요?)"
        description="알림으로 수신할 동작을 선택해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsActionSelectModalOpen(false),
        }}
      >
        <ModalOptionsList style={{ maxHeight: "380px", overflowY: "auto", paddingRight: "2px" }}>
          {filteredAvailableActions.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "#64748b", fontSize: "14px", lineHeight: "1.5" }}>
              현재 설정된 조건과 호환되는 추가 동작이 없습니다.
            </div>
          ) : (
            filteredAvailableActions.map((action) => (
              <ModalOptionItem key={action.id} onClick={() => handleSelectActionType(action.id)}>
                <Ripple color="rgba(37, 99, 235, 0.1)" />
                <OptionIconTextRow>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: action.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {React.cloneElement(action.icon, { size: 18, color: "#ffffff" })}
                  </div>
                  <div>
                    <ModalOptionText>{action.title}</ModalOptionText>
                    <CardSubDesc>{action.description}</CardSubDesc>
                  </div>
                </OptionIconTextRow>
                <Plus size={18} color="#3b82f6" />
              </ModalOptionItem>
            ))
          )}
        </ModalOptionsList>
      </Modal>

      {/* =========================================================================
       * 세부 동작 설정 모달들 (Action Config Modals)
       * ========================================================================= */}

      {/* 1. 학과 공지 동작 모달 (특정 학과 선택 + 해당 학과 전용 키워드 설정) */}
      <Modal
        isOpen={isDeptActionModalOpen}
        onClose={() => setIsDeptActionModalOpen(false)}
        title="학과 공지 알림 설정"
        description="공지 알림을 받을 학과를 선택하고, 관심/제외 키워드를 설정해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsDeptActionModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveDeptActionModal,
        }}
      >
        <DeptModalWrapper>
          <ModalSectionLabel>대상 학과 선택 (단일 선택)</ModalSectionLabel>
          <SearchInputWrapper>
            <Search size={16} color="#94a3b8" />
            <SearchInput
              type="text"
              placeholder="학과 이름 검색 (예: 컴퓨터, 경영, 전자)"
              value={deptSearchQuery}
              onChange={(e) => setDeptSearchQuery(e.target.value)}
            />
          </SearchInputWrapper>

          <DeptListScrollContainer style={{ maxHeight: "160px" }}>
            {allDepartments
              .filter((d) => d.name.toLowerCase().includes(deptSearchQuery.trim().toLowerCase()))
              .slice()
              .sort((a, b) => {
                const aSelected = tempDeptCode === a.code || tempDeptName === a.name;
                const bSelected = tempDeptCode === b.code || tempDeptName === b.name;
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;

                const aMy = userInfo.departmentCode === a.code || userInfo.department === a.name;
                const bMy = userInfo.departmentCode === b.code || userInfo.department === b.name;
                if (aMy && !bMy) return -1;
                if (!aMy && bMy) return 1;

                return a.name.localeCompare(b.name, "ko");
              })
              .map((dept) => {
                const isSelected = tempDeptCode === dept.code || tempDeptName === dept.name;
                const isMyMajor = userInfo.departmentCode === dept.code || userInfo.department === dept.name;
                return (
                  <DeptListItem
                    key={dept.code}
                    $checked={isSelected}
                    onClick={() => {
                      setTempDeptCode(dept.code);
                      setTempDeptName(dept.name);
                    }}
                  >
                    <Ripple color="rgba(37, 99, 235, 0.1)" />
                    <CustomCheckCircle $checked={isSelected}>
                      {isSelected && <Check size={12} color="#ffffff" strokeWidth={3.5} />}
                    </CustomCheckCircle>
                    <DeptNameText $checked={isSelected}>
                      {dept.name}
                      {isSelected ? (
                        <SelectedBadge style={{ marginLeft: 6 }}>선택됨</SelectedBadge>
                      ) : isMyMajor ? (
                        <MyMajorBadge style={{ marginLeft: 6 }}>내 학과</MyMajorBadge>
                      ) : null}
                    </DeptNameText>
                  </DeptListItem>
                );
              })}
          </DeptListScrollContainer>

          <ModalSectionLabel style={{ marginTop: "12px" }}>
            {tempDeptName ? `[${tempDeptName}] 키워드 알림 설정` : "키워드 알림 설정"}
          </ModalSectionLabel>

          <KeywordSectionCard style={{ padding: "14px" }}>
            <KeywordHeaderRow>
              <KeywordTabGroup>
                <KeywordTabBtn
                  $active={deptKeywordTab === "include"}
                  onClick={() => setDeptKeywordTab("include")}
                >
                  관심 키워드 ({tempDeptIncludeKeywords.length})
                </KeywordTabBtn>
                <KeywordTabBtn
                  $active={deptKeywordTab === "exclude"}
                  onClick={() => setDeptKeywordTab("exclude")}
                >
                  제외 키워드 ({tempDeptExcludeKeywords.length})
                </KeywordTabBtn>
              </KeywordTabGroup>
            </KeywordHeaderRow>

            <KeywordInputRow>
              <KeywordModalInput
                type="text"
                placeholder={deptKeywordTab === "include" ? "관심 키워드 입력 (예: 캡스톤, 졸업)" : "제외할 키워드 입력"}
                value={deptKeywordInput}
                onChange={(e) => setDeptKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && deptKeywordInput.trim()) {
                    e.preventDefault();
                    if (deptKeywordTab === "include") {
                      if (!tempDeptIncludeKeywords.includes(deptKeywordInput.trim())) {
                        setTempDeptIncludeKeywords([...tempDeptIncludeKeywords, deptKeywordInput.trim()]);
                      }
                    } else {
                      if (!tempDeptExcludeKeywords.includes(deptKeywordInput.trim())) {
                        setTempDeptExcludeKeywords([...tempDeptExcludeKeywords, deptKeywordInput.trim()]);
                      }
                    }
                    setDeptKeywordInput("");
                  }
                }}
              />
              <CapsuleButton
                variant="primary"
                style={{ height: "42px", padding: "0 16px", borderRadius: "12px", whiteSpace: "nowrap" }}
                onClick={() => {
                  if (!deptKeywordInput.trim()) return;
                  if (deptKeywordTab === "include") {
                    if (!tempDeptIncludeKeywords.includes(deptKeywordInput.trim())) {
                      setTempDeptIncludeKeywords([...tempDeptIncludeKeywords, deptKeywordInput.trim()]);
                    }
                  } else {
                    if (!tempDeptExcludeKeywords.includes(deptKeywordInput.trim())) {
                      setTempDeptExcludeKeywords([...tempDeptExcludeKeywords, deptKeywordInput.trim()]);
                    }
                  }
                  setDeptKeywordInput("");
                }}
              >
                추가
              </CapsuleButton>
            </KeywordInputRow>

            <KeywordChipsContainer>
              {(deptKeywordTab === "include" ? tempDeptIncludeKeywords : tempDeptExcludeKeywords).map((kw) => (
                <KeywordChip key={kw} $isExclude={deptKeywordTab === "exclude"}>
                  <span>{deptKeywordTab === "exclude" ? `-${kw}` : `#${kw}`}</span>
                  <ChipDeleteBtn
                    onClick={() => {
                      if (deptKeywordTab === "include") {
                        setTempDeptIncludeKeywords(tempDeptIncludeKeywords.filter((k) => k !== kw));
                      } else {
                        setTempDeptExcludeKeywords(tempDeptExcludeKeywords.filter((k) => k !== kw));
                      }
                    }}
                  >
                    <X size={13} color="#64748b" />
                  </ChipDeleteBtn>
                </KeywordChip>
              ))}
            </KeywordChipsContainer>
          </KeywordSectionCard>
        </DeptModalWrapper>
      </Modal>

      {/* 2. 학교 공지 동작 모달 (카테고리 + 키워드) */}
      <Modal
        isOpen={isSchoolNoticeActionModalOpen}
        onClose={() => setIsSchoolNoticeActionModalOpen(false)}
        title="학교 공지 알림 설정"
        description="구독할 공지 카테고리와 키워드를 설정해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsSchoolNoticeActionModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveSchoolNoticeActionModal,
        }}
      >
        <CategoryModalWrapper>
          <ModalSectionLabel>구독 카테고리 (미선택 시 전체)</ModalSectionLabel>
          <ModalCheckboxGrid style={{ maxHeight: "160px" }}>
            {schoolCategories.map((cat) => {
              const isSub = tempSchoolCategories.includes(cat);
              return (
                <CheckboxCard
                  key={cat}
                  $checked={isSub}
                  onClick={() => {
                    setTempSchoolCategories((prev) =>
                      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
                    );
                  }}
                >
                  <Ripple color="rgba(37, 99, 235, 0.1)" />
                  <CustomCheckCircle $checked={isSub}>
                    {isSub && <Check size={12} color="#ffffff" strokeWidth={3.5} />}
                  </CustomCheckCircle>
                  <CheckboxLabel $checked={isSub}>{cat}</CheckboxLabel>
                </CheckboxCard>
              );
            })}
          </ModalCheckboxGrid>

          <ModalSectionLabel style={{ marginTop: "10px" }}>학교 공지 키워드 설정</ModalSectionLabel>
          <KeywordSectionCard style={{ padding: "14px" }}>
            <KeywordHeaderRow>
              <KeywordTabGroup>
                <KeywordTabBtn
                  $active={schoolKeywordTab === "include"}
                  onClick={() => setSchoolKeywordTab("include")}
                >
                  관심 키워드 ({tempSchoolIncludeKeywords.length})
                </KeywordTabBtn>
                <KeywordTabBtn
                  $active={schoolKeywordTab === "exclude"}
                  onClick={() => setSchoolKeywordTab("exclude")}
                >
                  제외 키워드 ({tempSchoolExcludeKeywords.length})
                </KeywordTabBtn>
              </KeywordTabGroup>
            </KeywordHeaderRow>

            <KeywordInputRow>
              <KeywordModalInput
                type="text"
                placeholder={schoolKeywordTab === "include" ? "관심 키워드 입력 (예: 장학금, 수강신청)" : "제외할 키워드 입력"}
                value={schoolKeywordInput}
                onChange={(e) => setSchoolKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && schoolKeywordInput.trim()) {
                    e.preventDefault();
                    if (schoolKeywordTab === "include") {
                      if (!tempSchoolIncludeKeywords.includes(schoolKeywordInput.trim())) {
                        setTempSchoolIncludeKeywords([...tempSchoolIncludeKeywords, schoolKeywordInput.trim()]);
                      }
                    } else {
                      if (!tempSchoolExcludeKeywords.includes(schoolKeywordInput.trim())) {
                        setTempSchoolExcludeKeywords([...tempSchoolExcludeKeywords, schoolKeywordInput.trim()]);
                      }
                    }
                    setSchoolKeywordInput("");
                  }
                }}
              />
              <CapsuleButton
                variant="primary"
                style={{ height: "42px", padding: "0 16px", borderRadius: "12px", whiteSpace: "nowrap" }}
                onClick={() => {
                  if (!schoolKeywordInput.trim()) return;
                  if (schoolKeywordTab === "include") {
                    if (!tempSchoolIncludeKeywords.includes(schoolKeywordInput.trim())) {
                      setTempSchoolIncludeKeywords([...tempSchoolIncludeKeywords, schoolKeywordInput.trim()]);
                    }
                  } else {
                    if (!tempSchoolExcludeKeywords.includes(schoolKeywordInput.trim())) {
                      setTempSchoolExcludeKeywords([...tempSchoolExcludeKeywords, schoolKeywordInput.trim()]);
                    }
                  }
                  setSchoolKeywordInput("");
                }}
              >
                추가
              </CapsuleButton>
            </KeywordInputRow>

            <KeywordChipsContainer>
              {(schoolKeywordTab === "include" ? tempSchoolIncludeKeywords : tempSchoolExcludeKeywords).map((kw) => (
                <KeywordChip key={kw} $isExclude={schoolKeywordTab === "exclude"}>
                  <span>{schoolKeywordTab === "exclude" ? `-${kw}` : `#${kw}`}</span>
                  <ChipDeleteBtn
                    onClick={() => {
                      if (schoolKeywordTab === "include") {
                        setTempSchoolIncludeKeywords(tempSchoolIncludeKeywords.filter((k) => k !== kw));
                      } else {
                        setTempSchoolExcludeKeywords(tempSchoolExcludeKeywords.filter((k) => k !== kw));
                      }
                    }}
                  >
                    <X size={13} color="#64748b" />
                  </ChipDeleteBtn>
                </KeywordChip>
              ))}
            </KeywordChipsContainer>
          </KeywordSectionCard>
        </CategoryModalWrapper>
      </Modal>

      {/* 3. 버스 정류소 선택 모달 */}
      <Modal
        isOpen={isBusActionModalOpen}
        onClose={() => setIsBusActionModalOpen(false)}
        title="실시간 버스 정류소 선택"
        description="실시간 버스 도착 정보를 안내받을 정류소를 선택해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsBusActionModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveBusActionModal,
        }}
      >
        <ModalOptionsList>
          {BUS_STOP_OPTIONS.map((opt) => (
            <ModalOptionItem
              key={opt.value}
              $selected={tempBusStop === opt.value}
              onClick={() => setTempBusStop(opt.value)}
            >
              <Ripple color="rgba(37, 99, 235, 0.1)" />
              <ModalOptionText $selected={tempBusStop === opt.value}>{opt.label}</ModalOptionText>
              {tempBusStop === opt.value && <Check size={18} color="#2563eb" strokeWidth={3} />}
            </ModalOptionItem>
          ))}
        </ModalOptionsList>
      </Modal>

      {/* 4. 학식 식당 & 메뉴 선택 모달 */}
      <Modal
        isOpen={isCafeteriaActionModalOpen}
        onClose={() => setIsCafeteriaActionModalOpen(false)}
        title="학식 메뉴 알림 설정"
        description="메뉴를 확인할 식당과 식사 유형을 선택해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsCafeteriaActionModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveCafeteriaActionModal,
        }}
      >
        <ModalFormSection>
          <ModalSectionLabel>식당 선택</ModalSectionLabel>
          <InlineSelect value={tempCafeteria} onChange={(e) => setTempCafeteria(e.target.value)}>
            {CAFETERIA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </InlineSelect>

          <ModalSectionLabel style={{ marginTop: "14px" }}>식사 유형</ModalSectionLabel>
          <InlineSelect value={tempMealType} onChange={(e) => setTempMealType(e.target.value as any)}>
            <option value="AUTO">시간대별 자동 (아침/점심/저녁)</option>
            <option value="LUNCH">중식 (점심 메뉴)</option>
            <option value="DINNER">석식 (저녁 메뉴)</option>
          </InlineSelect>
        </ModalFormSection>
      </Modal>

      {/* 5. 학사일정 설정 모달 */}
      <Modal
        isOpen={isScheduleActionModalOpen}
        onClose={() => setIsScheduleActionModalOpen(false)}
        title="학사일정 알림 설정"
        description="학사일정 알림 범위 및 D-day 사전 알림을 설정해 주세요."
        secondaryButton={{
          text: "취소",
          onClick: () => setIsScheduleActionModalOpen(false),
        }}
        primaryButton={{
          text: "완료",
          variant: "primary",
          onClick: handleSaveScheduleActionModal,
        }}
      >
        <ModalFormSection>
          <ModalSectionLabel>알림 대상 범위</ModalSectionLabel>
          <InlineSelect value={tempScheduleScope} onChange={(e) => setTempScheduleScope(e.target.value as any)}>
            {SCHEDULE_SCOPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </InlineSelect>

          <ModalSectionLabel style={{ marginTop: "14px" }}>사전 알림 기준</ModalSectionLabel>
          <ModalOptionsList>
            {ADVANCE_DAYS_OPTIONS.map((opt) => (
              <ModalOptionItem
                key={opt.value}
                $selected={tempScheduleAdvanceDays === opt.value}
                onClick={() => setTempScheduleAdvanceDays(opt.value)}
              >
                <Ripple color="rgba(37, 99, 235, 0.1)" />
                <ModalOptionText $selected={tempScheduleAdvanceDays === opt.value}>{opt.label}</ModalOptionText>
                {tempScheduleAdvanceDays === opt.value && <Check size={18} color="#2563eb" strokeWidth={3} />}
              </ModalOptionItem>
            ))}
          </ModalOptionsList>
        </ModalFormSection>
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

      {/* 루틴 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={isSystemRoutine ? "루틴 끄기 / 초기화" : "루틴 삭제"}
        description={
          isSystemRoutine
            ? `'${title.trim() || "기본 루틴"}' 루틴을 끄시겠어요? 언제든 추천 목록에서 다시 켤 수 있어요.`
            : `'${reminder?.title || title.trim()}' 루틴을 정말 삭제할까요?`
        }
        secondaryButton={{
          text: "취소",
          onClick: () => setIsDeleteModalOpen(false),
        }}
        primaryButton={{
          text: isSystemRoutine ? "끄기" : "삭제",
          variant: "danger",
          onClick: handleDelete,
        }}
      />
    </PageWrapper>
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

const OneUiCard = styled.div<{ $isInteractive?: boolean }>`
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
  cursor: ${({ $isInteractive }) => ($isInteractive ? "pointer" : "default")};
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
  margin-top: 2px;
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
  padding: 0;
`;

const AddConditionCard = styled.button`
  background: #ffffff;
  border-radius: 20px;
  border: 1.5px dashed #cbd5e1;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-size: 14.5px;
  font-weight: 700;
  color: #10b981;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    border-color: #10b981;
    background: #f0fdf4;
  }
`;

const EmptyGuideCard = styled.div`
  background: #ffffff;
  border-radius: 22px;
  border: 1px dashed #cbd5e1;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const EmptyGuideIconCircle = styled.div`
  width: 44px;
  height: 44px;
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
  font-size: 15px;
  font-weight: 700;
  color: #334155;
`;

const EmptyGuideSub = styled.div`
  font-size: 13px;
  color: #94a3b8;
`;

const InlineSelect = styled.select`
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  font-size: 13.5px;
  font-weight: 600;
  color: #1f2937;
  outline: none;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: #3b82f6;
    background-color: #ffffff;
  }
`;

// Keywords & Categories Card
const KeywordSectionCard = styled.div`
  background: #f8fafc;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const KeywordHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const KeywordTabGroup = styled.div`
  display: flex;
  background: #e2e8f0;
  border-radius: 12px;
  padding: 3px;
  gap: 3px;
`;

const KeywordTabBtn = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#1e293b" : "#64748b")};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 9px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgba(0,0,0,0.08)" : "none")};
  transition: all 0.15s ease;
`;

const KeywordInputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
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
  padding: 6px 12px;
  border-radius: 10px;
  background: ${({ $isExclude }) => ($isExclude ? "#fef2f2" : "#ffffff")};
  border: 1px solid ${({ $isExclude }) => ($isExclude ? "#fecaca" : "#e2e8f0")};
  font-size: 13px;
  font-weight: 600;
  color: ${({ $isExclude }) => ($isExclude ? "#dc2626" : "#334155")};
`;

const ChipDeleteBtn = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

// Floating Actions
const FloatingActionPill = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: 1px solid #e9ecef;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.14);
  border-radius: 9999px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 100;
`;

const PillActionButton = styled.button`
  background: none;
  border: none;
  padding: 6px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  min-width: 52px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditFloatingPill = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: 1px solid #e9ecef;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-radius: 9999px;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  z-index: 100;
`;

const EditPillButton = styled.button<{ $isPrimary?: boolean }>`
  background: none;
  color: ${({ $isPrimary }) => ($isPrimary ? "#2563eb" : "#4b5563")};
  border: none;
  padding: 9px 24px;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 9999px;
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EditPillDivider = styled.div`
  width: 1px;
  height: 20px;
  background-color: #e5e7eb;
  margin: 0 4px;
`;

// Modal Contents
const ModalOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
`;

const ModalOptionItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 16px;
  background: ${({ $selected }) => ($selected ? "#eff6ff" : "#f8fafc")};
  border: 1.5px solid ${({ $selected }) => ($selected ? "#2563eb" : "#e2e8f0")};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.15s ease;
`;

const OptionIconTextRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModalOptionText = styled.span<{ $selected?: boolean }>`
  font-size: 15px;
  font-weight: ${({ $selected }) => ($selected ? 700 : 600)};
  color: ${({ $selected }) => ($selected ? "#1e40af" : "#1e293b")};
`;

const ModalFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ModalSectionLabel = styled.div`
  font-size: 13.5px;
  font-weight: 700;
  color: #475569;
`;

const CategoryModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ModalCheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  overflow-y: auto;
`;

const CheckboxCard = styled.div<{ $checked?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: ${({ $checked }) => ($checked ? "#eff6ff" : "#f8fafc")};
  border: 1.5px solid ${({ $checked }) => ($checked ? "#2563eb" : "#e2e8f0")};
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const CustomCheckCircle = styled.div<{ $checked?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ $checked }) => ($checked ? "#2563eb" : "#cbd5e1")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;
`;

const CheckboxLabel = styled.span<{ $checked?: boolean }>`
  font-size: 13.5px;
  font-weight: ${({ $checked }) => ($checked ? 700 : 500)};
  color: ${({ $checked }) => ($checked ? "#1e40af" : "#334155")};
`;

const DeptModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  border-radius: 14px;
  padding: 10px 14px;
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1e293b;
  width: 100%;

  &::placeholder {
    color: #94a3b8;
  }
`;

const DeptListScrollContainer = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 2px 0;
`;

const DeptListItem = styled.div<{ $checked?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: ${({ $checked }) => ($checked ? "#eff6ff" : "#f8fafc")};
  border: 1.5px solid ${({ $checked }) => ($checked ? "#2563eb" : "#e2e8f0")};
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const DeptNameText = styled.span<{ $checked?: boolean }>`
  font-size: 14px;
  font-weight: ${({ $checked }) => ($checked ? 700 : 500)};
  color: ${({ $checked }) => ($checked ? "#1e40af" : "#1e293b")};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MyMajorBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #ff7a00;
  background: #fff7ed;
  border: 1px solid #ffedd5;
  padding: 2px 6px;
  border-radius: 6px;
`;

const SelectedBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 2px 6px;
  border-radius: 6px;
`;

const KeywordModalInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px solid #d1d5db;
  font-size: 14px;
  color: #111827;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #2563eb;
  }
`;

const IconPickerModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PickerSectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #475569;
`;

const ColorPickerRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
`;

const ColorSelectButton = styled.button<{ $color: string; $selected: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid ${({ $selected }) => ($selected ? "#111827" : "transparent")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding: 4px 0;
`;

const IconGridItem = styled.button<{ $selected: boolean; $bgColor: string }>`
  background: ${({ $selected }) => ($selected ? "#f1f5f9" : "transparent")};
  border: 1px solid ${({ $selected }) => ($selected ? "#cbd5e1" : "transparent")};
  border-radius: 14px;
  padding: 10px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const IconCirclePreview = styled.div<{ $selected: boolean; $bgColor: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $selected, $bgColor }) => ($selected ? $bgColor : "#f1f5f9")};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconGridLabel = styled.span<{ $selected: boolean }>`
  font-size: 11px;
  font-weight: ${({ $selected }) => ($selected ? 700 : 500)};
  color: ${({ $selected }) => ($selected ? "#1e293b" : "#64748b")};
`;

const TimePickerModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 6px 0;
`;

const PickerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AmPmToggle = styled.div`
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 3px;
  gap: 3px;
`;

const AmPmButton = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active }) => ($active ? "#2563eb" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#64748b")};
  font-weight: 700;
  font-size: 13.5px;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const TimeInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
`;

const TimeSelect = styled.select`
  flex: 1;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1.5px solid #d1d5db;
  background: #f8fafc;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  outline: none;
`;

const TimeColon = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #64748b;
`;

const DayCircleRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 6px;
`;

const DayCircleButton = styled.button<{ $active: boolean }>`
  flex: 1;
  aspect-ratio: 1;
  border-radius: 50%;
  border: none;
  background: ${({ $active }) => ($active ? "#2563eb" : "#f1f5f9")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#64748b")};
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;
