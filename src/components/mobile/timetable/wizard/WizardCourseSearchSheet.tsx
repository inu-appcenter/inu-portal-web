import { useMemo, useState } from "react";
import styled from "styled-components";
import { Search } from "lucide-react";
import BottomSheet from "@/components/common/BottomSheet";
import Ripple from "@/components/common/Ripple";
import { formatCourseMeetings } from "@/utils/timetableWizardFormat";
import type { WizardCourseOption } from "@/types/timetableWizard";

interface WizardCourseSearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pool: WizardCourseOption[];
  disabledSubjectNumbers?: string[];
  onSelect: (course: WizardCourseOption) => void;
}

const WizardCourseSearchSheet = ({
  open,
  onOpenChange,
  title,
  pool,
  disabledSubjectNumbers = [],
  onSelect,
}: WizardCourseSearchSheetProps) => {
  const [query, setQuery] = useState("");
  const disabledSet = useMemo(
    () => new Set(disabledSubjectNumbers),
    [disabledSubjectNumbers],
  );

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return pool.slice(0, 100);
    return pool
      .filter((c) => c.title.includes(trimmed) || (c.professor ?? "").includes(trimmed))
      .slice(0, 100);
  }, [pool, query]);

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery("");
      }}
      height={0.85}
      showCloseButton
    >
      <SheetHeading>{title}</SheetHeading>
      <SearchFieldWrap>
        <Search size={16} color="var(--text-tertiary, #8b95a1)" />
        <SearchInput
          autoFocus
          placeholder="강의명 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SearchFieldWrap>

      <ResultList>
        {results.length === 0 && <EmptyText>검색 결과가 없어요</EmptyText>}
        {results.map((course) => {
          const isDisabled = disabledSet.has(course.subjectNumber);
          return (
            <ResultRow
              key={course.subjectNumber}
              onClick={() => {
                if (isDisabled) return;
                onSelect(course);
              }}
              $disabled={isDisabled}
            >
              <ResultMain>
                <ResultTitle>{course.title}</ResultTitle>
                <ResultMeta>
                  {course.professor ? `${course.professor} · ` : ""}
                  {course.credit}학점
                </ResultMeta>
                <ResultMeta>{formatCourseMeetings(course) || "시간 정보 없음"}</ResultMeta>
              </ResultMain>
              {isDisabled && <SelectedLabel>추가됨</SelectedLabel>}
              <Ripple />
            </ResultRow>
          );
        })}
      </ResultList>
    </BottomSheet>
  );
};

export default WizardCourseSearchSheet;

const SheetHeading = styled.h2`
  margin: 4px 0 12px;
  color: var(--gray-900, #191f28);
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
`;

const SearchFieldWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 999px;
  background: var(--bg-subtle, #f2f4f6);
  margin-bottom: 12px;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-primary, #333d4b);

  &::placeholder {
    color: var(--text-disabled, #b0b8c1);
  }
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  padding-bottom: 16px;
`;

const EmptyText = styled.div`
  padding: 32px 0;
  text-align: center;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
`;

const ResultRow = styled.div<{ $disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  position: relative;
  overflow: hidden;

  & > *:not(.ripple-container) {
    position: relative;
    z-index: 1;
  }
`;

const ResultMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ResultTitle = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
`;

const ResultMeta = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  line-height: 18px;
`;

const SelectedLabel = styled.span`
  flex-shrink: 0;
  color: var(--text-brand, #0061ff);
  font-size: 12px;
  font-weight: 600;
`;
