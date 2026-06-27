import React, { useState, useMemo, useEffect, useRef } from "react";
import styled from "styled-components";
import { X, Star, Check, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";
import BottomSheet from "@/components/common/BottomSheet";
import { navItems } from "@/resources/strings/navItems";

export interface FilterState {
  major: string | null;
  sort: string; // "기본순", "별점높은순", "담은인원많은순"
  time: string; // "전체 시간", "공강 시간만 보기" 또는 직접 선택한 포맷 (예: "월(09:00~13:00)")
  grades: number[]; // [1, 2, 3, 4]
  types: string[]; // ["전공", "교양", "교직", "일반선택", "군사학", "기타"]
  credits: number[]; // [1, 2, 3, 4] (4는 4학점 이상)
  selectedSlots?: string[]; // When2meet 선택 셀 리스트 (예: ["0-9", "2-14"])
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
  selectedSlots: [],
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

const DAYS_SHORT = ["월", "화", "수", "목", "금"];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // 9:00 to 18:00

export function formatSlotsToTimeStr(slots: string[]): string {
  if (!slots || slots.length === 0) return "직접 시간 선택";
  
  // Group hours by day
  const dayGroups: Record<number, number[]> = {};
  slots.forEach((slot) => {
    const [dStr, hStr] = slot.split("-");
    const d = parseInt(dStr, 10);
    const h = parseInt(hStr, 10);
    if (!dayGroups[d]) dayGroups[d] = [];
    dayGroups[d].push(h);
  });
  
  const dayStrings: string[] = [];
  const sortedDays = Object.keys(dayGroups).map(Number).sort((a, b) => a - b);
  
  sortedDays.forEach((d) => {
    const hours = dayGroups[d].sort((a, b) => a - b);
    const ranges: string[] = [];
    
    let start = hours[0];
    let prev = hours[0];
    
    for (let i = 1; i <= hours.length; i++) {
      const current = hours[i];
      if (current === prev + 1) {
        prev = current;
      } else {
        const end = prev + 1;
        const startPad = String(start).padStart(2, "0");
        const endPad = String(end).padStart(2, "0");
        ranges.push(`${startPad}:00~${endPad}:00`);
        start = current;
        prev = current;
      }
    }
    
    dayStrings.push(`${DAYS_SHORT[d] || "요일"}(${ranges.join(",")})`);
  });
  
  return dayStrings.join(" ");
}

interface When2MeetGridProps {
  selectedSlots: string[];
  onChange: (slots: string[]) => void;
}

const When2MeetGrid = ({ selectedSlots, onChange }: When2MeetGridProps) => {
  const isDrawingRef = useRef(false);
  const drawingModeRef = useRef<"select" | "deselect">("select");
  const selectedRef = useRef<string[]>(selectedSlots);
  const [localSelected, setLocalSelected] = useState<string[]>(selectedSlots);

  useEffect(() => {
    selectedRef.current = selectedSlots;
    setLocalSelected(selectedSlots);
  }, [selectedSlots]);

  const updateSelection = (slot: string, mode: "select" | "deselect") => {
    const current = selectedRef.current;
    const isSelected = current.includes(slot);
    
    let next: string[];
    if (mode === "select" && !isSelected) {
      next = [...current, slot];
    } else if (mode === "deselect" && isSelected) {
      next = current.filter((s) => s !== slot);
    } else {
      return;
    }

    selectedRef.current = next;
    setLocalSelected(next);
    onChange(next);
  };

  const handleCellTouchStart = (day: number, hour: number, e: React.TouchEvent) => {
    e.preventDefault();
    const slot = `${day}-${hour}`;
    const isSelected = selectedRef.current.includes(slot);
    const mode = isSelected ? "deselect" : "select";
    
    isDrawingRef.current = true;
    drawingModeRef.current = mode;
    
    updateSelection(slot, mode);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const dayAttr = element.getAttribute("data-day");
    const hourAttr = element.getAttribute("data-hour");

    if (dayAttr !== null && hourAttr !== null) {
      const day = parseInt(dayAttr, 10);
      const hour = parseInt(hourAttr, 10);
      const slot = `${day}-${hour}`;
      updateSelection(slot, drawingModeRef.current);
    }
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
  };

  const handleMouseDown = (day: number, hour: number) => {
    const slot = `${day}-${hour}`;
    const isSelected = selectedRef.current.includes(slot);
    const mode = isSelected ? "deselect" : "select";

    isDrawingRef.current = true;
    drawingModeRef.current = mode;

    updateSelection(slot, mode);
  };

  const handleMouseEnter = (day: number, hour: number) => {
    if (!isDrawingRef.current) return;
    const slot = `${day}-${hour}`;
    updateSelection(slot, drawingModeRef.current);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDrawingRef.current = false;
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <GridContainer
      data-vaul-no-drag=""
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CornerCell />
      {DAYS_SHORT.map((day) => (
        <DayHeaderCell key={day}>{day}</DayHeaderCell>
      ))}

      {HOURS.map((hour) => (
        <React.Fragment key={hour}>
          <HourLabelCell>
            {String(hour).padStart(2, "0")}:00
          </HourLabelCell>
          {DAYS_SHORT.map((_, dayIdx) => {
            const slot = `${dayIdx}-${hour}`;
            const isSelected = localSelected.includes(slot);
            return (
              <TimeGridCell
                key={slot}
                data-day={dayIdx}
                data-hour={hour}
                $selected={isSelected}
                onTouchStart={(e) => handleCellTouchStart(dayIdx, hour, e)}
                onMouseDown={() => handleMouseDown(dayIdx, hour)}
                onMouseEnter={() => handleMouseEnter(dayIdx, hour)}
                onMouseUp={handleMouseUp}
              />
            );
          })}
        </React.Fragment>
      ))}
    </GridContainer>
  );
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
        selectedSlots: [],
      }));
    } else if (mode === "공강 시간만 보기") {
      setFilters((prev) => ({
        ...prev,
        time: "공강 시간만 보기",
        selectedSlots: [],
      }));
    } else {
      const slots = filters.selectedSlots && filters.selectedSlots.length > 0 ? filters.selectedSlots : [];
      setFilters((prev) => ({
        ...prev,
        time: formatSlotsToTimeStr(slots),
        selectedSlots: slots,
      }));
    }
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
          selectedSlots: [],
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
                <TimeModeSelector>
                  {["전체 시간", "공강 시간만 보기", "직접 시간 선택"].map((t) => {
                    const isSelected =
                      t === "직접 시간 선택"
                        ? filters.time !== "전체 시간" && filters.time !== "공강 시간만 보기"
                        : filters.time === t;

                    return (
                      <TimeModeTab
                        type="button"
                        key={t}
                        $selected={isSelected}
                        onClick={() => handleSelectTimeMode(t)}
                      >
                        {t}
                      </TimeModeTab>
                    );
                  })}
                </TimeModeSelector>

                {/* 2. When2meet 스타일 드래그 그리드 */}
                {filters.time !== "전체 시간" && filters.time !== "공강 시간만 보기" && (
                  <DragGridWrapper data-vaul-no-drag="">
                    <GridGuideText>드래그하여 필터링할 요일/시간대를 선택하세요.</GridGuideText>
                    <When2MeetGrid
                      selectedSlots={filters.selectedSlots || []}
                      onChange={(newSlots) => {
                        const timeStr = formatSlotsToTimeStr(newSlots);
                        setFilters((prev) => ({
                          ...prev,
                          time: timeStr,
                          selectedSlots: newSlots,
                        }));
                      }}
                    />
                  </DragGridWrapper>
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

const TimeModeSelector = styled.div`
  display: flex;
  padding: 8px 16px 0;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
`;

const TimeModeTab = styled.button<{ $selected: boolean }>`
  flex: 1;
  height: 36px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: ${({ $selected }) => ($selected ? "600" : "500")};
  cursor: pointer;
  border: 1px solid ${({ $selected }) => ($selected ? "var(--interactive-primary, #0061ff)" : "var(--border-default, #e5e8eb)")};
  background: ${({ $selected }) => ($selected ? "var(--bg-brand-subtle, #eff6ff)" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #4e5968)")};
  transition: all 0.2s ease;
  box-sizing: border-box;
  padding: 0;

  &:hover {
    background: ${({ $selected }) => ($selected ? "var(--bg-brand-subtle, #eff6ff)" : "var(--bg-subtle, #f8f9fb)")};
  }
`;

const DragGridWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px 16px;
  box-sizing: border-box;
  min-height: 0;
`;

const GridGuideText = styled.span`
  font-size: 11px;
  color: var(--text-secondary, #4e5968);
  margin-bottom: 8px;
  text-align: left;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 45px repeat(5, minmax(0, 1fr));
  grid-template-rows: 24px repeat(9, 30px);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  background-color: #ffffff;
  overflow: hidden;
  position: relative;
  width: 100%;
  user-select: none;
  touch-action: none;
  box-sizing: border-box;
`;

const CornerCell = styled.div`
  background: var(--bg-subtle, #f8f9fb);
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  border-right: 1px solid var(--border-default, #e5e8eb);
`;

const DayHeaderCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary, #4e5968);
  background: var(--bg-subtle, #f8f9fb);
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  border-right: 1px solid var(--border-default, #e5e8eb);
  
  &:last-child {
    border-right: none;
  }
`;

const HourLabelCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 500;
  color: var(--text-tertiary, #8b95a1);
  background: var(--bg-subtle, #f8f9fb);
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  border-right: 1px solid var(--border-default, #e5e8eb);
`;

const TimeGridCell = styled.div<{ $selected: boolean }>`
  border-bottom: 1px solid var(--border-light, #f2f4f6);
  border-right: 1px solid var(--border-light, #f2f4f6);
  background-color: ${({ $selected }) => ($selected ? "rgba(0, 97, 255, 0.22)" : "#ffffff")};
  box-shadow: ${({ $selected }) => ($selected ? "inset 0 0 0 1px var(--interactive-primary, #0061ff)" : "none")};
  cursor: pointer;
  transition: background-color 0.1s ease;
  touch-action: none;

  &:nth-child(6n) {
    border-right: none;
  }
`;
