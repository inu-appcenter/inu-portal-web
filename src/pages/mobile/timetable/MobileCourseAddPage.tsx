import { useState, useRef } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import InputField from "@/components/common/InputField";
import CourseTimeSelector, {
  CourseTimeSlot,
} from "@/components/mobile/timetable/CourseTimeSelector";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { useTimetableStore } from "@/stores/useTimetableStore";
import CapsuleButton from "@/components/common/CapsuleButton";
import {
  useCreateTimeTableCustomItem,
  useUpdateTimeTableCustomItem,
} from "@/hooks/useTimeTables";
import { DAY_BY_INDEX } from "@/utils/timetable";
import type { TimeTableCustomMeetingRequest } from "@/types/timetables";

// 편집 페이지에서 커스텀 일정 수정으로 진입할 때 넘겨주는 라우터 state
export interface CustomScheduleEditState {
  customScheduleId: number;
  title: string;
  memo: string;
  meetings: {
    day: number; // 그리드 요일 인덱스 (0: 월)
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    location: string;
  }[];
}

const MobileCourseAddPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editItem = (location.state as { editItem?: CustomScheduleEditState })
    ?.editItem;

  const { timetables, activeTimetableId } = useTimetableStore();
  const activeTimetable = timetables.find((t) => t.id === activeTimetableId);

  const createCustomItemMutation = useCreateTimeTableCustomItem();
  const updateCustomItemMutation = useUpdateTimeTableCustomItem();
  const isPending =
    createCustomItemMutation.isPending || updateCustomItemMutation.isPending;

  // 헤더 설정
  useHeader({
    title: editItem ? "과목 수정" : "과목 직접 추가",
    showAlarm: false,
    hasback: true,
  });

  // 상태 관리 - 강의 정보 (수정 모드면 기존 값으로 프리필)
  const [courseName, setCourseName] = useState(editItem?.title ?? "");
  const [professor, setProfessor] = useState("");
  const [room, setRoom] = useState(editItem?.meetings[0]?.location ?? "");
  const [grade, setGrade] = useState("");
  const [courseType, setCourseType] = useState("");
  const [evaluation, setEvaluation] = useState("");

  // 에러 상태
  const [nameError, setNameError] = useState("");

  // 상태 관리 - 시간 정보 (기본적으로 1개 슬롯 탑재)
  const [timeSlots, setTimeSlots] = useState<CourseTimeSlot[]>(
    editItem && editItem.meetings.length > 0
      ? editItem.meetings.map((meeting, index) => ({
          id: `slot-${index + 1}`,
          day: meeting.day,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
        }))
      : [{ id: "slot-1", day: 0, startTime: "15:00", endTime: "16:30" }],
  );

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

  // 저장 로직 (커스텀 일정 요소 생성/수정 API 연동)
  const handleSave = () => {
    if (!courseName.trim()) {
      setNameError("과목명을 입력해 주세요.");
      courseNameRef.current?.focus();
      return;
    }
    setNameError("");

    if (!activeTimetable || activeTimetableId === null) {
      alert("활성화된 시간표가 없습니다.");
      return;
    }
    if (isPending) return;

    const meetings: TimeTableCustomMeetingRequest[] = timeSlots.map((slot) => ({
      location: room.trim() || undefined,
      day: DAY_BY_INDEX[slot.day],
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
    const title = courseName.trim();

    if (editItem) {
      updateCustomItemMutation.mutate(
        {
          timeTableId: activeTimetableId,
          customScheduleId: editItem.customScheduleId,
          // 수정 요청은 전체 교체이므로 기존 메모를 함께 보내야 유지된다
          body: { title, memo: editItem.memo || undefined, meetings },
        },
        {
          onSuccess: () => {
            alert(`"${title}" 과목이 수정되었습니다.`);
            navigate(ROUTES.TIMETABLE.EDIT);
          },
          onError: (error: any) => {
            alert(
              error.response?.data?.msg || "커스텀 일정 수정에 실패했습니다.",
            );
          },
        },
      );
      return;
    }

    createCustomItemMutation.mutate(
      { timeTableId: activeTimetableId, body: { title, meetings } },
      {
        onSuccess: () => {
          alert(`"${title}" 과목이 시간표에 추가되었습니다.`);
          navigate(ROUTES.TIMETABLE.EDIT);
        },
        onError: (error: any) => {
          alert(error.response?.data?.msg || "커스텀 일정 추가에 실패했습니다.");
        },
      },
    );
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
              label="교수명"
              placeholder="교수명 입력"
              value={professor}
              onChange={setProfessor}
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
        <CapsuleButton
          variant="primary"
          fullWidth
          onClick={handleSave}
          disabled={isPending}
        >
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
  color: var(--gray-600, #6b7684);
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
