import { useState } from "react";
import styled from "styled-components";
import { Search, X } from "lucide-react";
import TimetableGrid from "@/components/mobile/timetable/TimetableGrid";
import WizardCourseSearchSheet from "@/components/mobile/timetable/wizard/WizardCourseSearchSheet";
import type {
  WizardCourseOption,
  WizardExclusionConditions,
} from "@/types/timetableWizard";

interface WizardStep3ExclusionProps {
  coursePool: WizardCourseOption[];
  exclusion: WizardExclusionConditions;
  excludedCourses: WizardCourseOption[];
  onChangeExclusion: (
    updater: (prev: WizardExclusionConditions) => WizardExclusionConditions,
  ) => void;
}

const EMPTY_EVENTS: never[] = [];

const WizardStep3Exclusion = ({
  coursePool,
  exclusion,
  excludedCourses,
  onChangeExclusion,
}: WizardStep3ExclusionProps) => {
  const [isSearchSheetOpen, setSearchSheetOpen] = useState(false);

  const excludedSlotCount = new Set(exclusion.excludedSlots).size;

  const addExcludedCourse = (course: WizardCourseOption) => {
    onChangeExclusion((prev) =>
      prev.excludedSubjectNumbers.includes(course.subjectNumber)
        ? prev
        : {
            ...prev,
            excludedSubjectNumbers: [...prev.excludedSubjectNumbers, course.subjectNumber],
          },
    );
    setSearchSheetOpen(false);
  };

  const removeExcludedCourse = (subjectNumber: string) => {
    onChangeExclusion((prev) => ({
      ...prev,
      excludedSubjectNumbers: prev.excludedSubjectNumbers.filter((sn) => sn !== subjectNumber),
    }));
  };

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
          selectedSlots={exclusion.excludedSlots}
          onSelectedSlotsChange={(slots) =>
            onChangeExclusion((prev) => ({ ...prev, excludedSlots: slots }))
          }
        />
        <Legend>
          <LegendSwatch />
          제외한 시간대 ({excludedSlotCount}칸)
        </Legend>
      </Card>

      <Card>
        <CardTitle>빼고 싶은 강의</CardTitle>
        <SearchFieldButton type="button" onClick={() => setSearchSheetOpen(true)}>
          <Search size={16} color="var(--text-tertiary, #8b95a1)" />
          <span>강의명 검색</span>
        </SearchFieldButton>
        {excludedCourses.length > 0 && (
          <ChipRow>
            {excludedCourses.map((c) => (
              <Chip key={c.subjectNumber}>
                <span>{c.title}</span>
                <ChipRemove onClick={() => removeExcludedCourse(c.subjectNumber)}>
                  <X size={12} />
                </ChipRemove>
              </Chip>
            ))}
          </ChipRow>
        )}
      </Card>

      <BottomActionsSpacer />

      <WizardCourseSearchSheet
        open={isSearchSheetOpen}
        onOpenChange={setSearchSheetOpen}
        title="빼고 싶은 강의 검색"
        pool={coursePool}
        disabledSubjectNumbers={exclusion.excludedSubjectNumbers}
        onSelect={addExcludedCourse}
      />
    </ScrollContent>
  );
};

export default WizardStep3Exclusion;

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
  color: var(--text-secondary, #333d4b);
  font-size: 16px;
  font-weight: 600;
  line-height: 23px;
`;

const CardSubtitle = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
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
    color: var(--text-disabled, #b0b8c1);
    font-size: 15px;
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
