import React, { useState, useMemo, useEffect, useRef } from "react";
import styled from "styled-components";
import { X, Star, Check, RotateCcw, ChevronRight } from "lucide-react";
import { useNavigate, useLocation, useBlocker, useBeforeUnload } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { backHandler } from "@/utils/backHandler";
import Modal from "@/components/common/Modal";
import TimetableGrid, {
  ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";
import Ripple from "@/components/common/Ripple";
import CapsuleButton from "@/components/common/CapsuleButton";

// --- Types & Constants ---
export interface FilterState {
  major: string | null;
  sort: string;
  time: string;
  grades: number[];
  types: string[];
  credits: number[];
  selectedSlots?: string[];
}

export const DEFAULT_FILTERS: FilterState = {
  major: null,
  sort: "기본순",
  time: "전체 시간",
  grades: [],
  types: [],
  credits: [],
  selectedSlots: [],
};

const CATEGORIES = [
  { id: "major", label: "전공/영역" },
  { id: "sort", label: "정렬" },
  { id: "time", label: "시간" },
  { id: "grade", label: "학년" },
  { id: "type", label: "이수구분" },
  { id: "credit", label: "학점" },
] as const;

// 단과대별 매핑 (피그마 전공영역 매핑 재현)
const COLLEGE_DEPARTMENTS: Record<string, string[]> = {
  인문대학: [
    "국어국문학과",
    "영어영문학과",
    "독어독문학과",
    "불어불문학과",
    "일어일문학과",
    "중어중문학과",
  ],
  자연과학대학: ["수학과", "물리학과", "화학과", "패션산업학과", "해양학과"],
  사회과학대학: [
    "사회복지학과",
    "신문방송학과",
    "문헌정보학과",
    "창의인재개발학과",
  ],
  글로벌정경대학: [
    "행정학과",
    "정치외교학과",
    "경제학과",
    "무역학부",
    "소비자학과",
  ],
  공과대학: [
    "기계공학과",
    "메카트로닉스공학과",
    "전기공학과",
    "전자공학과",
    "산업경영공학과",
    "신소재공학과",
    "안전공학과",
    "화학공학과",
    "건설환경공학",
    "도시건설기초",
  ],
  정보기술대학: ["컴퓨터공학부", "정보통신공학과", "임베디드시스템공학과"],
  경영대학: ["경영학부", "세무회계학과"],
  예술체육대학: ["조형예술학부", "디자인학부", "스포츠과학부", "운동건강학부"],
  사범대학: [
    "국어교육과",
    "영어교육과",
    "일어교육과",
    "수학교육과",
    "체육교육과",
    "유아교육과",
    "역사교육과",
    "윤리교육과",
  ],
  도시과학대학: [
    "도시행정학과",
    "도시공학과",
    "도시환경공학",
    "소방방재학과",
    "도시건축학",
  ],
  생명과학기술대학: ["생명과학부", "분자의생명전공", "생명공학부"],
  융합자유전공대학: ["융합자유전공학부"],
  단과대구분없음: ["군사학", "기타교양", "교직"],
};

const MAJOR_CATEGORIES = [
  { id: "major_1", name: "전공", hasChevron: true },
  { id: "major_2", name: "교양", hasChevron: true },
  { id: "major_3", name: "교직", hasChevron: false },
  { id: "major_4", name: "일반선택", hasChevron: false },
  { id: "major_5", name: "군사학", hasChevron: false },
  { id: "major_6", name: "기타", hasChevron: true },
];

const SUB_MAJORS: Record<string, string[]> = {
  전공: Object.keys(COLLEGE_DEPARTMENTS),
  교양: ["기초교양", "균형교양", "일반교양"],
  기타: ["기타 영역 1", "기타 영역 2"],
};

// 목업 내 시간표 (시간 선택 시 가이드 오버레이용)
const MOCK_MY_TIMETABLE: ClassItem[] = [
  {
    id: 1,
    name: "데이터구조",
    room: "302호",
    day: 0,
    startTime: 9,
    endTime: 11,
  },
  {
    id: 2,
    name: "운영체제",
    room: "404호",
    day: 0,
    startTime: 13,
    endTime: 15,
  },
];

export function formatSlotsToTimeStr(slots: string[]): string {
  if (!slots || slots.length === 0) return "직접 시간 선택";
  const DAYS_SHORT = ["월", "화", "수", "목", "금"];

  const dayGroups: Record<number, number[]> = {};
  slots.forEach((slot) => {
    const [dStr, hStr] = slot.split("-");
    const d = parseInt(dStr, 10);
    const h = parseFloat(hStr);
    if (!dayGroups[d]) dayGroups[d] = [];
    dayGroups[d].push(h);
  });

  const dayStrings: string[] = [];
  const sortedDays = Object.keys(dayGroups)
    .map(Number)
    .sort((a, b) => a - b);

  sortedDays.forEach((d) => {
    const hours = dayGroups[d].sort((a, b) => a - b);
    const ranges: string[] = [];

    let start = hours[0];
    let prev = hours[0];

    for (let i = 1; i <= hours.length; i++) {
      const current = hours[i];
      if (current === prev + 0.5) {
        prev = current;
      } else {
        const end = prev + 0.5;
        const formatHour = (val: number): string => {
          const h = Math.floor(val);
          const m = Math.round((val - h) * 60);
          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        };
        ranges.push(`${formatHour(start)}~${formatHour(end)}`);
        start = current;
        prev = current;
      }
    }

    dayStrings.push(`${DAYS_SHORT[d] || "요일"}(${ranges.join(",")})`);
  });

  return dayStrings.join(" ");
}

type SubScreenType =
  | "main"
  | "major"
  | "sort"
  | "time"
  | "grade"
  | "type"
  | "credit";

export default function MobileCourseFilterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 상위 편집 화면에서 전달한 필터 상태가 있다면 수신, 없으면 디폴트
  const initialFilters = useMemo(() => {
    const stateFilters = location.state?.filters as FilterState | undefined;
    return stateFilters ? { ...stateFilters } : { ...DEFAULT_FILTERS };
  }, [location.state]);

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [view, setSubView] = useState<SubScreenType>("main");
  const [majorLevel1, setMajorLevel1] = useState<string | null>(null);
  const [majorLevel2, setMajorLevel2] = useState<string | null>(null);

  const setView = (newView: SubScreenType) => {
    setSubView(newView);
    if (newView === "major") {
      setMajorLevel1(null);
      setMajorLevel2(null);
    }
  };
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // localStorage 파열 언마운트 클린업용 제어 ref
  const hasWrittenLocalStorageRef = useRef(false);
  const initialFiltersRef = useRef(initialFilters);
  useEffect(() => {
    initialFiltersRef.current = initialFilters;
  }, [initialFilters]);

  // 컴포넌트가 언마운트될 때, 저장하지 않고 나가는 맰 경우 initialFilters를 localStorage에 복원
  // (헤더 뿯로가기, 브라우저 뿯로가기, OS 백키 등 모든 이탈 경로에서 필터 상태를 보장)
  useEffect(() => {
    return () => {
      if (!hasWrittenLocalStorageRef.current) {
        localStorage.setItem("applied_filters", JSON.stringify(initialFiltersRef.current));
      }
    };
  }, []);

  // 초기 상태 대비 변경 사항이 존재하는지 깊은 비교
  const hasChanges = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(initialFilters);
  }, [filters, initialFilters]);

  const [hasPushState, setHasPushState] = useState(false);
  const isOverlayOpen = view !== "main";

  // 라우터 이탈 방지용 blocker (상세 오버레이 스택 정리 중인 back() 동작과 충돌하지 않도록 처리, 저장 중이면 비활성)
  const blocker = useBlocker(!hasPushState && !isSaving && view === "main" && hasChanges);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowUnsavedModal(true);
    }
  }, [blocker.state]);

  useBeforeUnload(
    (event) => {
      if (view !== "main" || !hasChanges) return;
      event.preventDefault();
      event.returnValue = "";
    },
    { capture: true }
  );

  const handleStayOnPage = () => {
    setShowUnsavedModal(false);
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  const handleLeaveWithoutSaving = () => {
    setShowUnsavedModal(false);
    backHandler.setPageUnsavedChanges(false);

    // 변경 전 원본 필터를 localStorage에 복원하여 시트가 올바른 상태를 읽도록 함
    hasWrittenLocalStorageRef.current = true;
    localStorage.setItem("applied_filters", JSON.stringify(initialFilters));

    if (blocker.state === "blocked") {
      blocker.proceed();
      return;
    }
    
    // navigate(-1) 호출 전 blocker를 비활성화하여 이중 모달 방지
    setIsSaving(true);
    if (window.AndroidBridge && typeof window.AndroidBridge.goBack === "function") {
      window.AndroidBridge.goBack();
    } else {
      navigate(-1);
    }
  };

  // 1회성 pushState 스택 관리 및 뒤로가기 popstate 연동
  useEffect(() => {
    if (isOverlayOpen) {
      if (!hasPushState) {
        window.history.pushState({ filterOverlayOpen: true }, "");
        setHasPushState(true);
      }

      const handlePopState = () => {
        setHasPushState(false);
        
        if (view === "major") {
          if (majorLevel2) {
            setMajorLevel2(null);
            window.history.pushState({ filterOverlayOpen: true }, "");
            setHasPushState(true);
          } else if (majorLevel1) {
            setMajorLevel1(null);
            window.history.pushState({ filterOverlayOpen: true }, "");
            setHasPushState(true);
          } else {
            setView("main");
          }
        } else {
          setView("main");
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      if (hasPushState) {
        window.history.back();
        // window.history.back() 비동기 동작이 완료되고 react-router-dom의
        // popstate 수신 전파가 끝날 때까지 useBlocker 활성화를 150ms 지연하여 타이밍 충돌을 방지합니다.
        setTimeout(() => {
          setHasPushState(false);
        }, 150);
      }
    }
  }, [isOverlayOpen, view, majorLevel1, majorLevel2, hasPushState]);

  // 페이지 단위 미저장이탈 방지 등록 (필터 메인이고 변경사항이 있을 때)
  useEffect(() => {
    const handlePageBack = () => {
      setShowUnsavedModal(true);
      return true;
    };

    if (view === "main" && hasChanges) {
      backHandler.setPageUnsavedChanges(true, handlePageBack);
    } else {
      backHandler.setPageUnsavedChanges(false);
    }

    return () => {
      backHandler.setPageUnsavedChanges(false);
    };
  }, [view, hasChanges]);

  const [pinnedMajors, setPinnedMajors] = useState<string[]>(["정보기술대학"]); // 즐겨찾기 단과대/학과 핀

  // 시간표 관련 내부 임시 설정
  const [showClasses, setShowClasses] = useState(true);

  // 헤더 변경 연동
  const headerConfig = useMemo(() => {
    const configMap: Record<
      SubScreenType,
      { title: string; onBack: () => void }
    > = {
      main: {
        title: "필터",
        onBack: () => {
          if (hasChanges) {
            setShowUnsavedModal(true);
          } else {
            navigate(-1);
          }
        },
      },
      major: {
        title: "전공/영역",
        onBack: () => {
          if (majorLevel2) {
            setMajorLevel2(null);
          } else if (majorLevel1) {
            setMajorLevel1(null);
          } else {
            setView("main");
          }
        },
      },
      sort: {
        title: "정렬",
        onBack: () => setView("main"),
      },
      time: {
        title: "시간",
        onBack: () => setView("main"),
      },
      grade: {
        title: "학년",
        onBack: () => setView("main"),
      },
      type: {
        title: "이수구분",
        onBack: () => setView("main"),
      },
      credit: {
        title: "학점",
        onBack: () => setView("main"),
      },
    };

    return configMap[view];
  }, [view, majorLevel1, majorLevel2, hasChanges, navigate]);

  useHeader({
    title: headerConfig.title,
    hasback: true,
    showAlarm: false,
    onBack: headerConfig.onBack,
    pageBgColor: "var(--bg-subtle, #f8f9fb)",
  });


  // 초기화 핸들러
  const handleReset = () => {
    if (!window.confirm("선택된 필터를 초기화할까요?")) return;
    setFilters({ ...DEFAULT_FILTERS });
  };

  // 시간 전용 초기화 핸들러
  const handleResetTime = () => {
    setFilters((prev) => ({
      ...prev,
      time: "전체 시간",
      selectedSlots: [],
    }));
  };

  // 저장하기 핸들러 (편집 페이지로 복귀)
  const handleSave = () => {
    hasWrittenLocalStorageRef.current = true; // 언마운트 cleanup 덮어쓰기 방지
    setIsSaving(true); // blocker 비활성화 후 navigate
    localStorage.setItem("applied_filters", JSON.stringify(filters));
    navigate(-1);
  };

  // 즐겨찾기 별표 토글
  const togglePin = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedMajors((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  // --- 카테고리별 Chip 요약 목록 ---
  const majorChips = useMemo(() => {
    if (!filters.major) return [];
    return [filters.major];
  }, [filters.major]);

  const sortChips = useMemo(() => {
    if (filters.sort === "기본순") return [];
    return [filters.sort];
  }, [filters.sort]);

  const timeChips = useMemo(() => {
    if (filters.time === "전체 시간" || filters.time === "직접 시간 선택") return [];
    return filters.time.split(" ");
  }, [filters.time]);

  const gradeChips = useMemo(() => {
    return filters.grades.map((g) => `${g}학년`);
  }, [filters.grades]);

  const typeChips = useMemo(() => {
    return filters.types;
  }, [filters.types]);

  const creditChips = useMemo(() => {
    return filters.credits.map((c) => (c === 4 ? "4학점 이상" : `${c}학점`));
  }, [filters.credits]);

  // 카테고리별로 칩 매핑
  const categoryChips: Record<(typeof CATEGORIES)[number]["id"], string[]> = {
    major: majorChips,
    sort: sortChips,
    time: timeChips,
    grade: gradeChips,
    type: typeChips,
    credit: creditChips,
  };

  // 전공/영역 상세 선택
  const handleSelectMajor = (majorName: string) => {
    setFilters((prev) => ({
      ...prev,
      major: prev.major === majorName ? null : majorName,
    }));
    // 전공/학과 최종 선택 완료 시 필터 메인화면으로 복귀
    setView("main");
  };

  // 정렬 단일 선택
  const handleSelectSort = (sortOption: string) => {
    setFilters((prev) => ({ ...prev, sort: sortOption }));
    setView("main");
  };

  // 다중선택 토글 핸들러들
  const toggleGrade = (g: number) => {
    setFilters((prev) => {
      const grades = prev.grades.includes(g)
        ? prev.grades.filter((item) => item !== g)
        : [...prev.grades, g];
      return { ...prev, grades };
    });
  };

  const toggleType = (t: string) => {
    setFilters((prev) => {
      const types = prev.types.includes(t)
        ? prev.types.filter((item) => item !== t)
        : [...prev.types, t];
      return { ...prev, types };
    });
  };

  const toggleCredit = (c: number) => {
    setFilters((prev) => {
      const credits = prev.credits.includes(c)
        ? prev.credits.filter((item) => item !== c)
        : [...prev.credits, c];
      return { ...prev, credits };
    });
  };

  // 시간 필터 선택 제거됨 (직접 오버레이 선택으로 일치)

  const handleRemoveChip = (
    catId: string,
    chip: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // prevent opening category sub-screen
    setFilters((prev) => {
      switch (catId) {
        case "major":
          return { ...prev, major: null };
        case "sort":
          return { ...prev, sort: "기본순" };
        case "time": {
          const dayChar = chip.charAt(0);
          const DAYS_SHORT = ["월", "화", "수", "목", "금"];
          const dayIdx = DAYS_SHORT.indexOf(dayChar);
          const nextSlots = (prev.selectedSlots || []).filter(
            (slot) => !slot.startsWith(`${dayIdx}-`)
          );
          const nextTimeStr = nextSlots.length > 0 ? formatSlotsToTimeStr(nextSlots) : "전체 시간";
          return {
            ...prev,
            time: nextTimeStr,
            selectedSlots: nextSlots,
          };
        }
        case "grade": {
          const val = parseInt(chip.replace("학년", ""), 10);
          return { ...prev, grades: prev.grades.filter((g) => g !== val) };
        }
        case "type":
          return { ...prev, types: prev.types.filter((t) => t !== chip) };
        case "credit": {
          const val =
            chip === "4학점 이상" ? 4 : parseInt(chip.replace("학점", ""), 10);
          return { ...prev, credits: prev.credits.filter((c) => c !== val) };
        }
        default:
          return prev;
      }
    });
  };

  return (
    <PageWrapper>
      {/* 1. 메인 필터 항목 목록 */}
      {view === "main" && (
        <ScrollContent>
          <CategoriesContainer>
            {CATEGORIES.map((cat) => {
              const chips = categoryChips[cat.id];
              return (
                <CategoryItemRow key={cat.id} onClick={() => setView(cat.id)}>
                  <CategoryTextWrapper>
                    <CategoryLabel>{cat.label}</CategoryLabel>
                    <ChipsScrollWrapper>
                      {chips.map((chip, idx) => (
                        <ChipItem
                          key={`${cat.id}-chip-${idx}`}
                          data-no-ripple="true"
                          onClick={(e) => handleRemoveChip(cat.id, chip, e)}
                        >
                          <span>{chip}</span>
                          <XIconWrapper>
                            <X size={12} color="var(--text-brand, #0061ff)" />
                          </XIconWrapper>
                        </ChipItem>
                      ))}
                    </ChipsScrollWrapper>
                  </CategoryTextWrapper>
                  <ChevronWrapper>
                    <ChevronRight size={20} color="var(--gray-400, #b0b8c1)" />
                  </ChevronWrapper>
                  <Ripple />
                </CategoryItemRow>
              );
            })}
          </CategoriesContainer>
          <BottomActionsSpacer />
        </ScrollContent>
      )}

      {/* 2. 전공/영역 상세 */}
      {view === "major" && (
        <ScrollContent>
          <BreadcrumbRow>
            <BreadcrumbItem $active={!majorLevel1}>전공/영역</BreadcrumbItem>
            {majorLevel1 && (
              <>
                <ChevronRight size={16} color="var(--gray-400, #b0b8c1)" />
                <BreadcrumbItem $active={!majorLevel2}>
                  {majorLevel1}
                </BreadcrumbItem>
              </>
            )}
            {majorLevel2 && (
              <>
                <ChevronRight size={16} color="var(--gray-400, #b0b8c1)" />
                <BreadcrumbItem $active={true}>{majorLevel2}</BreadcrumbItem>
              </>
            )}
          </BreadcrumbRow>

          {/* 대분류 목록 */}
          {!majorLevel1 && (
            <OptionsCard>
              {MAJOR_CATEGORIES.map((m) => {
                const isSelected = filters.major === m.name;
                return (
                  <OptionItemRow
                    key={m.id}
                    onClick={() => {
                      if (m.hasChevron) {
                        setMajorLevel1(m.name);
                      } else {
                        handleSelectMajor(m.name);
                      }
                    }}
                  >
                    <OptionLabel>{m.name}</OptionLabel>
                    {m.hasChevron ? (
                      <ChevronRight
                        size={20}
                        color="var(--gray-400, #b0b8c1)"
                      />
                    ) : (
                      isSelected && (
                        <Check size={20} color="var(--border-brand, #0061ff)" />
                      )
                    )}
                    <Ripple />
                  </OptionItemRow>
                );
              })}
            </OptionsCard>
          )}

          {/* 전공 하위 - 단과대학 목록 */}
          {majorLevel1 === "전공" && !majorLevel2 && (
            <OptionsCard>
              {SUB_MAJORS["전공"].map((college) => {
                const isPinned = pinnedMajors.includes(college);
                return (
                  <OptionItemRow
                    key={college}
                    onClick={() => setMajorLevel2(college)}
                  >
                    <FavoriteStarButton
                      data-no-ripple="true"
                      onClick={(e) => togglePin(college, e)}
                    >
                      <Star
                        size={24}
                        color={
                          isPinned
                            ? "var(--yellow-400, #ffc021)"
                            : "var(--gray-300, #d1d6db)"
                        }
                        fill={isPinned ? "var(--yellow-400, #ffc021)" : "none"}
                      />
                    </FavoriteStarButton>
                    <OptionLabel>{college}</OptionLabel>
                    <ChevronRight size={20} color="var(--gray-400, #b0b8c1)" />
                    <Ripple />
                  </OptionItemRow>
                );
              })}
            </OptionsCard>
          )}

          {/* 교양/기타 하위 목록 */}
          {majorLevel1 && majorLevel1 !== "전공" && (
            <OptionsCard>
              {(SUB_MAJORS[majorLevel1] || []).map((subName) => {
                const isSelected = filters.major === subName;
                return (
                  <OptionItemRow
                    key={subName}
                    onClick={() => handleSelectMajor(subName)}
                  >
                    <OptionLabel style={{ paddingLeft: "8px" }}>
                      {subName}
                    </OptionLabel>
                    {isSelected && (
                      <Check size={20} color="var(--border-brand, #0061ff)" />
                    )}
                    <Ripple />
                  </OptionItemRow>
                );
              })}
            </OptionsCard>
          )}

          {/* 단과대학 하위 - 학과 목록 */}
          {majorLevel1 === "전공" && majorLevel2 && (
            <OptionsCard>
              {(COLLEGE_DEPARTMENTS[majorLevel2] || []).map((dept) => {
                const isSelected = filters.major === dept;
                const isPinned = pinnedMajors.includes(dept);
                return (
                  <OptionItemRow
                    key={dept}
                    onClick={() => handleSelectMajor(dept)}
                  >
                    <FavoriteStarButton
                      data-no-ripple="true"
                      onClick={(e) => togglePin(dept, e)}
                    >
                      <Star
                        size={24}
                        color={
                          isPinned
                            ? "var(--yellow-400, #ffc021)"
                            : "var(--gray-300, #d1d6db)"
                        }
                        fill={isPinned ? "var(--yellow-400, #ffc021)" : "none"}
                      />
                    </FavoriteStarButton>
                    <OptionLabel>{dept}</OptionLabel>
                    {isSelected && (
                      <Check size={20} color="var(--border-brand, #0061ff)" />
                    )}
                    <Ripple />
                  </OptionItemRow>
                );
              })}
            </OptionsCard>
          )}
        </ScrollContent>
      )}

      {/* 3. 정렬 상세 */}
      {view === "sort" && (
        <ScrollContent>
          <OptionsCard>
            {["기본순", "별점높은순", "담은인원많은순"].map((option) => {
              const isSelected = filters.sort === option;
              return (
                <OptionItemRow
                  key={option}
                  onClick={() => handleSelectSort(option)}
                >
                  <OptionLabel style={{ paddingLeft: "8px" }}>
                    {option}
                  </OptionLabel>
                  {isSelected && (
                    <Check size={20} color="var(--border-brand, #0061ff)" />
                  )}
                  <Ripple />
                </OptionItemRow>
              );
            })}
          </OptionsCard>
        </ScrollContent>
      )}

      {/* 4. 시간 상세 */}
      {view === "time" && (
        <>
          <ScrollContent>
            <TimetableSelectorContainer style={{ marginTop: 0 }}>
              <TimetableToggleHeader style={{ justifyContent: "flex-end" }}>
                <ToggleSwitchWrapper>
                  <ToggleLabel>내 시간표 표시</ToggleLabel>
                  <SwitchInput
                    type="checkbox"
                    checked={showClasses}
                    onChange={(e) => setShowClasses(e.target.checked)}
                  />
                </ToggleSwitchWrapper>
              </TimetableToggleHeader>

              <TimetableGridContainer>
                <TimetableGrid
                  events={MOCK_MY_TIMETABLE}
                  showClasses={showClasses}
                  isSelectionMode={true}
                  selectedSlots={filters.selectedSlots || []}
                  onSelectedSlotsChange={(newSlots) => {
                    const timeStr = formatSlotsToTimeStr(newSlots);
                    setFilters((prev) => ({
                      ...prev,
                      time: timeStr,
                      selectedSlots: newSlots,
                    }));
                  }}
                />
              </TimetableGridContainer>
            </TimetableSelectorContainer>
            <BottomActionsSpacer />
          </ScrollContent>

          {/* 하단 플로팅 액션 버튼 */}
          <FixedBottomContainer style={{ justifyContent: "center" }}>
            <ResetBottomButton
              variant="secondary"
              onClick={handleResetTime}
              leftIcon={<RotateCcw size={16} />}
            >
              초기화
            </ResetBottomButton>
          </FixedBottomContainer>
        </>
      )}

      {/* 5. 학년 상세 */}
      {view === "grade" && (
        <>
          <ScrollContent>
            <OptionsCard>
              {[1, 2, 3, 4].map((g) => {
                const isSelected = filters.grades.includes(g);
                return (
                  <OptionItemRow key={g} onClick={() => toggleGrade(g)}>
                    <CheckboxWrapper>
                      <CheckboxInput
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                      />
                      <OptionLabel>{g}학년</OptionLabel>
                    </CheckboxWrapper>
                    <Ripple />
                  </OptionItemRow>
                );
              })}
            </OptionsCard>
            <BottomActionsSpacer />
          </ScrollContent>
          <FixedBottomContainer>
            <BottomActionButton variant="primary" onClick={() => setView("main")}>
              선택 완료
            </BottomActionButton>
          </FixedBottomContainer>
        </>
      )}

      {/* 6. 이수구분 상세 */}
      {view === "type" && (
        <>
          <ScrollContent>
            <OptionsCard>
              {["전공", "교양", "교직", "일반선택", "군사학", "기타"].map(
                (t) => {
                  const isSelected = filters.types.includes(t);
                  return (
                    <OptionItemRow key={t} onClick={() => toggleType(t)}>
                      <CheckboxWrapper>
                        <CheckboxInput
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                        />
                        <OptionLabel>{t}</OptionLabel>
                      </CheckboxWrapper>
                      <Ripple />
                    </OptionItemRow>
                  );
                },
              )}
            </OptionsCard>
            <BottomActionsSpacer />
          </ScrollContent>
          <FixedBottomContainer>
            <BottomActionButton variant="primary" onClick={() => setView("main")}>
              선택 완료
            </BottomActionButton>
          </FixedBottomContainer>
        </>
      )}

      {/* 7. 학점 상세 */}
      {view === "credit" && (
        <>
          <ScrollContent>
            <OptionsCard>
              {[1, 2, 3, 4].map((c) => {
                const isSelected = filters.credits.includes(c);
                const label = c === 4 ? "4학점 이상" : `${c}학점`;
                return (
                  <OptionItemRow key={c} onClick={() => toggleCredit(c)}>
                    <CheckboxWrapper>
                      <CheckboxInput
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                      />
                      <OptionLabel>{label}</OptionLabel>
                    </CheckboxWrapper>
                    <Ripple />
                  </OptionItemRow>
                );
              })}
            </OptionsCard>
            <BottomActionsSpacer />
          </ScrollContent>
          <FixedBottomContainer>
            <BottomActionButton variant="primary" onClick={() => setView("main")}>
              선택 완료
            </BottomActionButton>
          </FixedBottomContainer>
        </>
      )}

      {/* 하단 고정 액션바 (메인화면에서만 노출) */}
      {view === "main" && (
        <>
          <FixedBottomContainer>
            <ResetBottomButton
              variant="secondary"
              onClick={handleReset}
              leftIcon={<RotateCcw size={16} />}
            >
              초기화
            </ResetBottomButton>
            <BottomActionButton variant="primary" onClick={handleSave}>
              적용하기
            </BottomActionButton>
          </FixedBottomContainer>
        </>
      )}

      {/* 이탈 방지 모달 */}
      <Modal
        isOpen={showUnsavedModal}
        onClose={handleStayOnPage}
        title="변경사항 적용 안 함"
        description="필터 변경사항이 있습니다. 적용하지 않고 시간표 편집 화면으로 돌아갈까요?"
        primaryButton={{
          text: "적용 안 함",
          onClick: handleLeaveWithoutSaving,
          variant: "danger",
        }}
        secondaryButton={{
          text: "취소",
          onClick: handleStayOnPage,
        }}
      />
    </PageWrapper>
  );
}

// --- styled-components ---

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-subtle, #f8f9fb);
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
`;

const CategoriesContainer = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;
`;

const CategoryItemRow = styled.button`
  background: none;
  border: none;
  outline: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 0 16px;
  height: 64px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s ease;
  position: relative;
  overflow: hidden;

  & > *:not(.ripple-container) {
    position: relative;
    z-index: 1;
  }
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  align-self: stretch;
  flex-shrink: 0;
  cursor: pointer;
`;

const CategoryTextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 24px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, var(--bg-base, #ffffff) 100%);
    pointer-events: none;
    z-index: 2;
  }
`;

const CategoryLabel = styled.span`
  color: var(--text-secondary, #333d4b);
  font-family:
    "Pretendard",
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  white-space: nowrap;
`;

const ChipsScrollWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  overflow-x: auto;
  flex: 1;
  min-width: 0;
  padding-right: 8px;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const ChipItem = styled.div`
  background: var(--bg-brand-subtle, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  border-radius: 999px;
  padding: 4px 8px 4px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  span {
    color: var(--text-brand, #0061ff);
    font-family:
      "Pretendard",
      -apple-system,
      BlinkMacSystemFont,
      system-ui,
      sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    user-select: none;
  }
`;

const XIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 999px;
  background-color: transparent;
  opacity: 0.3;
  transition:
    opacity 0.2s,
    background-color 0.2s;

  &:hover {
    opacity: 1;
    background-color: var(--blue-100, #dbeafe);
  }
`;

const BreadcrumbRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
  flex-shrink: 0;
`;

const BreadcrumbItem = styled.span<{ $active?: boolean }>`
  color: ${({ $active }) =>
    $active
      ? "var(--text-secondary, #333d4b)"
      : "var(--text-tertiary, #8b95a1)"};
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
`;

const OptionsCard = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;
`;

const OptionItemRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px 16px 16px;
  height: 64px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
  overflow: hidden;

  & > *:not(.ripple-container) {
    position: relative;
    z-index: 1;
  }
`;

const OptionLabel = styled.span`
  color: var(--gray-900, #191f28);
  font-size: 16px;
  font-weight: 400;
  flex: 1;
  text-align: left;
`;

const FavoriteStarButton = styled.button`
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  margin-right: 12px;
  border-radius: 999px;
  transition: background-color 0.2s;

  &:active {
    background-color: var(--bg-muted, #f1f3f5);
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const CheckboxInput = styled.input`
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1.5px solid var(--gray-400, #b0b8c1);
  background-color: var(--bg-base, #ffffff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:checked {
    border-color: var(--border-brand, #0061ff);
    background-color: var(--border-brand, #0061ff);
  }

  &:checked::after {
    content: "";
    position: absolute;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid #ffffff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const TimetableSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
  width: 100%;
  flex-shrink: 0;
`;

const TimetableToggleHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
`;



const ToggleSwitchWrapper = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const ToggleLabel = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
`;

const SwitchInput = styled.input`
  width: 36px;
  height: 20px;
  appearance: none;
  background-color: var(--gray-300, #d1d6db);
  border-radius: 999px;
  position: relative;
  cursor: pointer;
  outline: none;
  transition: background-color 0.2s;

  &:checked {
    background-color: var(--border-brand, #0061ff);
  }

  &::before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #ffffff;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
  }

  &:checked::before {
    transform: translateX(16px);
  }
`;

const TimetableGridContainer = styled.div`
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg-base, #ffffff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const FixedBottomContainer = styled.div`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 768px;
  background: transparent;
  padding: 0 24px;
  display: flex;
  flex-direction: row;
  gap: 12px;
  box-sizing: border-box;
  z-index: 100;
`;

const BottomActionButton = styled(CapsuleButton)`
  flex: 1 1 0;
  width: auto;
  min-width: 0;
  height: 56px;
  min-height: 56px;
  padding: 12px 24px;
`;

const ResetBottomButton = styled(BottomActionButton)`
  flex: 0 0 auto;
  width: auto;
  padding: 12px 16px;

  span {
    gap: 6px;
    white-space: nowrap;
  }
`;

const BottomActionsSpacer = styled.div`
  height: 80px;
  flex-shrink: 0;
`;
