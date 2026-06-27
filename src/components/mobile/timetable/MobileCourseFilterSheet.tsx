import { useState, useMemo } from "react";
import styled from "styled-components";
import { X, Star, Check, RotateCcw, ChevronRight } from "lucide-react";
import BottomSheet from "@/components/common/BottomSheet";

export interface FilterState {
  major: string | null;
  sort: string; // "기본순", "별점높은순", "담은인원많은순"
  time: string; // "전체 시간", "공강 시간만 보기"
  grades: number[]; // [1, 2, 3, 4]
  types: string[]; // ["전공", "교양", "교직", "일반선택", "군사학", "기타"]
  credits: number[]; // [1, 2, 3, 4] (4는 4학점 이상)
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
};

const CATEGORIES = [
  { id: "major", label: "전공/영역" },
  { id: "sort", label: "정렬" },
  { id: "time", label: "시간" },
  { id: "grade", label: "학년" },
  { id: "type", label: "이수구분" },
  { id: "credit", label: "학점" },
];

const MAJORS = [
  { id: "comp", name: "컴퓨터공학부", type: "전공" },
  { id: "comm", name: "정보통신공학과", type: "전공" },
  { id: "embed", name: "임베디드시스템공학과", type: "전공" },
  { id: "elec", name: "전자공학과", type: "전공" },
  { id: "mech", name: "기계공학과", type: "전공" },
  { id: "biz", name: "경영학부", type: "전공" },
  { id: "lib1", name: "기초교양", type: "교양" },
  { id: "lib2", name: "균형교양", type: "교양" },
  { id: "lib3", name: "일반교양", type: "교양" },
];

