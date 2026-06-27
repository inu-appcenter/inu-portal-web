import { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { X, Star, Check, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";
import BottomSheet from "@/components/common/BottomSheet";
import { navItems } from "@/resources/strings/navItems";

export interface FilterState {
  major: string | null;
  sort: string; // "기본순", "별점높은순", "담은인원많은순"
  time: string; // "전체 시간", "공강 시간만 보기" 또는 직접 선택한 포맷 (예: "월,수 09:00~13:00")
  grades: number[]; // [1, 2, 3, 4]
  types: string[]; // ["전공", "교양", "교직", "일반선택", "군사학", "기타"]
  credits: number[]; // [1, 2, 3, 4] (4는 4학점 이상)
  selectedDays?: string[]; // 필터용 선택 요일 리스트
  startTime?: string;      // 시작 시간 (HH:MM)
  endTime?: string;        // 종료 시간 (HH:MM)
}

interface MobileCourseFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilters: FilterState;
  onApply: (filters: FilterState) => void;
}

export const DEFAULT_FILTERS: FilterState = {
  major: null,
  sort: "기본순",
  time: "전체 시간",
  grades: [],
  types: [],
  credits: [],
  selectedDays: [],
  startTime: "09:00",
  endTime: "18:00",
};

const CATEGORIES = [
  { id: "major", label: "전공/영역" },
  { id: "sort", label: "정렬" },
  { id: "time", label: "시간" },
  { id: "grade", label: "학년" },
  { id: "type", label: "이수구분" },
  { id: "credit", label: "학점" },
];

// navItems에서 학과 목록 추출하여 전공 리스트 동적 구성
const getMajorsList = () => {
  const deptGroup = navItems.find((item) => item.title === "학과 홈페이지");
  if (!deptGroup || !deptGroup.child) {
    return ["컴퓨터공학부", "정보통신공학과", "임베디드시스템공학과", "전자공학과", "기계공학과", "경영학부"];
  }

  const list: string[] = [];
  deptGroup.child.forEach((item: any) => {
    if (item.subItems) {
      item.subItems.forEach((sub: any) => {
        list.push(sub.title);
      });
    } else if (item.title && item.url) {
      list.push(item.title);
    }
  });
  return list;
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
  "전공": getMajorsList(),
  "교양": ["기초교양", "균형교양", "일반교양"],
  "기타": ["기타 영역 1", "기타 영역 2"],
};

export default function MobileCourseFilterSheet({
  open,
  onOpenChange,
  initialFilters,
  onApply,
}: MobileCourseFilterSheetProps) {
  const [activeTab, setActiveTab] = useState<string>("major");
  const [filters, setFilters] = useState<FilterState>({ ...initialFilters });
  const [subLevel, setSubLevel] = useState<string | null>(null);
  
  // 즐겨찾는 전공/영역 Pinned 상태 관리 (Figma 시안 별표 토글 재현, "전공" 디폴트 핀 처리)
  const [pinnedCategories, setPinnedCategories] = useState<string[]>(["전공"]);
  


  // 탭 변경 시 서브 레벨 초기화
  useEffect(() => {
    setSubLevel(null);
  }, [activeTab]);

  const togglePin = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
  };

  const handleSelectMajor = (majorName: string) => {
    setFilters((prev) => ({
      ...prev,
      major: prev.major === majorName ? null : majorName,
    }));
  };

  const handleSelectSort = (sortName: string) => {
    setFilters((prev) => ({ ...prev, sort: sortName }));
  };



  const handleSelectTimeMode = (mode: string) => {
    if (mode === "전체 시간") {
      setFilters((prev) => ({
        ...prev,
        time: "전체 시간",
        selectedDays: [],
        startTime: "09:00",
        endTime: "18:00",
      }));
    } else if (mode === "공강 시간만 보기") {
      setFilters((prev) => ({
        ...prev,
        time: "공강 시간만 보기",
        selectedDays: [],
        startTime: "09:00",
        endTime: "18:00",
      }));
    } else {
      const days = filters.selectedDays && filters.selectedDays.length > 0 ? filters.selectedDays : ["월"];
      const start = filters.startTime || "09:00";
      const end = filters.endTime || "18:00";
      setFilters((prev) => ({
        ...prev,
        time: `${days.join(",")} ${start}~${end}`,
        selectedDays: days,
        startTime: start,
        endTime: end,
      }));
    }
  };

  const handleToggleDay = (dayName: string) => {
    setFilters((prev) => {
      const days = prev.selectedDays || [];
      const updatedDays = days.includes(dayName)
        ? days.filter((d) => d !== dayName)
        : [...days, dayName];
      
      const start = prev.startTime || "09:00";
      const end = prev.endTime || "18:00";
      const timeStr = updatedDays.length > 0 ? `${updatedDays.join(",")} ${start}~${end}` : "요일 선택 없음";
      
      return {
        ...prev,
        time: timeStr,
        selectedDays: updatedDays,
      };
    });
  };

  const handleTimeValueChange = (type: "start" | "end", val: string) => {
    setFilters((prev) => {
      const days = prev.selectedDays || [];
      const start = type === "start" ? val : (prev.startTime || "09:00");
      const end = type === "end" ? val : (prev.endTime || "18:00");
      const timeStr = days.length > 0 ? `${days.join(",")} ${start}~${end}` : "요일 선택 없음";

      return {
        ...prev,
        time: timeStr,
        startTime: start,
        endTime: end,
      };
    });
  };

  const handleToggleGrade = (grade: number) => {
    setFilters((prev) => {
      const grades = prev.grades.includes(grade)
        ? prev.grades.filter((g) => g !== grade)
        : [...prev.grades, grade];
      return { ...prev, grades };
    });
  };

  const handleToggleType = (type: string) => {
    setFilters((prev) => {
      const types = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      return { ...prev, types };
    });
  };

  const handleToggleCredit = (credit: number) => {
    setFilters((prev) => {
      const credits = prev.credits.includes(credit)
        ? prev.credits.filter((c) => c !== credit)
        : [...prev.credits, credit];
      return { ...prev, credits };
    });
  };

  const handleReset = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setSubLevel(null);
  };

  const handleApply = () => {
    onApply(filters);
    onOpenChange(false);
  };

  const removeBadge = (type: keyof FilterState, value?: any) => {
    setFilters((prev) => {
      if (type === "major") {
        return { ...prev, major: null };
      } else if (type === "sort") {
        return { ...prev, sort: "기본순" };
      } else if (type === "time") {
        return {
          ...prev,
          time: "전체 시간",
          selectedDays: [],
          startTime: "09:00",
          endTime: "18:00",
        };
      } else if (type === "grades") {
        return { ...prev, grades: prev.grades.filter((g) => g !== value) };
      } else if (type === "types") {
        return { ...prev, types: prev.types.filter((t) => t !== value) };
      } else if (type === "credits") {
        return { ...prev, credits: prev.credits.filter((c) => c !== value) };
      }
      return prev;
    });
  };

  // 선택된 뱃지 요약 데이터 구성
  const activeBadgeList = useMemo(() => {
    const list: { key: keyof FilterState; label: string; val?: any }[] = [];
    if (filters.major) {
      list.push({ key: "major", label: filters.major });
    }
    if (filters.sort !== "기본순") {
      list.push({ key: "sort", label: filters.sort });
    }
    if (filters.time !== "전체 시간") {
      list.push({ key: "time", label: filters.time });
    }
    filters.grades.forEach((g) => {
      list.push({ key: "grades", label: `${g}학년`, val: g });
    });
    filters.types.forEach((t) => {
      list.push({ key: "types", label: t, val: t });
    });
    filters.credits.forEach((c) => {
      list.push({
        key: "credits",
        label: c === 4 ? "4학점 이상" : `${c}학점`,
        val: c,
      });
    });
    return list;
  }, [filters]);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      modal={true}
      height="95%"
      zIndex={10010}
    >
      <SheetWrapper>
        {/* 헤더 영역 */}
        <HeaderRow>
          <TitleText>필터</TitleText>
          <CloseIconButton onClick={() => onOpenChange(false)}>
            <X size={20} />
          </CloseIconButton>
        </HeaderRow>

        {/* 선택된 필터 요약 뱃지 행 */}
        <BadgeRowScroll $visible={activeBadgeList.length > 0}>
          {activeBadgeList.map((badge, idx) => (
            <BadgeItem key={`badge-${badge.key}-${idx}`}>
              <BadgeText>{badge.label}</BadgeText>
              <BadgeDeleteBtn onClick={() => removeBadge(badge.key, badge.val)}>
                <X size={12} />
              </BadgeDeleteBtn>
            </BadgeItem>
          ))}
        </BadgeRowScroll>

        {/* 주 내용 영역 (2단 컬럼 구조) */}
        <ContentColumns>
          {/* 좌측 카테고리 탭 사이드바 */}
          <CategorySidebar data-vaul-no-drag="">
            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <CategoryTab
                  key={cat.id}
                  $active={isActive}
                  onClick={() => setActiveTab(cat.id)}
                >
                  <span>{cat.label}</span>
                  {isActive && <ChevronRight size={18} color="var(--text-secondary, #333d4b)" />}
                </CategoryTab>
              );
            })}
          </CategorySidebar>

          {/* 우측 옵션 선택 영역 */}
          <OptionsArea data-vaul-no-drag="">
            {activeTab === "major" && (
              <>
                {subLevel === null ? (
                  <OptionsList>
                    {MAJOR_CATEGORIES.map((m) => {
                      const isPinned = pinnedCategories.includes(m.name);
                      // 대분류가 직접 선택되었거나 세부 전공이 선택된 대분류 하위 항목에 있는 경우 활성 상태 처리
                      const isSelected = filters.major === m.name || (filters.major && SUB_MAJORS[m.name]?.includes(filters.major));
                      return (
                        <OptionItemRow
                          key={m.id}
                          onClick={() => {
                            if (m.hasChevron) {
                              setSubLevel(m.name);
                            } else {
                              handleSelectMajor(m.name);
                            }
                          }}
                        >
                          <PinButton onClick={(e) => togglePin(m.name, e)}>
                            <Star
                              size={28}
                              color={isPinned ? "var(--interactive-primary, #0061FF)" : "#D1D6DB"}
                              fill={isPinned ? "var(--interactive-primary, #0061FF)" : "transparent"}
                            />
                          </PinButton>
                          <OptionLabel>{m.name}</OptionLabel>
                          {m.hasChevron && <ChevronRight size={24} color="#D1D6DB" />}
                          {!m.hasChevron && isSelected && (
                            <Check size={20} color="var(--interactive-primary, #0061FF)" />
                          )}
                        </OptionItemRow>
                      );
                    })}
                  </OptionsList>
                ) : (
                  <OptionsList>
                    <SubHeaderRow>
                      <BackButton onClick={() => setSubLevel(null)}>
                        <ChevronLeft size={20} color="var(--text-primary, #111827)" />
                        <span>{subLevel}</span>
                      </BackButton>
                    </SubHeaderRow>
                    {(SUB_MAJORS[subLevel] || []).map((subName) => {
                      const isSelected = filters.major === subName;
                      return (
                        <OptionItemRow
                          key={subName}
                          onClick={() => handleSelectMajor(subName)}
                        >
                          <OptionLabel style={{ paddingLeft: "44px" }}>{subName}</OptionLabel>
                          {isSelected && <Check size={20} color="var(--interactive-primary, #0061FF)" />}
                        </OptionItemRow>
                      );
                    })}
                  </OptionsList>
                )}
              </>
            )}

            {activeTab === "sort" && (
              <OptionsList>
                {["기본순", "별점높은순", "담은인원많은순"].map((s) => {
                  const isSelected = filters.sort === s;
                  return (
                    <OptionItemRow key={s} onClick={() => handleSelectSort(s)}>
                      <OptionLabel style={{ paddingLeft: "44px" }}>{s}</OptionLabel>
                      {isSelected && <Check size={20} color="var(--interactive-primary, #0061FF)" />}
                    </OptionItemRow>
                  );
                })}
              </OptionsList>
            )}

            {activeTab === "time" && (
              <TimeFilterContainer>
                {/* 1. 시간 필터링 모드 목록 */}
                <OptionsList>
                  {["전체 시간", "공강 시간만 보기", "요일/시간 직접 선택"].map((t) => {
                    const isSelected =
                      t === "요일/시간 직접 선택"
                        ? filters.time !== "전체 시간" && filters.time !== "공강 시간만 보기"
                        : filters.time === t;

                    return (
                      <OptionItemRow key={t} onClick={() => handleSelectTimeMode(t)}>
                        <OptionLabel style={{ paddingLeft: "44px" }}>{t}</OptionLabel>
                        {isSelected && <Check size={20} color="var(--interactive-primary, #0061FF)" />}
                      </OptionItemRow>
                    );
                  })}
                </OptionsList>

                {/* 2. 요일/시간 직접 선택 상세 패널 */}
                {filters.time !== "전체 시간" && filters.time !== "공강 시간만 보기" && (
                  <CustomTimeSettings data-vaul-no-drag="">
                    <SectionLabel>선택 요일 (다중 선택 가능)</SectionLabel>
                    <DayChipsGrid>
                      {["월", "화", "수", "목", "금", "토", "일"].map((dayName) => {
                        const isDaySelected = (filters.selectedDays || []).includes(dayName);
                        return (
                          <DayFilterChip
                            type="button"
                            key={dayName}
                            $selected={isDaySelected}
                            onClick={() => handleToggleDay(dayName)}
                          >
                            {dayName}
                          </DayFilterChip>
                        );
                      })}
                    </DayChipsGrid>

                    <SectionLabel style={{ marginTop: "16px" }}>시간 범위 지정</SectionLabel>
                    <TimePickerRow>
                      <TimePickerField>
                        <TimePickerLabel>시작</TimePickerLabel>
                        <TimePickerDisplay>{filters.startTime || "09:00"}</TimePickerDisplay>
                        <HiddenTimeInput
                          type="time"
                          value={filters.startTime || "09:00"}
                          onChange={(e) => handleTimeValueChange("start", e.target.value)}
                        />
                      </TimePickerField>

                      <TimeSeparator>~</TimeSeparator>

                      <TimePickerField>
                        <TimePickerLabel>종료</TimePickerLabel>
                        <TimePickerDisplay>{filters.endTime || "18:00"}</TimePickerDisplay>
                        <HiddenTimeInput
                          type="time"
                          value={filters.endTime || "18:00"}
                          onChange={(e) => handleTimeValueChange("end", e.target.value)}
                        />
                      </TimePickerField>
                    </TimePickerRow>
                  </CustomTimeSettings>
                )}
              </TimeFilterContainer>
            )}

            {activeTab === "grade" && (
              <OptionsList>
                {[1, 2, 3, 4].map((g) => {
                  const isSelected = filters.grades.includes(g);
                  return (
                    <OptionItemRow key={g} onClick={() => handleToggleGrade(g)}>
                      <OptionLabel style={{ paddingLeft: "44px" }}>{g}학년</OptionLabel>
                      {isSelected && <Check size={20} color="var(--interactive-primary, #0061FF)" />}
                    </OptionItemRow>
                  );
                })}
              </OptionsList>
            )}

            {activeTab === "type" && (
              <OptionsList>
                {["전공", "교양", "교직", "일반선택", "군사학", "기타"].map((t) => {
                  const isSelected = filters.types.includes(t);
                  return (
                    <OptionItemRow key={t} onClick={() => handleToggleType(t)}>
                      <OptionLabel style={{ paddingLeft: "44px" }}>{t}</OptionLabel>
                      {isSelected && <Check size={20} color="var(--interactive-primary, #0061FF)" />}
                    </OptionItemRow>
                  );
                })}
              </OptionsList>
            )}

            {activeTab === "credit" && (
              <OptionsList>
                {[1, 2, 3, 4].map((c) => {
                  const isSelected = filters.credits.includes(c);
                  const label = c === 4 ? "4학점 이상" : `${c}학점`;
                  return (
                    <OptionItemRow key={c} onClick={() => handleToggleCredit(c)}>
                      <OptionLabel style={{ paddingLeft: "44px" }}>{label}</OptionLabel>
                      {isSelected && <Check size={20} color="var(--interactive-primary, #0061FF)" />}
                    </OptionItemRow>
                  );
                })}
              </OptionsList>
            )}
          </OptionsArea>
        </ContentColumns>

        {/* 하단 고정 제어 영역 */}
        <BottomActions>
          <ResetButton onClick={handleReset}>
            <RotateCcw size={16} />
            <span>초기화</span>
          </ResetButton>
          <ApplyButton onClick={handleApply}>적용하기</ApplyButton>
        </BottomActions>
      </SheetWrapper>
    </BottomSheet>
  );
}

const SheetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0 12px;
  flex-shrink: 0;
`;

const TitleText = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #111827);
  margin: 0;
  letter-spacing: -0.2px;
`;

const CloseIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary, #4e5968);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

const BadgeRowScroll = styled.div<{ $visible: boolean }>`
  display: flex;
  gap: 8px;
  overflow-x: ${({ $visible }) => ($visible ? "auto" : "hidden")};
  flex-shrink: 0;
  border-bottom: 1px solid ${({ $visible }) => ($visible ? "var(--border-default, #e5e8eb)" : "transparent")};
  
  height: ${({ $visible }) => ($visible ? "40px" : "0px")};
  opacity: ${({ $visible }) => ($visible ? "1" : "0")};
  padding: ${({ $visible }) => ($visible ? "4px 0 12px" : "0")};
  overflow-y: hidden;
  box-sizing: border-box;
  
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const BadgeItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  background: var(--bg-brand-subtle, #eff6ff);
  flex-shrink: 0;
`;

const BadgeText = styled.span`
  color: var(--text-brand, #0061ff);
  font-size: 14px;
  font-weight: 500;
`;

const BadgeDeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-brand, #0061ff);
  padding: 2px;
`;

const ContentColumns = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
`;

const CategorySidebar = styled.div`
  width: 120px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const CategoryTab = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 10px 4px 10px 8px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-start;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $active }) => ($active ? "var(--text-secondary, #333d4b)" : "var(--text-disabled, #b0b8c1)")};
  cursor: pointer;
  box-sizing: border-box;
  min-height: 40px;
  white-space: nowrap;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
`;

