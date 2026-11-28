import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { typography } from "@/styles/typography";

interface GradeDropdownProps {
  /** 선택된 성적. 빈 문자열이면 미입력(Empty 상태, "선택"). */
  value: string;
  grades: readonly string[];
  onChange: (grade: string) => void;
  /** 스크린리더용 과목명 */
  subjectName: string;
}

/**
 * Figma `Timetable/Dropdown_Grade`(7941:32796).
 * 누르면 OS 기본 피커(<select>)가 열린다. 투명한 select를 버튼 위에 겹쳐 둔다.
 * State: Default / Pressed(검정 8%) / Open(gray/200 배경, 위 화살표) / Empty("선택").
 */
export default function GradeDropdown({
  value,
  grades,
  onChange,
  subjectName,
}: GradeDropdownProps) {
  const isEmpty = value === "";
  return (
    <Wrapper $empty={isEmpty}>
      <span className="grade-text">{isEmpty ? "선택" : value}</span>
      <Icon name="chevron-down" size={16} className="grade-caret" />
      <NativeSelect
        aria-label={`${subjectName || "과목"} 성적`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {grades.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
        <option value="">미입력</option>
      </NativeSelect>
    </Wrapper>
  );
}

const Wrapper = styled.div<{ $empty: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
  width: 68px;
  height: 44px;
  padding: 0 8px 0 12px;
  box-sizing: border-box;
  border-radius: 12px;
  background: var(--bg-subtle);
  color: ${({ $empty }) =>
    $empty ? "var(--text-tertiary)" : "var(--text-secondary)"};
  overflow: hidden;

  .grade-text {
    ${typography.heading2}
    white-space: nowrap;
  }

  .grade-caret {
    flex-shrink: 0;
    color: var(--text-secondary);
    transition: transform 0.15s ease;
  }

  &:active {
    box-shadow: inset 0 0 0 999px rgba(0, 0, 0, 0.08);
  }

  /* Open: 피커가 열린 동안(select 포커스) 진한 배경 + 위 화살표 */
  &:focus-within {
    background: var(--gray-200);

    .grade-caret {
      transform: rotate(180deg);
    }
  }
`;

const NativeSelect = styled.select`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  /* iOS에서 16px 미만이면 포커스 시 확대된다 */
  font-size: 16px;
`;
