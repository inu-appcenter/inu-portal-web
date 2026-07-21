import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Modal from "@/components/common/Modal";
import InputField from "@/components/common/InputField";
import { Timetable, useTimetableStore } from "@/stores/useTimetableStore";

export const TIMETABLE_SEMESTERS = [
  "2026년 2학기",
  "2026년 1학기",
  "2025년 2학기",
  "2025년 1학기",
  "2024년 2학기",
];

export const getDefaultTimetableName = (
  semester: string,
  timetables: Timetable[],
) => {
  const existingNames = timetables
    .filter((t) => t.semester === semester)
    .map((t) => t.name);

  let index = 1;
  while (true) {
    const candidate = `시간표 ${index}`;
    if (!existingNames.includes(candidate)) {
      return candidate;
    }
    index++;
  }
};

interface TimeTableCreateModalProps {
  isOpen: boolean;
  initialSemester?: string;
  onClose: () => void;
}

export default function TimeTableCreateModal({
  isOpen,
  initialSemester = TIMETABLE_SEMESTERS[0],
  onClose,
}: TimeTableCreateModalProps) {
  const { timetables, addTimetable } = useTimetableStore();
  const semesters = TIMETABLE_SEMESTERS;
  const fallbackSemester = useMemo(
    () =>
      semesters.includes(initialSemester)
        ? initialSemester
        : semesters[0],
    [initialSemester, semesters],
  );
  const [modalSemester, setModalSemester] = useState(fallbackSemester);
  const [modalName, setModalName] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setModalSemester(fallbackSemester);
    setModalName(getDefaultTimetableName(fallbackSemester, timetables));
  }, [fallbackSemester, isOpen, timetables]);

  const handleSemesterChange = (newSemester: string) => {
    setModalSemester(newSemester);
    setModalName(getDefaultTimetableName(newSemester, timetables));
  };

  const handleSave = () => {
    if (!modalName.trim()) return;

    addTimetable(modalSemester, modalName.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="시간표 추가"
      primaryButton={{
        text: "저장",
        variant: "brand",
        onClick: handleSave,
        disabled: !modalName.trim(),
      }}
      secondaryButton={{
        text: "취소",
        onClick: onClose,
      }}
    >
      <SelectContainer>
        <SelectLabel>학기</SelectLabel>
        <StyledSelect
          value={modalSemester}
          onChange={(e) => handleSemesterChange(e.target.value)}
        >
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </StyledSelect>
      </SelectContainer>

      <InputField
        label="시간표 이름"
        value={modalName}
        onChange={setModalName}
        placeholder="시간표 이름을 입력하세요"
      />
    </Modal>
  );
}

const SelectContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--border-default, #e5e8eb);
  background-color: var(--bg-base, #ffffff);
  padding: 8px 12px;
  min-height: 56px;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:focus-within {
    border-color: var(--border-brand, #0061ff);
  }
`;

const SelectLabel = styled.span`
  color: var(--text-tertiary, #8b95a1);
  margin-bottom: 4px;
  pointer-events: none;
  text-align: left;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

const StyledSelect = styled.select`
  border: none;
  background: transparent;
  outline: none;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  color: var(--text-primary, #333d4b);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.6;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='%238B95A1' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0px center;
`;