const OptionsArea = styled.div`
  flex: 1;
  padding: 0;
  overflow-y: auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptionItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 16px;
  cursor: pointer;
  height: 40px;
  min-height: 40px;
  box-sizing: border-box;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
`;

const PinButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
`;

const OptionLabel = styled.span`
  flex: 1;
  text-align: left;
  font-size: 16px;
  font-weight: 400;
  color: var(--text-primary, #111827);
  display: flex;
  align-items: center;
`;

const SubHeaderRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px 8px;
  border-bottom: 1px solid var(--border-light, #f2f4f6);
  margin-bottom: 8px;
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 1;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #111827);
  cursor: pointer;
  padding: 0;
`;

const BottomActions = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 12px 0 0;
  background: #ffffff;
  box-sizing: border-box;
  flex-shrink: 0;
`;

const ResetButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-subtle, #f8f9fb);
  border: 1px solid var(--border-default, #e5e8eb);
  color: var(--text-secondary, #4e5968);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;

  &:active {
    transform: scale(0.97);
  }
`;

const ApplyButton = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 12px;
  background: var(--interactive-primary, #3b82f6);
  color: #ffffff;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
`;

const TimeFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const CustomTimeSettings = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  background: var(--bg-subtle, #f8f9fb);
  border-radius: 16px;
  margin: 0 16px 16px;
  box-sizing: border-box;
`;

const SectionLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #4e5968);
  margin-bottom: 8px;
  text-align: left;
`;

const DayChipsGrid = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 12px;
`;

const DayFilterChip = styled.button<{ $selected?: boolean }>`
  flex: 1;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  font-weight: ${({ $selected }) => ($selected ? "600" : "500")};
  cursor: pointer;
  border: 1px solid ${({ $selected }) => ($selected ? "var(--interactive-primary, #0061ff)" : "var(--border-default, #e5e8eb)")};
  background: ${({ $selected }) => ($selected ? "var(--bg-brand-subtle, #eff6ff)" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #4e5968)")};
  box-sizing: border-box;
  padding: 0;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $selected }) => ($selected ? "var(--bg-brand-subtle, #eff6ff)" : "var(--bg-subtle, #f8f9fb)")};
  }
`;

const TimePickerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const TimeSeparator = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-tertiary, #8b95a1);
`;

const TimePickerField = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #ffffff;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  padding: 6px 12px;
  height: 48px;
  box-sizing: border-box;
  justify-content: center;
  cursor: pointer;
`;

const TimePickerLabel = styled.span`
  font-size: 10px;
  color: var(--text-tertiary, #8b95a1);
  margin-bottom: 2px;
  text-align: left;
`;

const TimePickerDisplay = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #111827);
  text-align: left;
`;

const HiddenTimeInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;

  &::-webkit-calendar-picker-indicator {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    cursor: pointer;
    opacity: 0;
  }
`;
