import { useState, useRef } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import InputField from "@/components/common/InputField";
import CourseTimeSelector, {
  CourseTimeSlot,
} from "@/components/mobile/timetable/CourseTimeSelector";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { useTimetableStore } from "@/stores/useTimetableStore";
import CapsuleButton from "@/components/common/CapsuleButton";

const DEFAULT_COLOR = "var(--color-chips-red)";

const MobileCourseAddPage = () => {
  const navigate = useNavigate();
  const { timetables, activeTimetableId, updateTimetableEvents } =
    useTimetableStore();
  const activeTimetable = timetables.find((t) => t.id === activeTimetableId);

  // 헤더 설정
  useHeader({
    title: "과목 직접 추가",
    showAlarm: false,
    hasback: true,
  });

  // 상태 관리 - 강의 정보
  const [courseName, setCourseName] = useState("");
  const [professor, setProfessor] = useState("");
  const [room, setRoom] = useState("");
  const [grade, setGrade] = useState("");
  const [courseType, setCourseType] = useState("");
  const [evaluation, setEvaluation] = useState("");

  // 에러 상태
  const [nameError, setNameError] = useState("");
  const [professorError, setProfessorError] = useState("");

  // 상태 관리 - 시간 정보 (기본적으로 1개 슬롯 탑재)
  const [timeSlots, setTimeSlots] = useState<CourseTimeSlot[]>([
    { id: "slot-1", day: 0, startTime: "15:00", endTime: "16:30" },
  ]);

  // Ref 관리
  const courseNameRef = useRef<HTMLInputElement>(null);
  const professorRef = useRef<HTMLInputElement>(null);

  // 시간 슬롯 제어 함수들
  const handleTimeSlotChange = (updatedSlot: CourseTimeSlot) => {
    setTimeSlots((prev) =>
      prev.map((s) => (s.id === updatedSlot.id ? updatedSlot : s)),
    );
  };

  const handleAddTimeSlot = () => {
    const newSlot: CourseTimeSlot = {
      id: `slot-${Date.now()}`,
      day: 0,
      startTime: "09:00",
      endTime: "10:30",
    };
    setTimeSlots((prev) => [...prev, newSlot]);
  };

  const handleRemoveTimeSlot = (id: string) => {
    if (timeSlots.length <= 1) return;
    setTimeSlots((prev) => prev.filter((s) => s.id !== id));
  };

  // 저장 로직
  const handleSave = () => {
    let hasError = false;
    if (!courseName.trim()) {
      setNameError("과목명을 입력해 주세요.");
      courseNameRef.current?.focus();
      hasError = true;
    } else {
      setNameError("");
    }

    if (!professor.trim()) {
      setProfessorError("교수명을 입력해 주세요.");
      if (!hasError) {
        professorRef.current?.focus();
      }
      hasError = true;
    } else {
      setProfessorError("");
    }

    if (hasError) return;

    if (!activeTimetable || activeTimetableId === null) {
      alert("활성화된 시간표가 없습니다.");
      return;
    }

    const parseTimeToNumber = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours + minutes / 60;
    };

    const newCourseId =
      Math.max(0, ...activeTimetable.events.map((e) => e.id)) + 1;

    const newSchedules = timeSlots.map((slot) => ({
      id: newCourseId,
      name: courseName,
      room: room || "강의실 미정",
      day: slot.day,
      startTime: parseTimeToNumber(slot.startTime),
      endTime: parseTimeToNumber(slot.endTime),
      professor: professor || "",
      memo: "",
      color: DEFAULT_COLOR,
      grade: grade || "",
      courseType: courseType || "",
      evaluation: evaluation || "",
    }));

    const isOverlapping = (a: any, b: any) => {
      if (a.day !== b.day) return false;
      return a.startTime < b.endTime && b.startTime < a.endTime;
    };

    let conflictItem: any = null;
    for (const newSlot of newSchedules) {
      for (const existingSlot of activeTimetable.events) {
        if (isOverlapping(newSlot, existingSlot)) {
          conflictItem = existingSlot;
          break;
        }
      }
      if (conflictItem) break;
    }

    if (conflictItem) {
      const proceed = window.confirm(
        `시간이 겹쳐요 - ${conflictItem.name}과(와) 시간이 겹쳐요.\n이 과목으로 교체하시겠어요?`,
      );
      if (!proceed) return;

      const updatedEvents = [
        ...activeTimetable.events.filter((e) => e.id !== conflictItem.id),
        ...newSchedules,
      ];
      updateTimetableEvents(activeTimetableId, updatedEvents);
    } else {
      const updatedEvents = [...activeTimetable.events, ...newSchedules];
      updateTimetableEvents(activeTimetableId, updatedEvents);
    }

    alert(`"${courseName}" 과목이 시간표에 추가되었습니다.`);
    navigate(ROUTES.TIMETABLE.EDIT);
  };

  return (
    <PageWrapper>
      {/* 강의 정보 */}
      <FormSection>
        <SectionTitle>강의 정보</SectionTitle>
        <FormFields>
          <Row>
            <StyledInputField
              ref={courseNameRef as any}
              label="과목명 *"
              placeholder="과목명 입력"
              value={courseName}
              onChange={(val) => {
                setCourseName(val);
                if (val.trim()) setNameError("");
              }}
              error={nameError}
            />
            <StyledInputField
              ref={professorRef as any}
              label="교수명 *"
              placeholder="교수명 입력"
              value={professor}
              onChange={(val) => {
                setProfessor(val);
                if (val.trim()) setProfessorError("");
              }}
              error={professorError}
            />
          </Row>
          <Row>
            <StyledInputField
              label="강의실"
              placeholder="강의실 입력"
              value={room}
              onChange={setRoom}
            />
            <StyledInputField
              label="학년"
              placeholder="학년 입력"
              value={grade}
              onChange={setGrade}
            />
          </Row>
          <Row>
            <StyledInputField
              label="이수구분"
              placeholder="이수구분 입력"
              value={courseType}
              onChange={setCourseType}
            />
            <StyledInputField
              label="평가방식"
              placeholder="평가방식 입력"
              value={evaluation}
              onChange={setEvaluation}
            />
          </Row>
        </FormFields>
      </FormSection>

      {/* 시간 설정 */}
      <FormSection style={{ gap: "12px" }}>
        {timeSlots.map((slot, index) => (
          <CourseTimeSelector
            key={slot.id}
            slot={slot}
            index={index}
            totalSlots={timeSlots.length}
            onChange={handleTimeSlotChange}
            onAdd={handleAddTimeSlot}
            onRemove={() => handleRemoveTimeSlot(slot.id)}
          />
        ))}
      </FormSection>

      {/* 저장하기 버튼 */}
      <SubmitButtonContainer>
        <CapsuleButton variant="primary" fullWidth onClick={handleSave}>
          저장하기
        </CapsuleButton>
      </SubmitButtonContainer>
    </PageWrapper>
  );
};

export default MobileCourseAddPage;

// --- Styles ---
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  background-color: var(--bg-subtle, #f8f9fb);
  min-height: calc(100vh - var(--header-height, 56px));
  padding: 16px;
  padding-bottom: 120px;
  gap: 24px;

  @media ${DESKTOP_MEDIA} {
    padding: calc(var(--header-height, 56px) + 16px) 16px 120px;
  }
`;

const FormSection = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const SectionTitle = styled.h2`
  color: var(--text-secondary, #6b7684);
  font-family:
    "Pretendard",
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;
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

const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const StyledInputField = styled(InputField)`
  && {
    background-color: ${({ error }) => (error ? "var(--bg-error, #fff0f0)" : "var(--bg-base, #ffffff)")};
  }
`;

const SubmitButtonContainer = styled.div`
  position: fixed;
  bottom: 32px;
  left: 0;
  right: 0;
  padding: 8px 24px;
  z-index: 100;
  max-width: 768px;
  margin: 0 auto;
  box-sizing: border-box;
  background: transparent;
  filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.08));

  @media ${DESKTOP_MEDIA} {
    position: relative;
    padding: 24px 0 0;
    background-color: transparent;
    filter: none;
    width: 100%;
  }
`;
