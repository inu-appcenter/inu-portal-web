import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Modal from "@/components/common/Modal";
import InputField from "@/components/common/InputField";
import { Timetable, useTimetableStore } from "@/stores/useTimetableStore";
import type { TimeTable } from "@/types/timetables";
import { useSemesters } from "@/hooks/useSemesters";
import { useCreateTimeTable } from "@/hooks/useTimeTables";
import { formatSemester } from "@/utils/semester";


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
  onSuccess?: (created: TimeTable) => void;
}

export default function TimeTableCreateModal({
  isOpen,
  initialSemester,
  onClose,
  onSuccess,
}: TimeTableCreateModalProps) {
  const { timetables, setSemester, setActiveTimetable } = useTimetableStore();
  const { semesters } = useSemesters();
  const createTimeTableMutation = useCreateTimeTable();

  const semesterOptions = useMemo(
    () =>
      semesters.map((s) => ({
        id: s.id,
        label: formatSemester(s.year, s.term),
      })),
    [semesters],
  );

  const fallbackSemesterId = useMemo(() => {
    const matched = semesterOptions.find((s) => s.label === initialSemester);
    return matched?.id ?? semesterOptions[0]?.id ?? null;
  }, [initialSemester, semesterOptions]);

  const [modalSemesterId, setModalSemesterId] = useState<number | null>(null);
  const [modalName, setModalName] = useState("");

  const getSemesterLabel = (semesterId: number | null) =>
    semesterOptions.find((s) => s.id === semesterId)?.label ?? "";

  useEffect(() => {
    if (!isOpen) return;

    setModalSemesterId(fallbackSemesterId);
    setModalName(
      getDefaultTimetableName(getSemesterLabel(fallbackSemesterId), timetables),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallbackSemesterId, isOpen, timetables]);

  const handleSemesterChange = (semesterId: number) => {
    setModalSemesterId(semesterId);
    setModalName(
      getDefaultTimetableName(getSemesterLabel(semesterId), timetables),
    );
  };

  const handleSave = () => {
    if (!modalName.trim() || modalSemesterId === null) return;

    createTimeTableMutation.mutate(
      { semesterId: modalSemesterId, timeTableName: modalName.trim() },
      {
        onSuccess: (created) => {
          setSemester(formatSemester(created.year, created.term));
          setActiveTimetable(created.id);
          onClose();
          onSuccess?.(created);
        },
        onError: (error: any) => {
          alert(error.response?.data?.msg || "시간표 생성에 실패했습니다.");
        },
      },
    );
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
        disabled:
          !modalName.trim() ||
          modalSemesterId === null ||
          createTimeTableMutation.isPending,
      }}
      secondaryButton={{
        text: "취소",
        onClick: onClose,
      }}
    >
      <SelectContainer>
        <SelectLabel>학기</SelectLabel>
        <StyledSelect
          value={modalSemesterId ?? ""}
          onChange={(e) => handleSemesterChange(Number(e.target.value))}
        >
          {semesterOptions.map((sem) => (
            <option key={sem.id} value={sem.id}>
              {sem.label}
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
