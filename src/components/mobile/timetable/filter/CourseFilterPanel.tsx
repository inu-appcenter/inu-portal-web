import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import styled from "styled-components";
import { X, Star, Check, ChevronRight } from "lucide-react";
import TimetableGrid, {
  ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";
import Ripple from "@/components/common/Ripple";
import {
  CATEGORIES,
  COLLEGE_DEPARTMENTS,
  CREDIT_OPTIONS,
  DEFAULT_FILTERS,
  GRADE_OPTIONS,
  MAJOR_CATEGORIES,
  ONLINE_TYPE_OPTIONS,
  PINNED_MAJORS_STORAGE_KEY,
  SORT_OPTIONS,
  SUB_MAJORS,
  TYPE_OPTIONS,
  buildCategoryChips,
  formatSlotsToTimeStr,
  getDefaultPinnedMajors,
  removeChipFromFilters,
} from "@/components/mobile/timetable/filter/courseFilterModel";
import type {
  FilterCategoryId,
  FilterState,
  FilterSubView,
} from "@/components/mobile/timetable/filter/courseFilterModel";

/**
 * 필터 선택 UI. 상태를 스스로 갖지 않는 완전한 controlled 컴포넌트다.
 *
 * 이 컴포넌트가 어떤 저장소(localStorage / zustand / 라우터 state)와도 얽히지 않기 때문에,
 * 별도 라우트로 띄우는 시간표 편집 화면과 바텀시트 안 오버레이로 띄우는 마법사가
 * "같은 필터 UI, 다른 수명주기"를 안전하게 공유할 수 있다.
 * 하단 액션 바(초기화/적용)는 컨테이너가 자기 레이아웃에 맞게 직접 그린다.
 */
export interface CourseFilterPanelProps {
  filters: FilterState;
  onFiltersChange: (next: FilterState) => void;
  view: FilterSubView;
  onViewChange: (view: FilterSubView) => void;
  /** 전공 드릴다운 위치. 뒤로가기 처리를 컨테이너가 소유하도록 controlled로 노출한다. */
  majorLevel1: string | null;
  majorLevel2: string | null;
  onMajorLevelChange: (level1: string | null, level2: string | null) => void;
  /** "시간" 탭에서 배경으로 겹쳐 보여줄 내 시간표. 없으면 빈 그리드. */
  timetableEvents?: ClassItem[];
  userDepartment?: string;
}

const EMPTY_EVENTS: ClassItem[] = [];

const CourseFilterPanel = ({
  filters,
  onFiltersChange,
  view,
  onViewChange,
  majorLevel1,
  majorLevel2,
  onMajorLevelChange,
  timetableEvents = EMPTY_EVENTS,
  userDepartment = "",
}: CourseFilterPanelProps) => {
  const [showClasses, setShowClasses] = useState(true);

  // 즐겨찾기(별표) 학과는 필터 값이 아니라 사용자 개인 설정이라 이 컴포넌트가 직접 소유한다.
  const hasStoredPinnedMajorsRef = useRef(false);
  const [pinnedMajors, setPinnedMajors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(PINNED_MAJORS_STORAGE_KEY);
      if (saved) {
        hasStoredPinnedMajorsRef.current = true;
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("즐겨찾기 전공 복원 오류:", e);
    }
    return getDefaultPinnedMajors(userDepartment);
  });

  useEffect(() => {
    if (!userDepartment.trim()) return;
    setPinnedMajors((prev) => {
      const fallbackDefault = getDefaultPinnedMajors("");
      const isUnchangedFallback =
        JSON.stringify(prev) === JSON.stringify(fallbackDefault);

      // 저장값이 없거나 과거의 고정 기본값 그대로일 때만 로그인 사용자의
      // 소속 단과대·학과를 기본 즐겨찾기로 설정한다. 사용자가 직접 변경한
      // 즐겨찾기 목록은 덮어쓰지 않는다.
      if (hasStoredPinnedMajorsRef.current && !isUnchangedFallback) return prev;
      return getDefaultPinnedMajors(userDepartment);
    });
  }, [userDepartment]);

  useEffect(() => {
    try {
      localStorage.setItem(
        PINNED_MAJORS_STORAGE_KEY,
        JSON.stringify(pinnedMajors),
      );
    } catch (e) {
      console.error("즐겨찾기 전공 저장 오류:", e);
    }
  }, [pinnedMajors]);

  const sortByPinned = (list: string[]) =>
    [...list].sort((a, b) => {
      const aPinned = pinnedMajors.includes(a);
      const bPinned = pinnedMajors.includes(b);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });

  const collegeList = useMemo(
    () => sortByPinned(SUB_MAJORS["전공"] || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pinnedMajors],
  );

  const deptList = useMemo(
    () => (majorLevel2 ? sortByPinned(COLLEGE_DEPARTMENTS[majorLevel2] || []) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [majorLevel2, pinnedMajors],
  );

  const categoryChips = useMemo(() => buildCategoryChips(filters), [filters]);

  const togglePin = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedMajors((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };

  const handleSelectMajor = (majorName: string) => {
    onFiltersChange({
      ...filters,
      major: filters.major === majorName ? null : majorName,
    });
    onViewChange("main");
  };

  const handleSelectSort = (sortOption: string) => {
    onFiltersChange({ ...filters, sort: sortOption });
    onViewChange("main");
  };

  const toggleInList = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const handleRemoveChip = (
    categoryId: FilterCategoryId,
    chip: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // 행 클릭(하위 화면 진입)으로 번지지 않도록
    onFiltersChange(removeChipFromFilters(filters, categoryId, chip));
  };

  if (view === "main") {
    return (
      <PanelScroll>
        <CategoriesContainer>
          {CATEGORIES.map((cat) => (
            <CategoryItemRow key={cat.id} onClick={() => onViewChange(cat.id)}>
              <CategoryTextWrapper>
                <CategoryLabel>{cat.label}</CategoryLabel>
                <ChipsScrollWrapper>
                  {categoryChips[cat.id].map((chip, idx) => (
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
          ))}
        </CategoriesContainer>
        <PanelBottomSpacer />
      </PanelScroll>
    );
  }

  if (view === "major") {
    return (
      <PanelScroll>
        <BreadcrumbRow>
          <BreadcrumbItem $active={!majorLevel1}>전공/영역</BreadcrumbItem>
          {majorLevel1 && (
            <>
              <ChevronRight size={16} color="var(--gray-400, #b0b8c1)" />
              <BreadcrumbItem $active={!majorLevel2}>{majorLevel1}</BreadcrumbItem>
            </>
          )}
          {majorLevel2 && (
            <>
              <ChevronRight size={16} color="var(--gray-400, #b0b8c1)" />
              <BreadcrumbItem $active>{majorLevel2}</BreadcrumbItem>
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
                    if (m.hasChevron) onMajorLevelChange(m.name, null);
                    else handleSelectMajor(m.name);
                  }}
                >
                  <OptionLabel>{m.name}</OptionLabel>
                  {m.hasChevron ? (
                    <ChevronRight size={20} color="var(--gray-400, #b0b8c1)" />
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
            {collegeList.map((college) => {
              const isPinned = pinnedMajors.includes(college);
              return (
                <OptionItemRow
                  key={college}
                  onClick={() => onMajorLevelChange(majorLevel1, college)}
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

        {/* 교양/연계전공 하위 목록 */}
        {majorLevel1 && majorLevel1 !== "전공" && (
          <OptionsCard>
            {(SUB_MAJORS[majorLevel1] || []).map((subName) => {
              const isSelected = filters.major === subName;
              return (
                <OptionItemRow key={subName} onClick={() => handleSelectMajor(subName)}>
                  <OptionLabel style={{ paddingLeft: "8px" }}>{subName}</OptionLabel>
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
            {deptList.map((dept) => {
              const isSelected = filters.major === dept;
              const isPinned = pinnedMajors.includes(dept);
              return (
                <OptionItemRow key={dept} onClick={() => handleSelectMajor(dept)}>
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
      </PanelScroll>
    );
  }

  if (view === "sort") {
    return (
      <PanelScroll>
        <OptionsCard>
          {SORT_OPTIONS.map((option) => (
            <OptionItemRow key={option} onClick={() => handleSelectSort(option)}>
              <OptionLabel style={{ paddingLeft: "8px" }}>{option}</OptionLabel>
              {filters.sort === option && (
                <Check size={20} color="var(--border-brand, #0061ff)" />
              )}
              <Ripple />
            </OptionItemRow>
          ))}
        </OptionsCard>
      </PanelScroll>
    );
  }

  if (view === "time") {
    return (
      <PanelScroll>
        <TimetableSelectorContainer>
          <TimetableToggleHeader>
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
              events={timetableEvents}
              showClasses={showClasses}
              isSelectionMode
              selectedSlots={filters.selectedSlots || []}
              onSelectedSlotsChange={(newSlots) =>
                onFiltersChange({
                  ...filters,
                  time: formatSlotsToTimeStr(newSlots),
                  selectedSlots: newSlots,
                })
              }
            />
          </TimetableGridContainer>
        </TimetableSelectorContainer>
        <PanelBottomSpacer />
      </PanelScroll>
    );
  }

  if (view === "grade") {
    return (
      <PanelScroll>
        <OptionsCard>
          {GRADE_OPTIONS.map((g) => (
            <OptionItemRow
              key={g}
              onClick={() =>
                onFiltersChange({ ...filters, grades: toggleInList(filters.grades, g) })
              }
            >
              <CheckboxWrapper>
                <CheckboxInput type="checkbox" checked={filters.grades.includes(g)} readOnly />
                <OptionLabel>{g}학년</OptionLabel>
              </CheckboxWrapper>
              <Ripple />
            </OptionItemRow>
          ))}
        </OptionsCard>
        <PanelBottomSpacer />
      </PanelScroll>
    );
  }

  if (view === "type") {
    return (
      <PanelScroll>
        <OptionsCard>
          {TYPE_OPTIONS.map((t) => (
            <OptionItemRow
              key={t}
              onClick={() =>
                onFiltersChange({ ...filters, types: toggleInList(filters.types, t) })
              }
            >
              <CheckboxWrapper>
                <CheckboxInput type="checkbox" checked={filters.types.includes(t)} readOnly />
                <OptionLabel>{t}</OptionLabel>
              </CheckboxWrapper>
              <Ripple />
            </OptionItemRow>
          ))}
        </OptionsCard>
        <PanelBottomSpacer />
      </PanelScroll>
    );
  }

  if (view === "online") {
    return (
      <PanelScroll>
        <OptionsCard>
          {ONLINE_TYPE_OPTIONS.map((ot) => (
            <OptionItemRow
              key={ot}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  onlineTypes: toggleInList(filters.onlineTypes ?? [], ot),
                })
              }
            >
              <CheckboxWrapper>
                <CheckboxInput
                  type="checkbox"
                  checked={(filters.onlineTypes ?? []).includes(ot)}
                  readOnly
                />
                <OptionLabel>{ot}</OptionLabel>
              </CheckboxWrapper>
              <Ripple />
            </OptionItemRow>
          ))}
        </OptionsCard>
        <PanelBottomSpacer />
      </PanelScroll>
    );
  }

  // view === "credit"
  return (
    <PanelScroll>
      <OptionsCard>
        {CREDIT_OPTIONS.map((c) => (
          <OptionItemRow
            key={c}
            onClick={() =>
              onFiltersChange({ ...filters, credits: toggleInList(filters.credits, c) })
            }
          >
            <CheckboxWrapper>
              <CheckboxInput type="checkbox" checked={filters.credits.includes(c)} readOnly />
              <OptionLabel>{c === 4 ? "4학점 이상" : `${c}학점`}</OptionLabel>
            </CheckboxWrapper>
            <Ripple />
          </OptionItemRow>
        ))}
      </OptionsCard>
      <PanelBottomSpacer />
    </PanelScroll>
  );
};

export default CourseFilterPanel;

/** "시간" 탭 전용 초기화. 컨테이너의 하단 액션 바에서 호출한다. */
export const resetTimeFilter = (filters: FilterState): FilterState => ({
  ...filters,
  time: DEFAULT_FILTERS.time,
  selectedSlots: [],
});

// --- styled-components ---

const PanelScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
`;

const PanelBottomSpacer = styled.div`
  height: 80px;
  flex-shrink: 0;
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
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      var(--bg-base, #ffffff) 100%
    );
    pointer-events: none;
    z-index: 2;
  }
`;

const CategoryLabel = styled.span`
  color: var(--text-secondary, #333d4b);
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
    $active ? "var(--text-secondary, #333d4b)" : "var(--text-tertiary, #8b95a1)"};
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
  width: 100%;
  flex-shrink: 0;
`;

const TimetableToggleHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
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
