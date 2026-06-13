import { useState, useRef } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import InputField from "@/components/common/InputField";
import CourseTimeSelector, {
  CourseTimeSlot,
} from "@/components/mobile/timetable/CourseTimeSelector";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/responsive";
import { Check, Plus } from "lucide-react";

const DEFAULT_COLORS = [
  "var(--color-chips-red)",
  "var(--color-chips-orange)",
  "var(--color-chips-yellow)",
  "var(--color-chips-teal)",
  "var(--color-chips-skyblue)",
  "var(--color-chips-lilac)",
  "var(--color-chips-violet)",
  "var(--color-chips-purple)",
  "var(--color-chips-pink)",
  "var(--color-chips-gray)",
];

const MobileCourseAddPage = () => {
  const navigate = useNavigate();

  // 헤더 설정
  useHeader({
    title: "과목 추가",
    showAlarm: false,
    hasback: true,
  });

  // 상태 관리 - 강의 정보
  const [courseName, setCourseName] = useState("");
  const [professor, setProfessor] = useState("");
  const [room, setRoom] = useState("");
  const [memo, setMemo] = useState("");

  // 에러 상태
  const [nameError, setNameError] = useState("");

  // 상태 관리 - 시간 정보 (기본적으로 1개 슬롯 탑재)
  const [timeSlots, setTimeSlots] = useState<CourseTimeSlot[]>([
    { id: "slot-1", day: 0, startTime: "15:00", endTime: "16:30" },
  ]);

  // 상태 관리 - 색상 정보
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLORS[0]);

  // Ref 관리
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const courseNameRef = useRef<HTMLInputElement>(null);

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

  // 커스텀 색상 추가
  const handleCustomColorClick = () => {
    return;
    colorPickerRef.current?.click();
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexColor = e.target.value;
    if (hexColor) {
      setCustomColors((prev) => [...prev, hexColor]);
      setSelectedColor(hexColor);
    }
  };

  // 저장 로직
  const handleSave = () => {
    if (!courseName.trim()) {
      setNameError("과목명을 입력해 주세요.");
      courseNameRef.current?.focus();
      return;
    }
    setNameError("");

    // 목업으로 임시 데이터 구성 후 반환
    const newCourseData = {
      name: courseName,
      professor,
      room,
      memo,
      schedules: timeSlots,
      color: selectedColor,
    };

    console.log("Saving new course:", newCourseData);
    alert(`"${courseName}" 과목이 시간표에 추가되었습니다.`);
    navigate(ROUTES.TIMETABLE.EDIT);
  };

  const allColors = [...DEFAULT_COLORS, ...customColors];

  return (
    <PageWrapper>
      {/* 강의 정보 */}
      <FormSection>
        <SectionTitle>강의 정보</SectionTitle>
        <FormFields>
          <InputField
            ref={courseNameRef as any}
            label="과목명"
            placeholder="과목명을 입력하세요"
            value={courseName}
            onChange={(val) => {
              setCourseName(val);
              if (val.trim()) setNameError("");
            }}
            error={nameError}
          />
          <InputField
            label="교수명"
            placeholder="교수명을 입력하세요"
            value={professor}
            onChange={setProfessor}
          />
          <InputField
            label="강의실"
            placeholder="예: 07-504"
            value={room}
            onChange={setRoom}
          />
          <InputField
            label="메모"
            placeholder="비고나 메모를 입력하세요"
            isTextArea={true}
            rows={3}
            value={memo}
            onChange={setMemo}
          />
        </FormFields>
      </FormSection>

      <Divider />

      {/* 시간 설정 */}
      <FormSection>
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

      <Divider />

      {/* 색상 설정 */}
      <FormSection>
        <SectionTitle>색상</SectionTitle>
        <ColorPaletteGrid>
          {allColors.map((colorVal) => {
            const isSelected = selectedColor === colorVal;
            return (
              <ColorChipButton
                key={colorVal}
                $chipColor={colorVal}
                $isSelected={isSelected}
                onClick={() => setSelectedColor(colorVal)}
                type="button"
              >
                {isSelected && (
                  <Check size={16} color="#ffffff" strokeWidth={3} />
                )}
              </ColorChipButton>
            );
          })}

          {/* 커스텀 색상 추가 버튼 */}
          <CustomColorButton onClick={handleCustomColorClick} type="button">
            <Plus
              size={18}
              color="var(--gray-500, #8b95a1)"
              strokeWidth={2.5}
            />
          </CustomColorButton>

          <HiddenColorInput
            ref={colorPickerRef}
            type="color"
            onChange={handleCustomColorChange}
          />
        </ColorPaletteGrid>
      </FormSection>

      {/* 4. 저장하기 버튼 */}
      <SubmitButtonContainer>
        <SubmitButton onClick={handleSave} type="button">
          저장하기
        </SubmitButton>
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
  padding: 0 ${MOBILE_PAGE_GUTTER} calc(var(--nav-height, 80px) + 50px);
  padding-bottom: 100px;

  @media ${DESKTOP_MEDIA} {
    padding: var(--header-height, 56px) 0 100px;
  }
`;

const FormSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  //margin-top: 16px;
`;

const SectionTitle = styled.h2`
  color: var(--text-secondary, #6b7684);

  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
  margin-left: 4px;
`;

const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-default, #e5e8eb);
  margin: 16px 0;
  width: 100%;
`;

const ColorPaletteGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
  justify-content: center;
`;

const ColorChipButton = styled.button<{
  $chipColor: string;
  $isSelected: boolean;
}>`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full, 999px);
  background-color: ${({ $chipColor }) => $chipColor};
  border: 2px solid
    ${({ $isSelected }) => ($isSelected ? "#3b82f6" : "transparent")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:active {
    transform: scale(0.9);
  }
`;

const CustomColorButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full, 999px);
  background-color: var(--gray-50, #f8f9fb);
  border: 1px dashed var(--gray-400, #b0b8c1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;

  &:active {
    background-color: var(--gray-100, #f1f3f5);
  }
`;

const HiddenColorInput = styled.input`
  display: none;
`;

const SubmitButtonContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px ${MOBILE_PAGE_GUTTER};

  z-index: 100;
  max-width: 768px;
  margin: 0 auto;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    position: relative;
    padding: 24px 0 0;
    background-color: transparent;
    backdrop-filter: none;
    width: 100%;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: var(--radius-2xl, 24px);
  background-color: var(--interactive-primary, #3b82f6);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    background-color: var(--interactive-primary-pressed, #0061ff);
  }
`;
