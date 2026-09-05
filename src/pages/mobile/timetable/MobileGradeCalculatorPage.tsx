import { useState, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useTimetableStore } from "@/stores/useTimetableStore";
import {
  useBlocker,
  useBeforeUnload,
  useNavigate,
} from "react-router-dom";
import { Calendar, ClipboardPaste } from "lucide-react";
import Icon from "@/components/common/Icon";
import Modal from "@/components/common/Modal";
import InputField from "@/components/common/InputField";
import CapsuleButton from "@/components/common/CapsuleButton";
import GradeImportSheet from "@/components/mobile/timetable/GradeImportSheet";
import GradeCalculatorIntroSheet from "@/components/mobile/timetable/GradeCalculatorIntroSheet";
import GraduationRequirementCard from "@/components/mobile/timetable/GraduationRequirementCard";
import GraduationSettingModal, {
  type GraduationProfile,
} from "@/components/mobile/timetable/GraduationSettingModal";
import { isMajorCompletion } from "@/utils/parseSmartCampusGrades";
import {
  calculateRequiredAverageGpa,
  evaluateGraduation,
  parseEntryYearFromStudentId,
  resolveGraduationRule,
} from "@/utils/graduationRequirements";
import { findDepartmentCodeByName } from "@/utils/departmentOptions";
import {
  hasSeenGradeCalculatorIntro,
  markGradeCalculatorIntroSeen,
} from "@/utils/gradeCalculatorIntro";
import type { ResolvedGradeRow } from "@/types/gradeImport";
import type { Term } from "@/types/timetables";
import { TERM_LABELS, TERM_ORDER, formatSemester } from "@/utils/semester";
import useUserStore from "@/stores/useUserStore";
import { useCourses } from "@/hooks/useCourses";
import {
  useAllGradeRecords,
  useDeleteAllGradeRecords,
  useUpsertGradeRecords,
} from "@/hooks/useGradeRecords";
import type { GradeLetter, GradeRecord } from "@/types/gradeRecords";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { backHandler } from "@/utils/backHandler";
import type { ClassItem } from "@/components/mobile/timetable/TimetableGrid";

// --- Types ---
interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string; // A+, A0, B+, B0, C+, C0, D+, D0, F, P, NP, "" (미입력)
  isMajor: boolean;
  /**
   * 아래 필드들은 스마트캠퍼스 성적표를 붙여넣어 불러온 과목에만 붙는다.
   * 직접 입력한 과목은 undefined이며, 예전에 저장된 데이터에도 없다(하위 호환).
   */
  courseCode?: string;
  /** 개설강의와 매칭된 Course PK. 매칭 실패 시 null. */
  courseId?: number | null;
  /** 이수구분(전공핵심 / 심화교양 …) 원문 */
  isuName?: string | null;
  /** 이수영역(전공심화 / 사회 …) 원문 */
  isuFldName?: string | null;
  /** 비고("재수강성적취소" 등) 원문 */
  note?: string | null;
  /**
   * 재수강으로 성적이 취소된 과목. 평점·취득학점 어디에도 넣지 않는다.
   * 목록에서는 지우지 않고 흐리게 남겨 사용자가 왜 빠졌는지 알 수 있게 한다.
   */
  excluded?: boolean;
  /** 성적을 받은 실제 학기. 서버 저장/강의 추천에 쓰려면 학년-학기 라벨만으로는 부족하다. */
  sourceYear?: number;
  sourceTerm?: Term;
}

/** 실제 연도 + 학기. 서버 GradeRecord API의 year/term과 그대로 대응한다. */
interface SemesterEntry {
  year: number;
  term: Term;
}

// SemestersData의 키는 "연도-학기"(예: "2026-FIRST") 문자열이다.
type SemestersData = Record<string, Subject[]>;

// --- Constants ---
const GRADES = ["A+", "A0", "B+", "B0", "C+", "C0", "D+", "D0", "F", "P", "NP"];

// --- 학기 키 헬퍼 ---
const semesterKey = (entry: SemesterEntry): string =>
  `${entry.year}-${entry.term}`;

const parseSemesterKey = (key: string): SemesterEntry => {
  const [yearStr, term] = key.split("-");
  return { year: Number(yearStr), term: term as Term };
};

const compareSemesterKeys = (a: string, b: string): number => {
  const ea = parseSemesterKey(a);
  const eb = parseSemesterKey(b);
  return ea.year - eb.year || TERM_ORDER[ea.term] - TERM_ORDER[eb.term];
};

const formatSemesterKeyLabel = (key: string): string => {
  const entry = parseSemesterKey(key);
  return formatSemester(entry.year, entry.term);
};

// 정확한 개강일 대신 대략적인 학사 일정으로 "현재 학기"를 추정한다.
// (1~2월은 겨울학기로 보고 전년도로 취급)
const getDefaultSemesterEntry = (): SemesterEntry => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 3 && month <= 6) return { year, term: "FIRST" };
  if (month >= 7 && month <= 8) return { year, term: "SUMMER" };
  if (month >= 9 && month <= 12) return { year, term: "SECOND" };
  return { year: year - 1, term: "WINTER" };
};

// --- Subject <-> GradeRecord 매핑 ---
const toGradeRecordRequest = (subject: Subject) => ({
  courseCode: subject.courseCode || undefined,
  title: subject.name,
  credit: subject.credits,
  grade: subject.grade === UNGRADED ? null : (subject.grade as GradeLetter),
  isMajor: subject.isMajor,
  isCourseRepetition: Boolean(subject.excluded),
});

const fromGradeRecord = (record: GradeRecord): Subject => ({
  id: `server-${record.id}`,
  name: record.title,
  credits: record.credit,
  grade: record.grade_value ?? UNGRADED,
  isMajor: record.isMajor,
  excluded: record.isCourseRepetition,
  courseCode: record.courseCode ?? undefined,
  sourceYear: record.year,
  sourceTerm: record.term,
});

// 성적이 아직 안 나온 과목. 평점에도, 취득 학점에도 반영하지 않는다.
const UNGRADED = "";

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.5,
  A0: 4.0,
  "B+": 3.5,
  B0: 3.0,
  "C+": 2.5,
  C0: 2.0,
  "D+": 1.5,
  D0: 1.0,
  F: 0.0,
};

// P/NP는 평점에서 빠지고, F/NP는 취득 학점에서 빠진다. 미입력(성적 미발표)과
// 재수강으로 취소된 과목은 둘 다 빠진다.
const countsInGpa = (sub: Subject) =>
  !sub.excluded &&
  sub.grade !== "P" &&
  sub.grade !== "NP" &&
  sub.grade !== UNGRADED;
const isPassed = (sub: Subject) =>
  !sub.excluded &&
  sub.grade !== "F" &&
  sub.grade !== "NP" &&
  sub.grade !== UNGRADED;

// v2: 학기 키가 "N학년 M학기" 프리셋 라벨에서 실제 "연도-학기"로 바뀌어 예전 캐시와 호환되지 않는다.
const LOCAL_STORAGE_KEY = "intip_grade_calculator_data_v2";


const serializeGradeData = (
  data: SemestersData,
  targetCredits: number,
  graduationProfile: GraduationProfile,
) => JSON.stringify({ semestersData: data, targetCredits, graduationProfile });



const serializeSubjects = (subjects: Subject[]) => JSON.stringify(subjects);


const EMPTY_GRADUATION_PROFILE: GraduationProfile = {
  departmentCode: "",
  entryYear: null,
  targetGpa: null,
};

