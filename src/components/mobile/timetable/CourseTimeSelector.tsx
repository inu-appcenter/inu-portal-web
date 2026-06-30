import styled from "styled-components";
import { Plus, Minus } from "lucide-react";
import DayChip from "@/components/common/DayChip";

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
              <Minus size={16} color="#8b95a1" strokeWidth={2.5} />
            </IconButton>
          )}
          <IconButton onClick={onAdd} type="button">
            <Plus size={16} color="#8b95a1" strokeWidth={2.5} />
          </IconButton>
        </ActionButtons>
      </SelectorHeader>

      <DayChipContainer>
        {DAYS.map((dayName, dayIndex) => {
          const isSelected = slot.day === dayIndex;
          return (
            <DayChip
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
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-800, #333d4b);
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid var(--gray-300, #d1d6db);
  border-radius: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;

  &:active {
    background-color: var(--gray-100, #f1f3f5);
    border-color: var(--gray-400, #b0b8c1);
  }
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
  background-color: var(--gray-50, #f8f9fb);
  border: 1px solid var(--gray-200, #e5e8eb);
  border-radius: var(--radius-lg, 12px);
  padding: 8px 16px;
  height: 56px;
  box-sizing: border-box;
  justify-content: center;
  cursor: pointer;
`;

const TimePickerLabel = styled.span`
  font-size: 11px;
  color: var(--text-tertiary, #8b95a1);
  margin-bottom: 2px;
  text-align: left;
`;

const TimePickerDisplay = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-800, #333d4b);
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
