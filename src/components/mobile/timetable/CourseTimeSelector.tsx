import styled from "styled-components";
import { Plus, Minus } from "lucide-react";
import DayChip, { DayChipProps } from "@/components/common/DayChip";

export interface CourseTimeSlot {
  id: string;
  day: number; // 0:월 ~ 4:금
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

interface CourseTimeSelectorProps {
  slot: CourseTimeSlot;
  index: number;
  totalSlots: number;
  onChange: (updatedSlot: CourseTimeSlot) => void;
  onAdd: () => void;
  onRemove: () => void;
}

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const CourseTimeSelector = ({
  slot,
  index,
  totalSlots,
  onChange,
  onAdd,
  onRemove,
}: CourseTimeSelectorProps) => {
  const handleDaySelect = (dayIndex: number) => {
    onChange({
      ...slot,
      day: dayIndex,
    });
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slot,
      startTime: e.target.value || "09:00",
    });
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...slot,
      endTime: e.target.value || "10:30",
    });
  };

  const handleTimeClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      if (typeof e.currentTarget.showPicker === "function") {
        e.currentTarget.showPicker();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SelectorContainer>
      <SelectorHeader>
        <Title>시간 {index + 1}</Title>
        <ActionButtons>
          {totalSlots > 1 && (
            <IconButton onClick={onRemove} type="button">
              <Minus size={20} color="#8b95a1" strokeWidth={2.5} />
            </IconButton>
          )}
          <IconButton onClick={onAdd} type="button">
            <Plus size={20} color="#8b95a1" strokeWidth={2.5} />
          </IconButton>
        </ActionButtons>
      </SelectorHeader>

      <DayChipContainer>
        {DAYS.map((dayName, dayIndex) => {
          const isSelected = slot.day === dayIndex;
          return (
            <StyledDayChip
              key={dayName}
              label={dayName}
              isSelected={isSelected}
              onClick={() => handleDaySelect(dayIndex)}
            />
          );
        })}
      </DayChipContainer>

      <TimeInputRow>
        <TimePickerField>
          <TimePickerLabel>시작</TimePickerLabel>
          <TimePickerDisplay>{slot.startTime}</TimePickerDisplay>
          <HiddenTimeInput
            type="time"
            value={slot.startTime}
            onChange={handleStartTimeChange}
            onClick={handleTimeClick}
          />
        </TimePickerField>

        <TimePickerField>
          <TimePickerLabel>종료</TimePickerLabel>
          <TimePickerDisplay>{slot.endTime}</TimePickerDisplay>
          <HiddenTimeInput
            type="time"
            value={slot.endTime}
            onChange={handleEndTimeChange}
            onClick={handleTimeClick}
          />
        </TimePickerField>
      </TimeInputRow>
    </SelectorContainer>
  );
};

export default CourseTimeSelector;

// --- Styles ---
const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  //margin-top: 16px;
`;

const SelectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Title = styled.h3`
  color: var(--gray-600, #6b7684);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
  margin-left: 4px;
  height: 40px;
  display: flex;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 999px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;

  &:active {
    background-color: var(--bg-muted, #f8f9fb);
  }
`;

const StyledDayChip = styled(({ isSelected, ...props }: DayChipProps) => <DayChip isSelected={isSelected} {...props} />)<{ isSelected: boolean }>`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  padding: 12px 16px;
  height: auto;
  border-radius: 999px;

  /* 비선택 상태 */
  background-color: var(--bg-base, white) !important;
  color: var(--text-primary, #333d4b) !important;
  border: 1px solid var(--border-default, #e5e8eb) !important;

  /* 선택 상태 */
  ${({ isSelected }) =>
    isSelected &&
    `
      background-color: var(--interactive-primary, #3b82f6) !important;
      border: 1px solid var(--interactive-primary, #3b82f6) !important;
      color: white !important;
    `}
`;

const DayChipContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TimeInputRow = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
`;

const TimePickerField = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: var(--radius-lg, 12px);
  padding: 8px 12px;
  height: 58px;
  box-sizing: border-box;
  justify-content: center;
  cursor: pointer;
`;

const TimePickerLabel = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-tertiary, #8b95a1);
  margin-bottom: 2px;
  text-align: left;
`;

const TimePickerDisplay = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #333d4b);
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
