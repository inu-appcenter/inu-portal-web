import React from "react";
import styled from "styled-components";

// ==========================================
// 1. 단일 DayChip 컴포넌트
// ==========================================

export interface DayChipProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const ChipButton = styled.button<{ $isSelected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  white-space: nowrap; /* 텍스트가 줄바꿈되지 않도록 설정 */

  /* 비선택 상태 */
  background-color: var(--bg-subtle, #f8f9fb);
  border: 1px solid var(--border-default, #e5e8eb);
  color: var(--text-tertiary);

  /* 선택 상태 */
  ${({ $isSelected }) =>
    $isSelected &&
    `
      background-color: var(--interactive-primary, #3b82f6);
      border: 1px solid var(--interactive-primary, #3b82f6);
      color: var(--text-inverse, #ffffff);
    `}

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
  }
`;

export const DayChip: React.FC<DayChipProps> = ({
  label,
  isSelected,
  onClick,
  className,
}) => {
  return (
    <ChipButton
      $isSelected={isSelected}
      onClick={onClick}
      className={className}
      type="button"
    >
      {label}
    </ChipButton>
  );
};

// ==========================================
// 2. DayChipGroup 컴포넌트 (선택 상태 관리용)
// ==========================================

export interface DayChipItem {
  id: string;
  label: string;
}

export type DayChipGroupProps = {
  chips: DayChipItem[];
  className?: string;
  gap?: string; // 칩들 사이 간격 (예: "8px")
} & (
  | {
      multiple: true;
      value: string[];
      onChange: (value: string[]) => void;
    }
  | {
      multiple?: false;
      value: string | null;
      onChange: (value: string | null) => void;
    }
);

const GroupContainer = styled.div<{ $gap: string }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ $gap }) => $gap};
  width: 100%;
`;

export const DayChipGroup: React.FC<DayChipGroupProps> = (props) => {
  const { chips, className, gap = "8px", multiple, value, onChange } = props;

  const handleChipClick = (id: string) => {
    if (multiple) {
      // 다중 선택 모드
      const currentValues = value as string[];
      if (currentValues.includes(id)) {
        onChange(currentValues.filter((v) => v !== id));
      } else {
        onChange([...currentValues, id]);
      }
    } else {
      // 단일 선택 모드
      const currentValue = value as string | null;
      if (currentValue === id) {
        onChange(null); // 이미 선택된 칩 클릭 시 해제
      } else {
        onChange(id);
      }
    }
  };

  const isChipSelected = (id: string): boolean => {
    if (multiple) {
      return (value as string[]).includes(id);
    }
    return (value as string | null) === id;
  };

  return (
    <GroupContainer $gap={gap} className={className}>
      {chips.map((chip) => (
        <DayChip
          key={chip.id}
          label={chip.label}
          isSelected={isChipSelected(chip.id)}
          onClick={() => handleChipClick(chip.id)}
        />
      ))}
    </GroupContainer>
  );
};

// ==========================================
// 3. 스네이크 케이스 및 다른 형식 별칭
// ==========================================
export const day_chip = DayChip;
export const Day_Chip = DayChip;
export const day_chip_group = DayChipGroup;
export const Day_Chip_Group = DayChipGroup;

export default DayChip;