export default function MobileCourseFilterSheet({
  open,
  onOpenChange,
  initialFilters,
  onApply,
}: MobileCourseFilterSheetProps) {
  const [activeTab, setActiveTab] = useState<string>("major");
  const [filters, setFilters] = useState<FilterState>({ ...initialFilters });
  
  // 즐겨찾는 전공/영역 Pinned 상태 관리 (Figma 시안 별표 토글 재현)
  const [pinnedMajors, setPinnedMajors] = useState<string[]>(["comp"]);

  const togglePin = (majorName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedMajors((prev) =>
      prev.includes(majorName)
        ? prev.filter((m) => m !== majorName)
        : [...prev, majorName]
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

  const handleSelectTime = (timeName: string) => {
    setFilters((prev) => ({ ...prev, time: timeName }));
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
        return { ...prev, time: "전체 시간" };
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
      snapPoints={["424px"]}
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
        {activeBadgeList.length > 0 && (
          <BadgeRowScroll>
            {activeBadgeList.map((badge, idx) => (
              <BadgeItem key={`badge-${badge.key}-${idx}`}>
                <BadgeText>{badge.label}</BadgeText>
                <BadgeDeleteBtn onClick={() => removeBadge(badge.key, badge.val)}>
                  <X size={12} />
                </BadgeDeleteBtn>
              </BadgeItem>
            ))}
          </BadgeRowScroll>
        )}

        {/* 주 내용 영역 (2단 컬럼 구조) */}
        <ContentColumns>
          {/* 좌측 카테고리 탭 사이드바 */}
          <CategorySidebar>
            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.id;
              // 이수구분 비활성화/일반 체크
              const isDisabled = cat.id === "disabled_placeholder"; 
              return (
                <CategoryTab
                  key={cat.id}
                  $active={isActive}
                  $disabled={isDisabled}
                  onClick={() => !isDisabled && setActiveTab(cat.id)}
                >
                  {cat.label}
                </CategoryTab>
              );
            })}
          </CategorySidebar>

          {/* 우측 옵션 선택 영역 */}
          <OptionsArea>
            {activeTab === "major" && (
              <OptionsList>
                {MAJORS.map((m) => {
                  const isSelected = filters.major === m.name;
                  const isPinned = pinnedMajors.includes(m.name);
                  return (
                    <OptionItemRow
                      key={m.id}
                      onClick={() => handleSelectMajor(m.name)}
                    >
                      <PinButton onClick={(e) => togglePin(m.name, e)}>
                        <Star
                          size={18}
                          color={isPinned ? "var(--interactive-primary, #0061FF)" : "#D1D6DB"}
                          fill={isPinned ? "var(--interactive-primary, #0061FF)" : "transparent"}
                        />
                      </PinButton>
                      <OptionLabel $selected={isSelected}>{m.name}</OptionLabel>
                      {isSelected ? (
                        <Check size={16} color="var(--interactive-primary, #0061FF)" />
                      ) : (
                        <ChevronRight size={16} color="#D1D6DB" />
                      )}
                    </OptionItemRow>
                  );
                })}
              </OptionsList>
            )}

            {activeTab === "sort" && (
              <OptionsList>
                {["기본순", "별점높은순", "담은인원많은순"].map((s) => {
                  const isSelected = filters.sort === s;
                  return (
                    <OptionItemRow key={s} onClick={() => handleSelectSort(s)}>
                      <OptionLabel $selected={isSelected}>{s}</OptionLabel>
                      {isSelected && <Check size={18} color="var(--interactive-primary, #0061FF)" />}
                    </OptionItemRow>
                  );
                })}
              </OptionsList>
            )}

            {activeTab === "time" && (
              <OptionsList>
                {["전체 시간", "공강 시간만 보기"].map((t) => {
                  const isSelected = filters.time === t;
                  return (
                    <OptionItemRow key={t} onClick={() => handleSelectTime(t)}>
                      <OptionLabel $selected={isSelected}>{t}</OptionLabel>
                      {isSelected && <Check size={18} color="var(--interactive-primary, #0061FF)" />}
                    </OptionItemRow>
                  );
                })}
              </OptionsList>
            )}

            {activeTab === "grade" && (
              <OptionsList>
                {[1, 2, 3, 4].map((g) => {
                  const isSelected = filters.grades.includes(g);
                  return (
                    <OptionItemRow key={g} onClick={() => handleToggleGrade(g)}>
                      <OptionLabel $selected={isSelected}>{g}학년</OptionLabel>
                      {isSelected && <Check size={18} color="var(--interactive-primary, #0061FF)" />}
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
                      <OptionLabel $selected={isSelected}>{t}</OptionLabel>
                      {isSelected && <Check size={18} color="var(--interactive-primary, #0061FF)" />}
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
                      <OptionLabel $selected={isSelected}>{label}</OptionLabel>
                      {isSelected && <Check size={18} color="var(--interactive-primary, #0061FF)" />}
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
  height: 100%;
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

const BadgeRowScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 12px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  
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
  width: 100px;
  background: var(--bg-subtle, #f8f9fb);
  border-right: 1px solid var(--border-default, #e5e8eb);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
  
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const CategoryTab = styled.button<{ $active: boolean; $disabled?: boolean }>`
  width: 100%;
  padding: 14px 12px;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  border: none;
  border-left: 3px solid ${({ $active }) => ($active ? "var(--interactive-primary, #3b82f6)" : "transparent")};
  text-align: left;
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  color: ${({ $active, $disabled }) =>
    $disabled ? "var(--text-disabled, #b0b8c1)" : $active ? "var(--text-primary, #333d4b)" : "var(--text-secondary, #4e5968)"};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  box-sizing: border-box;

  &:hover {
    background: ${({ $active, $disabled }) => ($disabled ? "transparent" : $active ? "#ffffff" : "rgba(0, 0, 0, 0.02)")};
  }
`;

const OptionsArea = styled.div`
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
  min-height: 0;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptionItemRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light, #f2f4f6);
  min-height: 44px;
  box-sizing: border-box;

  &:hover {
    background: var(--bg-subtle, #f8f9fb);
  }
`;

const PinButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin-right: 12px;
`;

const OptionLabel = styled.span<{ $selected: boolean }>`
  flex: 1;
  font-size: 16px;
  font-weight: ${({ $selected }) => ($selected ? "600" : "400")};
  color: ${({ $selected }) => ($selected ? "var(--text-brand, #0061ff)" : "var(--text-primary, #333d4b)")};
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
