import { useState, useRef, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import InputField from "@/components/common/InputField";
import CourseTimeSelector, {
  CourseTimeSlot,
} from "@/components/mobile/timetable/CourseTimeSelector";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useTimetableStore } from "@/stores/useTimetableStore";
import CapsuleButton from "@/components/common/CapsuleButton";
import {
  useCreateTimeTableCustomItem,
  useTimeTableDetail,
  useTimeTables,
  useUpdateTimeTableCustomItem,
} from "@/hooks/useTimeTables";
import { DAY_BY_INDEX, DAY_INDEX } from "@/utils/timetable";
import type { TimeTableCustomMeetingRequest } from "@/types/timetables";
import { mixpanelTrack } from "@/utils/mixpanel";

// 서버가 "HH:mm:ss"로 내려주더라도 시간 선택기가 쓰는 "HH:mm"으로 맞춘다
const toHourMinute = (time: string) => time.slice(0, 5);

const MobileCourseAddPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 수정 대상은 URL로만 전달된다. 라우터 state는 신 앱의 멀티 웹뷰 전환에서
  // 유실되기 때문(MobileTimeTableEditPage.handleEdit 주석 참고).
  const editingScheduleIdParam = searchParams.get("customScheduleId");
  const editingScheduleId =
    editingScheduleIdParam && Number.isInteger(Number(editingScheduleIdParam))
      ? Number(editingScheduleIdParam)
      : null;
  const isEditMode = editingScheduleId !== null;

  // 새로고침으로 이 페이지에 바로 진입해도 활성 시간표를 복구할 수 있도록 목록을 조회
  useTimeTables();
  const { timetables, activeTimetableId } = useTimetableStore();
  const activeTimetable = timetables.find((t) => t.id === activeTimetableId);

  // 수정 모드에서는 상세를 다시 조회해 기존 값을 채운다
  const { detail, isLoading: isDetailLoading } = useTimeTableDetail(
    activeTimetableId,
    { enabled: isEditMode },
  );

  const editTarget = useMemo(() => {
    if (!isEditMode || !detail) return null;
    const item = detail.items.find(
      (i) =>
        i.type === "CUSTOM" &&
        i.customSchedule?.customScheduleId === editingScheduleId,
    );
    return item?.customSchedule ? { item, custom: item.customSchedule } : null;
  }, [detail, editingScheduleId, isEditMode]);

  const createCustomItemMutation = useCreateTimeTableCustomItem();
  const updateCustomItemMutation = useUpdateTimeTableCustomItem();
  const isPending =
    createCustomItemMutation.isPending || updateCustomItemMutation.isPending;

  // 헤더 설정 (상세 로딩과 무관하게 URL만으로 모드가 정해진다)
  useHeader({
    title: isEditMode ? "일정 수정" : "일정 추가",
    showAlarm: false,
    hasback: true,
  });

  // 상태 관리 - 일정 정보
  const [courseName, setCourseName] = useState("");
  const [memo, setMemo] = useState("");

  // 에러 상태
  const [nameError, setNameError] = useState("");

  // 상태 관리 - 시간 정보 (기본적으로 1개 슬롯 탑재)
  const [timeSlots, setTimeSlots] = useState<CourseTimeSlot[]>([
    { id: "slot-1", day: 0, startTime: "15:00", endTime: "16:30" },
  ]);

  // Ref 관리
  const courseNameRef = useRef<HTMLInputElement>(null);

  // 상세가 도착한 시점에 한 번만 프리필한다.
  // (이후 재조회로 폼이 다시 덮이면 사용자가 입력하던 값이 날아간다)
  const hasPrefilledRef = useRef(false);
  useEffect(() => {
    if (!editTarget || hasPrefilledRef.current) return;
    hasPrefilledRef.current = true;

    setCourseName(editTarget.custom.title ?? "");
    setMemo(editTarget.item.memo ?? "");
    if (editTarget.custom.meetings.length > 0) {
      setTimeSlots(
        editTarget.custom.meetings.map((meeting, index) => ({
          id: `slot-${index + 1}`,
          day: DAY_INDEX[meeting.day],
          startTime: toHourMinute(meeting.startTime),
          endTime: toHourMinute(meeting.endTime),
          location: meeting.location ?? undefined,
        })),
      );
    }
  }, [editTarget]);

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
      setNameError("이름을 입력해 주세요.");
      courseNameRef.current?.focus();
      return;
    }
    setNameError("");

    // "HH:mm"은 사전순 비교가 곧 시간순 비교다(0 패딩 고정폭)
    const invalidSlotIndex = timeSlots.findIndex(
      (slot) => slot.endTime <= slot.startTime,
    );
    if (invalidSlotIndex !== -1) {
      alert(
        `일정 ${invalidSlotIndex + 1}의 종료 시간이 시작 시간보다 빠르거나 같아요.`,
      );
      return;
    }

    if (!activeTimetable || activeTimetableId === null) {
      alert("활성화된 시간표가 없습니다.");
      return;
    }
    if (isPending) return;

    const meetings: TimeTableCustomMeetingRequest[] = timeSlots.map((slot) => ({
      location: slot.location?.trim() || undefined,
      day: DAY_BY_INDEX[slot.day],
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
    const title = courseName.trim();
    const trimmedMemo = memo.trim();

    if (editingScheduleId !== null) {
      updateCustomItemMutation.mutate(
        {
          timeTableId: activeTimetableId,
          customScheduleId: editingScheduleId,
          body: { title, memo: trimmedMemo || undefined, meetings },
        },
        {
          onSuccess: () => {
            mixpanelTrack.timetableItemActionCompleted(
              "직접 일정 수정",
              "직접 일정",
              {
                semester: activeTimetable.semester,
                meeting_count: meetings.length,
              },
            );
            alert(`"${title}" 일정이 수정되었습니다.`);
            // EDIT로 push하면 안 된다. 이 화면은 신 앱에서 별도 웹뷰로 열리므로
            // 아래에 편집 화면 웹뷰가 그대로 살아 있고, 여기서 또 편집 화면을
            // 그리면 같은 화면이 두 겹으로 쌓인다. 웹뷰를 닫아 원래 화면으로
            // 돌아간다(router.tsx가 -1을 appBridge.goBack()으로 처리).
            navigate(-1);
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
      {
        timeTableId: activeTimetableId,
        body: { title, memo: trimmedMemo || undefined, meetings },
      },
      {
        onSuccess: () => {
          mixpanelTrack.timetableItemActionCompleted("직접 일정 추가", "직접 일정", {
            semester: activeTimetable.semester,
            meeting_count: meetings.length,
          });
          alert(`"${title}" 일정이 시간표에 추가되었습니다.`);
          navigate(-1); // 위 수정 성공 분기의 주석 참고
        },
        onError: (error: any) => {
          alert(error.response?.data?.msg || "커스텀 일정 추가에 실패했습니다.");
        },
      },
    );
  };

  // 수정 모드인데 아직 값을 채우지 못했다면 빈 폼을 보여주지 않는다.
  // 빈 폼이 스쳐 보이면 "추가 화면이 열렸다"로 오인되고, 그 사이 입력한 값도 덮인다.
  if (isEditMode && !editTarget) {
    return (
      <PageWrapper>
        <StatusText>
          {isDetailLoading || activeTimetableId === null
            ? "일정을 불러오는 중이에요."
            : "일정을 찾을 수 없어요. 삭제되었을 수 있어요."}
        </StatusText>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* 일정 정보 */}
      <FormSection>
        <SectionTitle>일정 정보</SectionTitle>
        <FormFields>
          <StyledInputField
            ref={courseNameRef as any}
            label="이름 *"
            required
            placeholder="이름 입력"
            value={courseName}
            onChange={(val) => {
              setCourseName(val);
              if (val.trim()) setNameError("");
            }}
            error={nameError}
          />
          <StyledInputField
            label="메모"
            placeholder="메모 입력"
            value={memo}
            onChange={setMemo}
          />
        </FormFields>
      </FormSection>

      {/* 일정 시간 */}
      <FormSection style={{ gap: "12px" }}>
        {timeSlots.map((slot, index) => (
          <CourseTimeSelector
            key={slot.id}
            slot={slot}
            index={index}
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
    padding: 0 16px 120px;
  }
`;

const StatusText = styled.p`
  color: var(--gray-600, #6b7684);
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  margin: 0;
  padding: 40px 0;
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
  padding: 16px ${MOBILE_PAGE_GUTTER}
    calc(16px + env(safe-area-inset-bottom, 0px));
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
