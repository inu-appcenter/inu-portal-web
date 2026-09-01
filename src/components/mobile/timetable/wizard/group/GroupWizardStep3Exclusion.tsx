import styled from "styled-components";
import Icon from "@/components/common/Icon";
import TimetableGrid from "@/components/mobile/timetable/TimetableGrid";
import { useTimetableGroupWizardStore } from "@/stores/useTimetableGroupWizardStore";

const EMPTY_EVENTS: never[] = [];

/**
 * 그룹 마법사의 제외 조건 스텝. 기존 마법사 3단계와 동작·UI가 동일하고, 스토어만
 * useTimetableGroupWizardStore를 바라본다. 제외 강의도 스냅샷으로 들고 있어 필터를 바꿔도
 * 칩이 사라지지 않는다.
 */
const GroupWizardStep3Exclusion = () => {
  const excludedSlots = useTimetableGroupWizardStore((s) => s.exclusion.excludedSlots);
  const excludedCourses = useTimetableGroupWizardStore(
    (s) => s.exclusion.excludedCourses,
  );
  const setExcludedSlots = useTimetableGroupWizardStore((s) => s.setExcludedSlots);
  const removeExcludedCourse = useTimetableGroupWizardStore(
    (s) => s.removeExcludedCourse,
  );
  const openCourseSearch = useTimetableGroupWizardStore((s) => s.openCourseSearch);
  const semester = useTimetableGroupWizardStore((s) => s.semester);

  const excludedSlotCount = new Set(excludedSlots).size;

  return (
    <ScrollContent>
      <Card>
        <CardHead>
          <CardTitle>수업 넣고 싶지 않은 시간</CardTitle>
          <CardSubtitle>드래그해서 선택하세요</CardSubtitle>
        </CardHead>
        <TimetableGrid
          events={EMPTY_EVENTS}
          isSelectionMode
          minDayCount={7}
          selectedSlots={excludedSlots}
          onSelectedSlotsChange={setExcludedSlots}
        />
        <Legend>
          <LegendSwatch />
          제외한 시간대 ({excludedSlotCount}칸)
        </Legend>
      </Card>

      <Card>
        <CardTitle>빼고 싶은 강의</CardTitle>
        <SearchFieldButton
          type="button"
          disabled={semester === null}
          onClick={() => openCourseSearch({ kind: "exclusion" })}
        >
          <Icon name="search" size={16} color="var(--text-tertiary, #8b95a1)" />
          <span>교과목명, 교수명 검색</span>
        </SearchFieldButton>
        {excludedCourses.length > 0 && (
          <ChipRow>
            {excludedCourses.map((c) => (
              <Chip key={c.subjectNumber}>
                <span>{c.title}</span>
                <ChipRemove onClick={() => removeExcludedCourse(c.subjectNumber)}>
                  <Icon name="close-md" size={12} />
                </ChipRemove>
              </Chip>
            ))}
          </ChipRow>
        )}
      </Card>

      <BottomActionsSpacer />
    </ScrollContent>
  );
};

export default GroupWizardStep3Exclusion;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
`;

const Card = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
`;

const CardHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.span`
  color: var(--text-primary, #191f28);
  font-size: 15px;
  font-weight: 700;
  line-height: 23px;
`;

const CardSubtitle = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
  line-height: 18px;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
`;

const LegendSwatch = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: rgba(0, 97, 255, 0.4);
  flex-shrink: 0;
`;

const SearchFieldButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);
  cursor: pointer;
  text-align: left;

  span {
    color: var(--text-tertiary, #8b95a1);
    font-size: 14px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 8px 8px 14px;
  border-radius: 999px;
  background: var(--bg-error, #fff0f0);
  border: 1px solid rgba(239, 68, 68, 0.2);

  span {
    color: var(--text-error, #ef4444);
    font-size: 14px;
    font-weight: 500;
  }
`;

const ChipRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--text-error, #ef4444);
  cursor: pointer;
`;

const BottomActionsSpacer = styled.div`
  height: 80px;
  flex-shrink: 0;
`;