// tb.events는 "미팅(요일별 시간 블록) 1개당 1행"이라 주 2회 이상 만나는 과목은
// 이벤트가 여러 개로 쪼개져 있다. itemId(같은 요소면 동일)로 묶어 과목당 하나만 남긴다.
// 커스텀 일정(isCustom)은 강의가 아니므로 제외한다.
const getUniqueCourseEvents = (events: ClassItem[]): ClassItem[] => {
  const byItemId = new Map<number | string, ClassItem>();
  events
    .filter((event) => !event.isCustom)
    .forEach((event) => {
      const key = event.itemId ?? event.id;
      if (!byItemId.has(key)) byItemId.set(key, event);
    });
  return Array.from(byItemId.values());
};

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  if (!payload || !payload.value) return null;
  const parts = payload.value.split(" ");
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={12}
        textAnchor="middle"
        fill="#8b95a1"
        fontSize={11}
        fontWeight={500}
      >
        {parts[0]}
      </text>
      {parts[1] && (
        <text
          x={0}
          y={26}
          textAnchor="middle"
          fill="#8b95a1"
          fontSize={11}
          fontWeight={500}
        >
          {parts[1]}
        </text>
      )}
    </g>
  );
};

export default function MobileGradeCalculatorPage() {
  // --- State ---
  const [selectedSemesterKey, setSelectedSemesterKey] = useState<
    string | null
  >(null);
  const [semestersData, setSemestersData] = useState<SemestersData>({});
  const [savedSemestersData, setSavedSemestersData] = useState<SemestersData>(
    {},
  );
  const [targetCredits, setTargetCredits] = useState<number>(130);
  const [savedTargetCredits, setSavedTargetCredits] = useState<number>(130);
  const [targetCreditsInput, setTargetCreditsInput] = useState<string>("130");
  const [showTargetCreditsModal, setShowTargetCreditsModal] =
    useState<boolean>(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] =
    useState<boolean>(false);
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [showSemesterSheet, setShowSemesterSheet] = useState<boolean>(false);
  const [showTimetableSheet, setShowTimetableSheet] = useState<boolean>(false);
  const [showGradeImportSheet, setShowGradeImportSheet] =
    useState<boolean>(false);
  const [showAddSemesterModal, setShowAddSemesterModal] =
    useState<boolean>(false);
  const [newSemesterYearInput, setNewSemesterYearInput] =
    useState<string>("");
  const [newSemesterTerm, setNewSemesterTerm] = useState<Term>("FIRST");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [graduationProfile, setGraduationProfile] = useState<GraduationProfile>(
    EMPTY_GRADUATION_PROFILE,
  );
  const [savedGraduationProfile, setSavedGraduationProfile] =
    useState<GraduationProfile>(EMPTY_GRADUATION_PROFILE);
  const [showGraduationModal, setShowGraduationModal] =
    useState<boolean>(false);
  const [showIntroSheet, setShowIntroSheet] = useState<boolean>(false);
  /** 저장된 졸업요건 설정이 이미 있는지 — 있으면 학과 자동 채움을 하지 않는다. */
  const hasStoredGraduationProfile = useRef<boolean>(false);

  const navigate = useNavigate();
  const { timetables } = useTimetableStore();
  // 시간표 요소(ClassItem)에는 이수구분 정보가 없다(서버 시간표 상세 응답
  // TimeTableCourseItem이 courseOfferingId/courseId만 줄 뿐 isuName 등을 안 담는다).
  // 대신 numericCourseId(Course PK)로 강의 목록에서 completionDivisionName을
  // 찾아 전공 여부를 판정한다. 강의 목록은 가벼운 전체 조회 1건이라 "시간표
  // 불러오기" 시트를 열 때만 가져온다(이미 캐시돼 있으면 즉시 사용하고,
  // staleTime(5분) 이후에는 재요청될 수 있음).
  const { courses: coursesForImport, isLoading: isCoursesForImportLoading } =
    useCourses(undefined, {
      enabled: showTimetableSheet,
    });
  const courseByIdForImport = useMemo(
    () => new Map(coursesForImport.map((c) => [c.id, c])),
    [coursesForImport],
  );
  const userDepartment = useUserStore((state) => state.userInfo.department);
  const userStudentId = useUserStore((state) => state.userInfo.studentId);

  const isLoggedIn = Boolean(useUserStore((state) => state.tokenInfo.accessToken));

  // --- Header Integration ---
  useHeader({
    title: "학점계산기",
    hasback: true,
    rightArea: null,
  });

  // --- Load Data ---
  // 로그인한 사용자는 서버(GET /api/grades/all)를 우선하고, 서버에 데이터가
  // 없거나 비로그인이면 로컬 캐시로 폴백한다. 초기 진입 시 한 번만 반영한다.
  const allGradeRecordsQuery = useAllGradeRecords();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    // 로그인 상태면 서버 조회가 끝날 때까지 기다렸다가 한 번에 반영한다
    // (캐시 → 서버 두 번 렌더링해서 깜빡이는 걸 피하기 위함).
    if (isLoggedIn && !allGradeRecordsQuery.isFetched) return;
    hasInitializedRef.current = true;

    let initialSemestersData: SemestersData | null = null;
    let initialTargetCredits = 130;

    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        initialTargetCredits = parsed.targetCredits || 130;
        if (!isLoggedIn) initialSemestersData = parsed.semestersData || {};
      } catch (e) {
        console.error("Failed to parse cached grades", e);
      }
    }

    if (isLoggedIn) {
      const serverRecords = allGradeRecordsQuery.data ?? [];
      if (serverRecords.length > 0) {
        const grouped: SemestersData = {};
        serverRecords.forEach((record) => {
          const key = semesterKey({ year: record.year, term: record.term });
          grouped[key] = [...(grouped[key] ?? []), fromGradeRecord(record)];
        });
        initialSemestersData = grouped;
      } else if (cached) {
        try {
          initialSemestersData = JSON.parse(cached).semestersData || {};
        } catch {
          initialSemestersData = {};
        }
      }
    }

    if (!initialSemestersData || Object.keys(initialSemestersData).length === 0) {
      initialSemestersData = { [semesterKey(getDefaultSemesterEntry())]: [] };
    }

    setSemestersData(initialSemestersData);
    setSavedSemestersData(initialSemestersData);
    setTargetCredits(initialTargetCredits);
    setSavedTargetCredits(initialTargetCredits);

    const sortedKeys = Object.keys(initialSemestersData).sort(
      compareSemesterKeys,
    );
    setSelectedSemesterKey(sortedKeys[sortedKeys.length - 1] ?? null);
  }, [isLoggedIn, allGradeRecordsQuery.isFetched, allGradeRecordsQuery.data]);

  // --- Save Data Helper ---
  const hasChanges = useMemo(() => {
    return (
      serializeGradeData(semestersData, targetCredits, graduationProfile) !==
      serializeGradeData(
        savedSemestersData,
        savedTargetCredits,
        savedGraduationProfile,
      )
    );
  }, [
    savedSemestersData,
    savedTargetCredits,
    savedGraduationProfile,
    semestersData,
    targetCredits,
    graduationProfile,
  ]);

  const upsertGradeRecordsMutation = useUpsertGradeRecords();
  const deleteAllGradeRecordsMutation = useDeleteAllGradeRecords();

  const saveToLocalStorageOnly = () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      serializeGradeData(semestersData, targetCredits, graduationProfile),
    );
    setSavedSemestersData(semestersData);
    setSavedTargetCredits(targetCredits);
  };

  // 과목명이 비어 있으면 서버가 요구하는 필수값(title)을 못 채우니 저장 전에 걸러낸다.
  const findSemesterWithBlankSubjectName = (): string | null => {
    for (const key of Object.keys(semestersData)) {
      if (semestersData[key].some((sub) => !sub.name.trim())) return key;
    }
    return null;
  };

  const handleSave = async () => {
    const invalidKey = findSemesterWithBlankSubjectName();
    if (invalidKey) {
      setSelectedSemesterKey(invalidKey);
      alert(
        `"${formatSemesterKeyLabel(invalidKey)}"에 과목명이 비어 있는 과목이 있어요. 입력 후 다시 저장해주세요.`,
      );
      return;
    }

    if (!isLoggedIn) {
      saveToLocalStorageOnly();
      return;
    }

    const changedKeys = Object.keys(semestersData).filter(
      (key) =>
        serializeSubjects(semestersData[key]) !==
        serializeSubjects(savedSemestersData[key] ?? []),
    );
    const removedKeys = Object.keys(savedSemestersData).filter(
      (key) => !(key in semestersData),
    );

    if (changedKeys.length === 0 && removedKeys.length === 0) {
      saveToLocalStorageOnly();
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all([
        ...changedKeys.map((key) => {
          const entry = parseSemesterKey(key);
          return upsertGradeRecordsMutation.mutateAsync({
            year: entry.year,
            term: entry.term,
            records: semestersData[key].map(toGradeRecordRequest),
          });
        }),
        ...removedKeys.map((key) =>
          deleteAllGradeRecordsMutation.mutateAsync(parseSemesterKey(key)),
        ),
      ]);

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        serializeGradeData(semestersData, targetCredits, graduationProfile),
      );
      setSavedSemestersData(semestersData);
      setSavedTargetCredits(targetCredits);
    } catch (e) {
      console.error("Failed to save grades to server", e);
      alert("성적 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // 이탈을 확정한 뒤에는 어떤 경로로도 다시 막지 않는다. state 가 아니라 ref 인
  // 이유는 "나가기" 클릭 핸들러 안에서 블로커/백핸들러가 곧바로 이 값을 읽어야
  // 하기 때문이다(리렌더를 기다릴 수 없다).
  const isLeavingRef = useRef(false);
  const isUnsavedModalOpenRef = useRef(false);
  isUnsavedModalOpenRef.current = showUnsavedChangesModal;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isLeavingRef.current &&
      hasChanges &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search ||
        currentLocation.hash !== nextLocation.hash),
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowUnsavedChangesModal(true);
    }
  }, [blocker.state]);

  useBeforeUnload(
    (event) => {
      if (!hasChanges) return;

      event.preventDefault();
      event.returnValue = "";
    },
    { capture: true },
  );

  const handleStayOnPage = () => {
    setShowUnsavedChangesModal(false);
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  const handleLeaveWithoutSaving = () => {
    isLeavingRef.current = true;
    backHandler.setPageUnsavedChanges(false);
    setShowUnsavedChangesModal(false);

    if (blocker.state === "blocked") {
      blocker.proceed();
      return;
    }

    // 앱에서는 뒤로가기를 backHandler 가 먼저 가로채므로(nativeBackRequest 참고)
    // 블로커가 아예 걸리지 않는다. 그때는 이탈을 우리가 직접 수행한다.
    // router.tsx 가 -1 을 appBridge.requestBack 으로 위임하고, 이 웹뷰 안에
    // 되돌릴 게 없으면 네이티브가 웹뷰를 닫는다.
    navigate(-1);
  };

  useEffect(() => {
    const handlePageBack = () => {
      if (isLeavingRef.current) return false; // 이탈 확정 → 네이티브에 넘긴다
      // 경고가 이미 떠 있으면 뒤로가기는 그 경고만 닫는다. (이 모달은 히스토리
      // 엔트리를 쌓지 않으므로 popstate 로 닫히지 않는다 — closeOnBack={false})
      if (isUnsavedModalOpenRef.current) {
        setShowUnsavedChangesModal(false);
        return true;
      }
      setShowUnsavedChangesModal(true);
      return true; // 뒤로가기 가로채기
    };

    backHandler.setPageUnsavedChanges(hasChanges, handlePageBack);
    return () => {
      backHandler.setPageUnsavedChanges(false);
    };
  }, [hasChanges]);

  // --- Semester Operations ---
  const sortedSemesterKeys = useMemo(
    () => Object.keys(semestersData).sort(compareSemesterKeys),
    [semestersData],
  );

  const openAddSemesterModal = () => {
    const def = getDefaultSemesterEntry();
    setNewSemesterYearInput(String(def.year));
    setNewSemesterTerm(def.term);
    setShowAddSemesterModal(true);
  };

  const isNewSemesterValid = useMemo(() => {
    const year = parseInt(newSemesterYearInput, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) return false;
    return !(semesterKey({ year, term: newSemesterTerm }) in semestersData);
  }, [newSemesterYearInput, newSemesterTerm, semestersData]);

  const handleConfirmAddSemester = () => {
    const year = parseInt(newSemesterYearInput, 10);
    if (Number.isNaN(year)) return;
    const key = semesterKey({ year, term: newSemesterTerm });
    if (key in semestersData) return;

    setSemestersData((prev) => ({ ...prev, [key]: [] }));
    setSelectedSemesterKey(key);
    setShowAddSemesterModal(false);
  };

  const handleDeleteSemesterEntry = (key: string) => {
    const subjects = semestersData[key] ?? [];
    const label = formatSemesterKeyLabel(key);
    const confirmMessage =
      subjects.length > 0
        ? `"${label}"에 입력된 ${subjects.length}개 과목이 모두 삭제됩니다. 계속할까요?`
        : `"${label}"을(를) 목록에서 삭제할까요?`;
    if (!window.confirm(confirmMessage)) return;

    setSemestersData((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    if (selectedSemesterKey === key) {
      const remaining = sortedSemesterKeys.filter((k) => k !== key);
      setSelectedSemesterKey(remaining[remaining.length - 1] ?? null);
    }
  };

  // --- Subject Operations ---
  const currentSubjects = useMemo(() => {
    return selectedSemesterKey ? semestersData[selectedSemesterKey] || [] : [];
  }, [semestersData, selectedSemesterKey]);

  const updateSubjects = (newSubjects: Subject[]) => {
    if (!selectedSemesterKey) return;
    setSemestersData((prev) => ({
      ...prev,
      [selectedSemesterKey]: newSubjects,
    }));
  };

  const handleAddSubject = () => {
    const newSub: Subject = {
      id: `${Date.now()}-${Math.random()}`,
      name: "",
      credits: 3,
      grade: "A+",
      isMajor: false,
    };
    updateSubjects([...currentSubjects, newSub]);
  };

  const handleUpdateSubject = (
    id: string,
    field: keyof Subject,
    value: any,
  ) => {
    const updated = currentSubjects.map((sub) => {
      if (sub.id === id) {
        return { ...sub, [field]: value };
      }
      return sub;
    });
    updateSubjects(updated);
  };

  const handleDeleteSubject = (id: string) => {
    const updated = currentSubjects.filter((sub) => sub.id !== id);
    updateSubjects(updated);
  };

  const handleResetSubjects = () => {
    if (window.confirm("이 학기의 입력된 모든 과목 정보를 초기화할까요?")) {
      updateSubjects([]);
    }
  };

  // --- Target Credits Change ---
  const handleEditTargetCredits = () => {
    setTargetCreditsInput(String(targetCredits));
    setShowTargetCreditsModal(true);
  };

  const handleTargetCreditsInputChange = (value: string) => {
    setTargetCreditsInput(value.replace(/\D/g, ""));
  };

  const handleSaveTargetCredits = () => {
    const parsed = parseInt(targetCreditsInput, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return;

    setTargetCredits(parsed);
    setShowTargetCreditsModal(false);
  };



  // --- Calculations ---
  // Helper to calculate statistics for a given list of subjects
  const calculateSemesterStats = (subjects: Subject[]) => {
    let totalGpaCredits = 0;
    let totalGpaPoints = 0;
    let majorGpaCredits = 0;
    let majorGpaPoints = 0;
    let acquiredCredits = 0;

    subjects.forEach((sub) => {
      if (isPassed(sub)) {
        acquiredCredits += sub.credits;
      }

      if (countsInGpa(sub)) {
        const point = GRADE_POINTS[sub.grade] ?? 0.0;
        totalGpaCredits += sub.credits;
        totalGpaPoints += sub.credits * point;

        if (sub.isMajor) {
          majorGpaCredits += sub.credits;
          majorGpaPoints += sub.credits * point;
        }
      }
    });

    const gpa = totalGpaCredits > 0 ? totalGpaPoints / totalGpaCredits : 0.0;
    const majorGpa =
      majorGpaCredits > 0 ? majorGpaPoints / majorGpaCredits : 0.0;

    return { gpa, majorGpa, acquiredCredits };
  };

  // Overall/Cumulative calculations across all semesters
  const overallStats = useMemo(() => {
    let totalGpaCredits = 0;
    let totalGpaPoints = 0;
    let majorGpaCredits = 0;
    let majorGpaPoints = 0;
    let totalAcquired = 0;

    Object.keys(semestersData).forEach((sem) => {
      const subjects = semestersData[sem] || [];
      subjects.forEach((sub) => {
        if (isPassed(sub)) {
          totalAcquired += sub.credits;
        }

        if (countsInGpa(sub)) {
          const point = GRADE_POINTS[sub.grade] ?? 0.0;
          totalGpaCredits += sub.credits;
          totalGpaPoints += sub.credits * point;

          if (sub.isMajor) {
            majorGpaCredits += sub.credits;
            majorGpaPoints += sub.credits * point;
          }
        }
      });
    });

    const gpa = totalGpaCredits > 0 ? totalGpaPoints / totalGpaCredits : 0.0;
    const majorGpa =
      majorGpaCredits > 0 ? majorGpaPoints / majorGpaCredits : 0.0;

    return {
      gpa,
      majorGpa,
      acquiredCredits: totalAcquired,
      // 목표 평점 계산에 쓰려면 평점 산입 학점/평점합이 그대로 필요하다.
      gpaCredits: totalGpaCredits,
      gpaPoints: totalGpaPoints,
    };
  }, [semestersData]);

  // --- 졸업요건 판정 ---
  const resolvedGraduationRule = useMemo(
    () =>
      resolveGraduationRule(
        graduationProfile.departmentCode,
        graduationProfile.entryYear,
      ),
    [graduationProfile.departmentCode, graduationProfile.entryYear],
  );

  const graduationEvaluation = useMemo(() => {
    if (!resolvedGraduationRule) return null;

    const subjects = Object.values(semestersData)
      .flat()
      .map((sub) => ({
        name: sub.name,
        credits: sub.credits,
        isMajor: sub.isMajor,
        passed: isPassed(sub),
        isuName: sub.isuName,
        isuFldName: sub.isuFldName,
      }));

    return evaluateGraduation(
      resolvedGraduationRule.rule,
      subjects,
      resolvedGraduationRule.departmentCode,
    );
  }, [resolvedGraduationRule, semestersData]);

  const requiredAverageGpa = useMemo(() => {
    if (!graduationEvaluation || graduationProfile.targetGpa === null) {
      return null;
    }
    return calculateRequiredAverageGpa({
      targetGpa: graduationProfile.targetGpa,
      gpaCredits: overallStats.gpaCredits,
      gpaPoints: overallStats.gpaPoints,
      remainingCredits: graduationEvaluation.remainingTotalCredits,
    });
  }, [
    graduationEvaluation,
    graduationProfile.targetGpa,
    overallStats.gpaCredits,
    overallStats.gpaPoints,
  ]);

  const handleSaveGraduationProfile = (profile: GraduationProfile) => {
    // 학과·학번이 정해지면 취득 목표 학점은 그 규정의 졸업학점으로 맞춘다.
    // (연필 버튼으로 직접 고치는 건 그대로 열려 있다.)
    const resolved = resolveGraduationRule(
      profile.departmentCode,
      profile.entryYear,
    );
    const nextTargetCredits = resolved
      ? resolved.rule.generalRequirements.minTotalCredits
      : savedTargetCredits;

    setGraduationProfile(profile);
    setShowGraduationModal(false);
    if (resolved) {
      setTargetCredits(nextTargetCredits);
    }

    // 졸업요건 설정은 성적 입력과 별개라 여기서 바로 저장한다. 작성 중인 과목
    // 목록까지 딸려 저장되지 않도록 저장본(savedSemestersData)을 그대로 쓴다.
    // (안 그러면 설정만 바꿔도 "저장 안 된 변경사항"으로 잡혀 새로고침할 때
    //  브라우저 이탈 경고가 뜬다.)
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      serializeGradeData(savedSemestersData, nextTargetCredits, profile),
    );
    setSavedGraduationProfile(profile);
    setSavedTargetCredits(nextTargetCredits);
    hasStoredGraduationProfile.current = true;
  };

  // Current semester calculations
  const currentSemesterStats = useMemo(() => {
    return calculateSemesterStats(currentSubjects);
  }, [currentSubjects]);

  // --- SVG Graph Data ---
  const graphData = useMemo(() => {
    const semestersWithData = sortedSemesterKeys
      .map((key) => {
        const subjects = semestersData[key] || [];
        if (subjects.length === 0) return null;
        const stats = calculateSemesterStats(subjects);
        return {
          semesterKey: key,
          semester: formatSemesterKeyLabel(key),
          gpa: stats.gpa,
        };
      })
      .filter(
        (
          item,
        ): item is { semesterKey: string; semester: string; gpa: number } =>
          item !== null,
      );

    return semestersWithData;
  }, [semestersData, sortedSemesterKeys]);

  const selectedSemesterLabel = selectedSemesterKey
    ? formatSemesterKeyLabel(selectedSemesterKey)
    : "";

  // 불러온 과목은 "지금 보고 있는 학기"가 아니라 그 과목이 실제로 속한 학기로
  // 들어간다. 계산기에 아직 없는 학기면 새로 만들고, 넣은 뒤 그 학기를 보여준다.
  const applyImportedSubjects = (entry: SemesterEntry, subjects: Subject[]) => {
    const key = semesterKey(entry);
    setSemestersData((prev) => ({ ...prev, [key]: subjects }));
    setSelectedSemesterKey(key);
  };

  // --- Timetable Importer ---
  const handleImportTimetable = (timetableId: number) => {
    const tb = timetables.find((t) => t.id === timetableId);
    if (!tb) return;

    const courseEvents = getUniqueCourseEvents(tb.events);
    const hasCourseLookupTarget = courseEvents.some(
      (event) => event.numericCourseId != null,
    );

    if (courseEvents.length === 0) {
      alert("이 시간표에는 불러올 과목이 없어요.");
      return;
    }
    if (
      hasCourseLookupTarget &&
      isCoursesForImportLoading &&
      coursesForImport.length === 0
    ) {
      alert("강의 목록을 불러오는 중이에요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const targetEntry: SemesterEntry = { year: tb.year, term: tb.term };
    const targetLabel = formatSemesterKeyLabel(semesterKey(targetEntry));
    const existingCount = (semestersData[semesterKey(targetEntry)] ?? []).length;

    if (
      window.confirm(
        `"${tb.semester} (${tb.name})" 시간표의 과목 ${courseEvents.length}개를 ${targetLabel}에 불러올까요?` +
          (existingCount > 0
            ? `\n${targetLabel}에 작성 중인 과목 ${existingCount}개는 덮어씌워집니다.`
            : ""),
      )
    ) {
      const imported: Subject[] = courseEvents.map((event) => {
        // numericCourseId(Course PK)로 강의 목록에서 이수구분(completionDivisionName)을
        // 찾아 성적 붙여넣기와 같은 판정 함수(isMajorCompletion)를 재사용한다.
        // 강의 목록이 아직 안 불러와졌거나(로딩 중) 매칭되는 강의가 없으면(예:
        // 커스텀/폐강 강의) 판정할 근거가 없으므로 기존처럼 false로 둔다.
        const course =
          event.numericCourseId != null
            ? courseByIdForImport.get(event.numericCourseId)
            : undefined;

        return {
          id: `${Date.now()}-${Math.random()}`,
          name: event.name,
          // 개설강의에 등록된 실제 학점을 쓴다. 값이 없는 예외적인 경우에만 강의
          // 시간(끝-시작)으로 대략 추정한다.
          credits:
            event.credits ??
            Math.max(1, Math.round(event.endTime - event.startTime)),
          grade: "A+",
          isMajor: isMajorCompletion(course?.completionDivisionName ?? null, null),
          courseCode: event.courseId,
          courseId: event.numericCourseId ?? null,
        };
      });

      applyImportedSubjects(targetEntry, imported);
      setShowTimetableSheet(false);
    }
  };

  // --- 스마트캠퍼스 성적 붙여넣기 ---
  const handleApplyImportedGrades = (
    rows: ResolvedGradeRow[],
    source: { year: number; term: Term } | null,
  ) => {
    if (!selectedSemesterKey) return;
    if (
      currentSubjects.length > 0 &&
      !window.confirm(
        `현재 학기(${selectedSemesterLabel})에 입력된 ${currentSubjects.length}개 과목을 불러온 ${rows.length}개 과목으로 바꿀까요?`,
      )
    ) {
      return;
    }

    const imported: Subject[] = rows.map((row) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: row.title,
      // 학점 열까지 복사되지 않은 행은 0으로 두고 사용자가 채우게 한다.
      credits: row.resolvedCredit ?? 0,
      grade: row.grade ?? UNGRADED,
      isMajor: isMajorCompletion(row.resolvedIsuName, row.isuFldName),
      note: row.note,
      excluded: row.voided,
      courseCode: row.courseCode,
      courseId: row.courseId,
      isuName: row.resolvedIsuName,
      isuFldName: row.isuFldName,
      sourceYear: source?.year,
      sourceTerm: source?.term,
    }));

    updateSubjects(imported);
    setShowGradeImportSheet(false);
  };


  // --- 기능 소개 시트 (최초 1회) ---
  useEffect(() => {
    if (hasSeenGradeCalculatorIntro()) return;

    markGradeCalculatorIntroSeen();
    setShowIntroSheet(true);
  }, []);

  // 학과·학번은 로그인한 사용자 정보(/api/members)에서 채워둔다. 저장된 졸업요건
  // 설정이 아직 없을 때만 넣고(사용자가 직접 지운 값을 되살리지 않도록), 저장본에도
  // 같이 반영해 "저장 안 된 변경사항"으로 잡히지 않게 한다.
  useEffect(() => {
    if (hasStoredGraduationProfile.current) return;

    // 서버 departmentCode("0000077")는 학사 시스템 코드라 졸업요건 데이터의
    // 학과 코드와 다른 체계다. 학과명으로 찾아야 한다.
    const departmentCode =
      graduationProfile.departmentCode ||
      findDepartmentCodeByName(userDepartment);
    const entryYear =
      graduationProfile.entryYear ??
      parseEntryYearFromStudentId(userStudentId);

    if (
      departmentCode === graduationProfile.departmentCode &&
      entryYear === graduationProfile.entryYear
    ) {
      return;
    }

    const filled = { ...graduationProfile, departmentCode, entryYear };
    setGraduationProfile(filled);
    setSavedGraduationProfile(filled);

    // 학과·학번이 다 채워졌으면 취득 목표 학점도 그 규정의 졸업학점으로 맞춘다.
    const resolved = resolveGraduationRule(departmentCode, entryYear);
    if (resolved) {
      const minTotalCredits = resolved.rule.generalRequirements.minTotalCredits;
      setTargetCredits(minTotalCredits);
      setSavedTargetCredits(minTotalCredits);
    }
  }, [graduationProfile, userDepartment, userStudentId]);

  // 소개 시트와 설정 모달이 겹쳐 뜨지 않도록, 시트가 닫히는 애니메이션이
  // 끝난 뒤에 졸업요건 설정을 연다.
  const handleSetupGraduationFromIntro = () => {
    setShowIntroSheet(false);
    setTimeout(() => setShowGraduationModal(true), 300);
  };

  return (
    <PageWrapper>
      <Modal
        isOpen={showTargetCreditsModal}
        onClose={() => setShowTargetCreditsModal(false)}
        title="취득 학점 입력"
        description={
          "졸업요건에서 학과와 학번을 고르면 자동으로 채워져요.\n직접 고쳐서 쓸 수도 있어요."
        }
        primaryButton={{
          text: "저장",
          variant: "brand",
          onClick: handleSaveTargetCredits,
          disabled:
            !targetCreditsInput || parseInt(targetCreditsInput, 10) <= 0,
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setShowTargetCreditsModal(false),
        }}
      >
        <InputField
          label="취득 학점"
          value={targetCreditsInput}
          onChange={handleTargetCreditsInputChange}
          placeholder="취득 학점을 입력하세요"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </Modal>

      <Modal
        isOpen={showUnsavedChangesModal}
        onClose={handleStayOnPage}
        title="저장하지 않은 변경사항이 있어요"
        description={"페이지를 나가면 변경한 내용이 저장되지 않을 수 있어요.\n그래도 나가시겠어요?"}
        primaryButton={{
          text: "나가기",
          variant: "danger",
          onClick: handleLeaveWithoutSaving,
        }}
        secondaryButton={{
          text: "머무르기",
          onClick: handleStayOnPage,
        }}
        closeOnOverlayClick={false}
        // 이 경고창은 히스토리 엔트리를 쌓으면 안 된다. 엔트리가 하나 끼면
        // 라우터가 세어 둔 delta 가 어긋나서 blocker.proceed() 의 history.go 가
        // 이전 화면 대신 그 엔트리만 되돌리고, 결국 페이지를 못 벗어난다.
        closeOnBack={false}
      />

      <GradeCalculatorIntroSheet
        open={showIntroSheet}
        onOpenChange={setShowIntroSheet}
        onSetupGraduation={handleSetupGraduationFromIntro}
      />

      <GraduationSettingModal
        isOpen={showGraduationModal}
        profile={graduationProfile}
        onClose={() => setShowGraduationModal(false)}
        onSave={handleSaveGraduationProfile}
      />

      {/* 1. 전체 학기 요약 카드 */}
      <StickyStatsCard>
        <StatsHeader>
          <StatsTitle>전체 학기</StatsTitle>
        </StatsHeader>
        <StatsRow>
          <StatBox>
            <StatLabel>전체 평점</StatLabel>
            <StatValueWrapper>
              <StatValueText>{overallStats.gpa.toFixed(2)}</StatValueText>
              <StatMaxText>/ 4.5</StatMaxText>
            </StatValueWrapper>
          </StatBox>
          <StatBox>
            <StatLabel>전공 평점</StatLabel>
            <StatValueWrapper>
              <StatValueText>{overallStats.majorGpa.toFixed(2)}</StatValueText>
              <StatMaxText>/ 4.5</StatMaxText>
            </StatValueWrapper>
          </StatBox>
          <StatBox>
            <StatLabel>취득 학점</StatLabel>
            <StatValueWrapper>
              <StatValueText>{overallStats.acquiredCredits}</StatValueText>
              <TargetCreditsButton onClick={handleEditTargetCredits}>
                <span className="target-limit">/ {targetCredits}</span>
                <Icon name="edit-pencil-01" size={12} className="pencil-icon" />
              </TargetCreditsButton>
            </StatValueWrapper>
          </StatBox>
        </StatsRow>

        {/* 그래프 토글 헤더 (항상 노출, 좌측 상단 버튼 배치) */}
        <GraphHeaderRow>
          <GraphFoldButton onClick={() => setShowGraph(!showGraph)}>
            <span>{showGraph ? "그래프 접기" : "그래프 보기"}</span>
            {showGraph ? (
              <Icon name="chevron-up" size={16} className="caret-icon" />
            ) : (
              <Icon name="chevron-down" size={16} className="caret-icon" />
            )}
          </GraphFoldButton>
          {showGraph && (
            <GraphLegendRow>
              <LegendItem>
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
                >
                  <line
                    x1="0"
                    y1="4"
                    x2="12"
                    y2="4"
                    stroke="var(--border-brand, #0061FF)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="6"
                    cy="4"
                    r="2.5"
                    fill="#ffffff"
                    stroke="var(--border-brand, #0061FF)"
                    strokeWidth="2"
                  />
                </svg>
                <span>전체 평점</span>
              </LegendItem>
              <LegendItem>
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
                >
                  <line
                    x1="0"
                    y1="4"
                    x2="12"
                    y2="4"
                    stroke="var(--border-warn, #FEE588)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="6"
                    cy="4"
                    r="2.5"
                    fill="#ffffff"
                    stroke="var(--border-warn, #FEE588)"
                    strokeWidth="2"
                  />
                </svg>
                <span>전공 평점</span>
              </LegendItem>
            </GraphLegendRow>
          )}
        </GraphHeaderRow>

        <GraphSection $expanded={showGraph}>
          {/* 그래프 카드 본문 */}
          {graphData.length < 2 ? (
            <EmptyGraphText>
              다음 학기부터 성적 추이를 볼 수 있어요.
            </EmptyGraphText>
          ) : (
            <GraphCardBody
              style={{ height: "220px", marginTop: "12px", width: "100%" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(() => {
                    return graphData.map((d) => {
                      const subjects = semestersData[d.semesterKey] || [];
                      const stats = calculateSemesterStats(subjects);
                      return {
                        name: d.semester,
                        overall: parseFloat(d.gpa.toFixed(2)),
                        major: parseFloat(stats.majorGpa.toFixed(2)),
                      };
                    });
                  })()}
                  margin={{ top: 20, right: 16, left: 8, bottom: 30 }}
                >
                  <ReferenceLine y={4.5} stroke="#e5e8eb" strokeWidth={1} />
                  <ReferenceLine y={4.0} stroke="#e5e8eb" strokeWidth={1} />
                  <ReferenceLine y={3.5} stroke="#e5e8eb" strokeWidth={1} />
                  <ReferenceLine y={3.0} stroke="#e5e8eb" strokeWidth={1} />
                  <ReferenceLine y={2.0} stroke="#e5e8eb" strokeWidth={1} />

                  <XAxis
                    dataKey="name"
                    tick={<CustomXAxisTick />}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    padding={{ left: 24, right: 24 }}
                  />
                  <YAxis
                    domain={[1.2, 4.8]}
                    ticks={[2.0, 3.0, 3.5, 4.0, 4.5]}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    interval={0}
                    tickFormatter={(val) => val.toFixed(1)}
                    tick={{ fill: "#8b95a1", fontSize: 12, fontWeight: 500 }}
                  />
                  <Line
                    type="linear"
                    dataKey="overall"
                    stroke="var(--border-brand, #0061FF)"
                    strokeWidth={2.5}
                    dot={{
                      stroke: "var(--border-brand, #0061FF)",
                      strokeWidth: 2,
                      r: 4,
                      fill: "#ffffff",
                      fillOpacity: 1,
                    }}
                    label={{
                      position: "top",
                      fill: "#333d4b",
                      fontSize: 10,
                      fontWeight: "bold",
                      offset: 8,
                    }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="linear"
                    dataKey="major"
                    stroke="var(--border-warn, #FEE588)"
                    strokeWidth={2.5}
                    dot={{
                      stroke: "var(--border-warn, #FEE588)",
                      strokeWidth: 2,
                      r: 4,
                      fill: "#ffffff",
                      fillOpacity: 1,
                    }}
                    label={{
                      position: "top",
                      fill: "#8b95a1",
                      fontSize: 10,
                      fontWeight: "bold",
                      offset: 8,
                    }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GraphCardBody>
          )}
        </GraphSection>
      </StickyStatsCard>

      {/* 2. 졸업요건 피드백 카드 */}
      <GraduationRequirementCard
        profile={graduationProfile}
        resolved={resolvedGraduationRule}
        evaluation={graduationEvaluation}
        requiredAverageGpa={requiredAverageGpa}
        onEdit={() => setShowGraduationModal(true)}
      />

      {/* 3. 학기별 학점계산기 메인 카드 */}
      <MainContainer>
        {!selectedSemesterKey ? (
          <EmptySemesterState>
            <p>아직 추가된 학기가 없어요.</p>
            <p className="sub">학기를 추가하고 성적을 입력해보세요.</p>
            <CapsuleButton variant="brand" onClick={openAddSemesterModal}>
              학기 추가
            </CapsuleButton>
          </EmptySemesterState>
        ) : (
          <>
            <SemesterSummaryHeader>
              <SemesterSelectButton onClick={() => setShowSemesterSheet(true)}>
                <span className="semester-name">{selectedSemesterLabel}</span>
                <Icon name="chevron-down" size={20} className="dropdown-caret" />
              </SemesterSelectButton>

              <SemesterStatsRow>
                <SemStatBox>
                  <span className="stat-val bold">
                    {currentSemesterStats.gpa.toFixed(2)}
                  </span>
                  <span className="stat-label">평점</span>
                </SemStatBox>
                <SemStatBox>
                  <span className="stat-val">
                    {currentSemesterStats.majorGpa.toFixed(2)}
                  </span>
                  <span className="stat-label">전공</span>
                </SemStatBox>
                <SemStatBox>
                  <span className="stat-val">
                    {currentSemesterStats.acquiredCredits}
                  </span>
                  <span className="stat-label">취득</span>
                </SemStatBox>
              </SemesterStatsRow>

              <ImportButtonRow>
                <ImportTimetableButton onClick={() => setShowTimetableSheet(true)}>
                  <Calendar size={16} className="calendar-icon" />
                  <span className="import-text">시간표 불러오기</span>
                </ImportTimetableButton>
                <ImportTimetableButton
                  onClick={() => setShowGradeImportSheet(true)}
                >
                  <ClipboardPaste size={16} className="calendar-icon" />
                  <span className="import-text">성적 붙여넣기</span>
                </ImportTimetableButton>
              </ImportButtonRow>
            </SemesterSummaryHeader>

            {/* 4. 과목 리스트 테이블 */}
            <GradeTable>
              <TableHeader>
                <ColSubject>과목명</ColSubject>
                <ColCredits>학점</ColCredits>
                <ColGrade>성적</ColGrade>
                <ColMajor>전공</ColMajor>
                <ColDelete></ColDelete>
              </TableHeader>

              <TableBody>
                {currentSubjects.length === 0 ? (
                  <EmptyRowText>
                    등록된 과목이 없습니다. 아래 과목 추가를 눌러보세요.
                  </EmptyRowText>
                ) : (
                  currentSubjects.map((subject) => (
                    <TableRow key={subject.id} $dimmed={subject.excluded}>
                      <ColSubject>
                        <SubjectInput
                          type="text"
                          value={subject.name}
                          placeholder="과목명 입력"
                          onChange={(e) =>
                            handleUpdateSubject(subject.id, "name", e.target.value)
                          }
                        />
                      </ColSubject>
                      <ColCredits>
                        <CreditsSelectorWrapper>
                          <span className="credits-val">{subject.credits}</span>
                          <HiddenSelect
                            value={subject.credits}
                            onChange={(e) =>
                              handleUpdateSubject(
                                subject.id,
                                "credits",
                                parseInt(e.target.value, 10),
                              )
                            }
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                          </HiddenSelect>
                        </CreditsSelectorWrapper>
                      </ColCredits>
                      <ColGrade>
                        <GradeSelectorButton>
                          <span className="grade-val">
                            {subject.grade === UNGRADED ? "-" : subject.grade}
                          </span>
                          <Icon name="chevron-down" size={14} className="grade-caret" />
                          <HiddenSelect
                            value={subject.grade}
                            onChange={(e) =>
                              handleUpdateSubject(
                                subject.id,
                                "grade",
                                e.target.value,
                              )
                            }
                          >
                            {GRADES.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                            <option value={UNGRADED}>미입력</option>
                          </HiddenSelect>
                        </GradeSelectorButton>
                      </ColGrade>
                      <ColMajor>
                        <CheckboxWrapper
                          onClick={() =>
                            handleUpdateSubject(
                              subject.id,
                              "isMajor",
                              !subject.isMajor,
                            )
                          }
                        >
                          {subject.isMajor ? (
                            <CheckedIcon>
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M20 6L9 17L4 12"
                                  stroke="#FFFFFF"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </CheckedIcon>
                          ) : (
                            <UncheckedIcon />
                          )}
                        </CheckboxWrapper>
                      </ColMajor>
                      <ColDelete>
                        <DeleteButton
                          onClick={() => handleDeleteSubject(subject.id)}
                        >
                          <Icon name="close-md" size={16} />
                        </DeleteButton>
                      </ColDelete>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {/* 테이블 하단 컨트롤 */}
              <TableFooter>
                <AddSubjectButton onClick={handleAddSubject}>
                  <Icon name="add-plus-sm" size={16} />
                  <span>과목 추가</span>
                </AddSubjectButton>
                <ResetButton onClick={handleResetSubjects}>초기화</ResetButton>
              </TableFooter>
            </GradeTable>
          </>
        )}
      </MainContainer>

      {/* 학기 선택 바텀 시트 */}
      {showSemesterSheet && (
        <>
          <SheetOverlay onClick={() => setShowSemesterSheet(false)} />
          <BottomSheet>
            <SheetHeader>
              <div className="drag-handle" />
              <div className="title">학기 선택</div>
            </SheetHeader>
            <SheetList>
              {sortedSemesterKeys.length === 0 ? (
                <EmptySheetText>추가된 학기가 없습니다.</EmptySheetText>
              ) : (
                sortedSemesterKeys.map((key) => (
                  <SemesterSheetRow key={key} $active={key === selectedSemesterKey}>
                    <SemesterLabelButton
                      $active={key === selectedSemesterKey}
                      onClick={() => {
                        setSelectedSemesterKey(key);
                        setShowSemesterSheet(false);
                      }}
                    >
                      {formatSemesterKeyLabel(key)}
                    </SemesterLabelButton>
                    <DeleteSemesterButton
                      onClick={() => handleDeleteSemesterEntry(key)}
                      aria-label="학기 삭제"
                    >
                      <Icon name="trash-full" size={16} />
                    </DeleteSemesterButton>
                  </SemesterSheetRow>
                ))
              )}
              <AddSemesterRow
                onClick={() => {
                  setShowSemesterSheet(false);
                  openAddSemesterModal();
                }}
              >
                <Icon name="add-plus-sm" size={16} />
                <span>학기 추가</span>
              </AddSemesterRow>
            </SheetList>
          </BottomSheet>
        </>
      )}

      {/* 학기 추가 모달 */}
      <Modal
        isOpen={showAddSemesterModal}
        onClose={() => setShowAddSemesterModal(false)}
        title="학기 추가"
        description="추가할 학기의 연도와 학기를 선택해주세요."
        primaryButton={{
          text: "추가",
          variant: "brand",
          onClick: handleConfirmAddSemester,
          disabled: !isNewSemesterValid,
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setShowAddSemesterModal(false),
        }}
      >
        <InputField
          label="연도"
          value={newSemesterYearInput}
          onChange={(v) => setNewSemesterYearInput(v.replace(/\D/g, "").slice(0, 4))}
          placeholder="예: 2026"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <TermPickerRow>
          {(Object.keys(TERM_LABELS) as Term[]).map((term) => (
            <TermPickerButton
              key={term}
              type="button"
              $active={term === newSemesterTerm}
              onClick={() => setNewSemesterTerm(term)}
            >
              {TERM_LABELS[term]}
            </TermPickerButton>
          ))}
        </TermPickerRow>
      </Modal>

      {/* 시간표 불러오기 바텀 시트 */}
      {showTimetableSheet && (
        <>
          <SheetOverlay onClick={() => setShowTimetableSheet(false)} />
          <BottomSheet>
            <SheetHeader>
              <div className="drag-handle" />
              <div className="title">시간표 불러오기</div>
            </SheetHeader>
            <SheetList>
              {timetables.length === 0 ? (
                <EmptySheetText>등록된 시간표가 없습니다.</EmptySheetText>
              ) : (
                timetables.map((tb) => (
                  <SheetItem
                    key={tb.id}
                    onClick={() => handleImportTimetable(tb.id)}
                  >
                    <div className="timetable-info">
                      <span className="semester">{tb.semester}</span>
                      <span className="name">{tb.name}</span>
                      <span className="count">
                        ({getUniqueCourseEvents(tb.events).length}개 과목)
                      </span>
                    </div>
                  </SheetItem>
                ))
              )}
            </SheetList>
          </BottomSheet>
        </>
      )}

      <GradeImportSheet
        isOpen={showGradeImportSheet}
        onClose={() => setShowGradeImportSheet(false)}
        targetSemesterLabel={selectedSemesterLabel}
        onApply={handleApplyImportedGrades}
      />

      <FloatingSaveArea>
        <CapsuleButton
          variant="primary"
          fullWidth
          disabled={!hasChanges || isSaving}
          loading={isSaving}
          onClick={handleSave}
          style={{ width: "fit-content" }}
        >
          저장
        </CapsuleButton>
      </FloatingSaveArea>
    </PageWrapper>
  );
}

// --- Styled Components ---

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 24px 16px calc(112px + env(safe-area-inset-bottom, 0px));
  gap: 16px;
`;

const FloatingSaveArea = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding: 12px 16px calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  background: linear-gradient(
    180deg,
    rgba(248, 249, 251, 0) 0%,
    rgba(248, 249, 251, 0.45) 45%,
    rgba(248, 249, 251, 0.85) 100%
  );
`;

// 1. 요약 카드 스타일
const StickyStatsCard = styled.div`
  background-color: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 16px 20px 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
`;

const StatsHeader = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
`;

const StatsTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #333d4b);
  margin: 0;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 8px;
`;

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: var(--text-tertiary, #8b95a1);
  margin-bottom: 4px;
`;

const StatValueWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2px;
`;

const StatValueText = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-secondary, #333d4b);
  letter-spacing: -0.2px;
  line-height: 32px;
`;

const StatMaxText = styled.span`
  font-size: 12px;
  color: var(--text-tertiary, #8b95a1);
  line-height: 16px;
`;

const TargetCreditsButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  padding: 0;
  outline: none;

  .target-limit {
    font-size: 12px;
    color: var(--text-tertiary, #8b95a1);
    line-height: 16px;
  }

  .pencil-icon {
    color: var(--text-tertiary, #8b95a1);
    opacity: 0.8;
  }

  &:hover .pencil-icon {
    opacity: 1;
  }
`;

const GraphSection = styled.div<{ $expanded: boolean }>`
  border-top: 1px solid
    ${(props) => (props.$expanded ? "var(--border-default, #e5e8eb)" : "transparent")};
  padding: ${(props) => (props.$expanded ? "16px 0 8px" : "0px")};
  width: 100%;
  max-height: ${(props) => (props.$expanded ? "320px" : "0px")};
  opacity: ${(props) => (props.$expanded ? "1" : "0")};
  transform: ${(props) => (props.$expanded ? "translateY(0)" : "translateY(-10px)")};
  overflow: hidden;
  transition:
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s ease;
`;

const GraphHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 44px;
`;

const GraphFoldButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
  outline: none;

  span {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-tertiary, #8b95a1);
  }

  .caret-icon {
    color: var(--text-tertiary, #8b95a1);
  }
`;

const GraphLegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  span {
    font-size: 12px;
    color: var(--text-tertiary, #8b95a1);
  }
`;

const GraphCardBody = styled.div`
  display: flex;
  width: 100%;
  margin-top: 8px;
`;

const EmptyGraphText = styled.div`
  text-align: center;
  font-size: 14px;
  color: var(--text-disabled, #b0b8c1);
  padding: 40px 16px;
  width: 100%;
`;

// 2. 메인 컨테이너 스타일
const MainContainer = styled.div`
  background-color: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
`;

const SemesterSummaryHeader = styled.div`
  padding: 16px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SemesterSelectButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
  align-self: flex-start;
  outline: none;

  .semester-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary, #333d4b);
  }

  .dropdown-caret {
    color: var(--text-secondary, #333d4b);
  }
`;

const SemesterStatsRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-top: 4px;
`;

const SemStatBox = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;

  .stat-val {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary, #333d4b);

    &.bold {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.2px;
      line-height: 32px;
    }
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-tertiary, #8b95a1);
  }
`;

const ImportButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const ImportTimetableButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 0;
  align-self: flex-start;
  outline: none;
  margin-top: 8px;

  .calendar-icon {
    color: var(--text-brand, #0061ff);
  }

  .import-text {
    font-size: 14px;
    color: var(--text-brand, #0061ff);
  }
`;

// 3. 과목 테이블 스타일
const GradeTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  border-top: 1px solid var(--border-default, #e5e8eb);
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  background-color: var(--bg-subtle, #f8f9fb);
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
  font-weight: 400;
  text-align: center;
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100px;
`;

const TableRow = styled.div<{ $dimmed?: boolean }>`
  display: flex;
  align-items: center;
  height: 52px;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  /* 재수강으로 성적이 취소된 과목 — 계산에서 빠졌다는 걸 보이게 남긴다 */
  opacity: ${({ $dimmed }) => ($dimmed ? 0.5 : 1)};
  &:last-child {
    border-bottom: none;
  }
`;

const EmptyRowText = styled.div`
  text-align: center;
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
  padding: 40px 16px;
`;

// 컬럼 비율/가로 정의
const ColSubject = styled.div`
  flex: 1;
  text-align: left;
  padding-left: 16px;
  min-width: 0;
`;

const ColCredits = styled.div`
  width: 60px;
  text-align: center;
  display: flex;
  justify-content: center;
`;

const ColGrade = styled.div`
  width: 70px;
  text-align: center;
  display: flex;
  justify-content: center;
`;

const ColMajor = styled.div`
  width: 50px;
  text-align: center;
  display: flex;
  justify-content: center;
`;

const ColDelete = styled.div`
  width: 40px;
  text-align: center;
  display: flex;
  justify-content: center;
  padding-right: 8px;
`;

// 입력 요소들 스타일
const SubjectInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-secondary, #333d4b);
  outline: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  &::placeholder {
    color: var(--text-disabled, #b0b8c1);
  }
`;

const CreditsSelectorWrapper = styled.div`
  position: relative;
  width: 44px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 8px;
  background-color: var(--bg-subtle, #f8f9fb);
  cursor: pointer;

  .credits-val {
    font-size: 14px;
    color: var(--text-secondary, #333d4b);
  }
`;

const GradeSelectorButton = styled.div`
  position: relative;
  background-color: var(--bg-warn-subtle, #fffaeb);
  border: 1px solid #fef3c7; /* border/warn-subtle */
  border-radius: 999px;
  height: 32px;
  width: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;

  .grade-val {
    font-size: 14px;
    font-weight: 500;
    color: var(--yellow-600, #b58000);
    text-align: center;
    min-width: 24px;
  }

  .grade-caret {
    color: var(--yellow-600, #b58000);
    opacity: 0.4;
  }
`;

// 네이티브 셀렉트 오버레이
const HiddenSelect = styled.select`
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  -webkit-appearance: none;
  outline: none;
`;

// 체크박스 커스텀
const CheckboxWrapper = styled.div`
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CheckedIcon = styled.div`
  width: 24px;
  height: 24px;
  background-color: var(--interactive-primary-pressed, #0061ff);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UncheckedIcon = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-strong, #d1d6db);
  border-radius: 8px;
  box-sizing: border-box;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary, #8b95a1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  outline: none;
  opacity: 0.7;

  &:hover {
    color: var(--text-error, #ef4444);
    opacity: 1;
  }
`;

// 테이블 푸터 컨트롤
const TableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  border-top: 1px solid var(--border-default, #e5e8eb);
`;

const AddSubjectButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--interactive-primary, #3b82f6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  padding: 4px 0;
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  padding: 4px 0;
`;

// 바텀 시트 스타일들
const SheetOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const BottomSheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-base, #ffffff);
  border-radius: 24px 24px 0 0;
  max-height: 70vh;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s cubic-bezier(0.1, 0.76, 0.55, 0.94);

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const SheetHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px 8px;

  .drag-handle {
    width: 36px;
    height: 4px;
    background-color: var(--border-default, #e5e8eb);
    border-radius: 2px;
    margin-bottom: 12px;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary, #333d4b);
  }
`;

const SheetList = styled.div`
  overflow-y: auto;
  padding: 8px 16px 24px;
  display: flex;
  flex-direction: column;
`;

const SheetItem = styled.div<{ $active?: boolean }>`
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 12px;
  font-size: 15px;
  color: ${({ $active }) => ($active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #333d4b)")};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  background-color: ${({ $active }) => ($active ? "var(--bg-brand-subtle, #eff6ff)" : "transparent")};
  cursor: pointer;

  &:active {
    background-color: var(--bg-muted, #f1f3f5);
  }

  .timetable-info {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    .semester {
      font-size: 12px;
      color: var(--text-tertiary, #8b95a1);
    }

    .name {
      font-size: 14px;
      color: var(--text-secondary, #333d4b);
      font-weight: 500;
    }

    .count {
      font-size: 12px;
      color: var(--text-brand, #0061ff);
    }
  }
`;

const EmptySheetText = styled.div`
  text-align: center;
  font-size: 14px;
  color: var(--text-tertiary, #8b95a1);
  padding: 32px 16px;
`;

// 학기 선택 시트의 학기 항목(라벨 + 삭제 버튼)
const SemesterSheetRow = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  border-radius: 12px;
  background-color: ${({ $active }) =>
    $active ? "var(--bg-brand-subtle, #eff6ff)" : "transparent"};
`;

const SemesterLabelButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 8px 0 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 15px;
  color: ${({ $active }) =>
    $active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #333d4b)"};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  outline: none;
`;

const DeleteSemesterButton = styled.button`
  width: 40px;
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-tertiary, #8b95a1);
  cursor: pointer;
  outline: none;

  &:hover {
    color: var(--text-error, #ef4444);
  }
`;

const AddSemesterRow = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 52px;
  padding: 0 16px;
  margin-top: 4px;
  border: none;
  border-top: 1px solid var(--border-default, #e5e8eb);
  background: none;
  color: var(--text-brand, #0061ff);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
`;

// 학기 추가 모달의 학기(FIRST/SUMMER/SECOND/WINTER) 선택 버튼 그룹
const TermPickerRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const TermPickerButton = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: 70px;
  padding: 10px 0;
  border-radius: 10px;
  border: 1px solid
    ${({ $active }) =>
    $active ? "var(--border-brand, #0061ff)" : "var(--border-default, #e5e8eb)"};
  background-color: ${({ $active }) =>
    $active ? "var(--bg-brand-subtle, #eff6ff)" : "var(--bg-base, #ffffff)"};
  color: ${({ $active }) =>
    $active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #333d4b)"};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  outline: none;
`;

// 학기가 하나도 없을 때 메인 카드에 보여주는 빈 상태
const EmptySemesterState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 20px;
  text-align: center;

  p {
    margin: 0;
    font-size: 14px;
    color: var(--text-secondary, #333d4b);
  }

  .sub {
    font-size: 13px;
    color: var(--text-tertiary, #8b95a1);
    margin-bottom: 8px;
  }
`;
