import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  Sun,
  Bus,
  Utensils,
  Calendar,
  Bell,
  Check,
  Trash2,
} from "lucide-react";
import type { AgentReminder, AgentReminderRepeatType } from "@/types/agentReminder";
import {
  createAgentReminder,
  updateAgentReminder,
  deleteAgentReminder,
} from "@/apis/agentReminder";
import { trackEvent } from "@/utils/mixpanel";

interface RoutineBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AgentReminder | null;
  presetData?: {
    title: string;
    targetTime: string;
    repeatType: AgentReminderRepeatType;
    targetTools: string[];
    toolParams?: Record<string, any>;
  } | null;
}

const AVAILABLE_ACTIONS = [
  {
    id: "WEATHER",
    title: "캠퍼스 날씨 & 우산 알리미",
    description: "송도 캠퍼스 기온, 미세먼지 및 날씨 브리핑",
    icon: <Sun size={20} color="var(--text-inverse)" />,
    iconBg: "rgb(92, 156, 248)",
  },
  {
    id: "BUS",
    title: "실시간 버스 도착 정보 안내",
    description: "지정한 정류소의 실시간 버스 도착 시간을 안내해요",
    icon: <Bus size={20} color="var(--text-inverse)" />,
    iconBg: "rgb(255, 122, 0)",
  },
  {
    id: "CAFETERIA",
    title: "오늘의 학식 식단 브리핑",
    description: "선택한 교내 식당의 당일 식사 메뉴를 안내해요",
    icon: <Utensils size={20} color="var(--text-inverse)" />,
    iconBg: "rgb(34, 197, 94)",
  },
  {
    id: "TIMETABLE",
    title: "당일 시간표 & 강의실 브리핑",
    description: "오늘 수업 목록과 첫 강의실 위치를 요약 안내해요",
    icon: <Calendar size={20} color="var(--text-inverse)" />,
    iconBg: "rgb(168, 85, 247)",
  },
  {
    id: "NOTICE",
    title: "새 공지사항 감지 알림",
    description: "최신 학교 및 학과 주요 공지사항을 알려드려요",
    icon: <Bell size={20} color="var(--text-inverse)" />,
    iconBg: "rgb(59, 130, 246)",
  },
];

const CAFETERIA_OPTIONS = [
  { label: "전체 식당", value: "전체" },
  { label: "학생식당", value: "학생식당" },
  { label: "제1기숙사식당", value: "제1기숙사식당" },
  { label: "2기숙사 식당", value: "2기숙사 식당" },
  { label: "27호관식당", value: "27호관식당" },
  { label: "2호관(교직원)식당", value: "2호관(교직원)식당" },
  { label: "사범대식당", value: "사범대식당" },
];

const BUS_STOP_OPTIONS = [
  { label: "인천대입구역 1번출구 (인입런)", value: "인천대입구역 1번출구" },
  { label: "인천대입구역 2번출구", value: "인천대입구역 2번출구" },
  { label: "인천대학교 정문", value: "인천대 정문" },
  { label: "공과대학 (정문 방향)", value: "공과대학" },
  { label: "자연과학대학", value: "자연과학대학" },
  { label: "기숙사 (식당 앞)", value: "기숙사" },
];

const DAYS = [
  { key: "SUN", label: "일" },
  { key: "MON", label: "월" },
  { key: "TUE", label: "화" },
  { key: "WED", label: "수" },
  { key: "THU", label: "목" },
  { key: "FRI", label: "금" },
  { key: "SAT", label: "토" },
];

export default function RoutineBuilderModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  presetData,
}: RoutineBuilderModalProps) {
  const [title, setTitle] = useState("");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [targetHour, setTargetHour] = useState("08");
  const [targetMinute, setTargetMinute] = useState("30");
  const [repeatType, setRepeatType] = useState<AgentReminderRepeatType>("WEEKDAYS");
  const [selectedDays, setSelectedDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI"]);
  const [selectedTools, setSelectedTools] = useState<string[]>(["WEATHER"]);

  // 세부 옵션
  const [selectedCafeteria, setSelectedCafeteria] = useState("전체");
  const [selectedMealType, setSelectedMealType] = useState("AUTO");
  const [selectedBusStop, setSelectedBusStop] = useState("인천대입구역 1번출구");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 초기화
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setTitle(initialData.title);
      const parts = (initialData.targetTime || "08:30").split(":");
      const rawHour = parseInt(parts[0] || "8", 10);
      const rawMin = parts[1] || "30";

      if (rawHour >= 12) {
        setAmpm("PM");
        setTargetHour(String(rawHour === 12 ? 12 : rawHour - 12).padStart(2, "0"));
      } else {
        setAmpm("AM");
        setTargetHour(String(rawHour === 0 ? 12 : rawHour).padStart(2, "0"));
      }
      setTargetMinute(rawMin);
      setRepeatType(initialData.repeatType || "WEEKDAYS");

      if (initialData.repeatType === "WEEKDAYS") {
        setSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);
      } else if (initialData.repeatType === "EVERYDAY") {
        setSelectedDays(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]);
      } else if (initialData.repeatType === "WEEKENDS") {
        setSelectedDays(["SUN", "SAT"]);
      }

      const tools = (initialData.targetTool || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setSelectedTools(tools.length > 0 ? tools : ["WEATHER"]);

      if (initialData.toolParamsJson) {
        try {
          const parsed = JSON.parse(initialData.toolParamsJson);
          if (parsed.cafeteria) setSelectedCafeteria(parsed.cafeteria);
          if (parsed.mealType) setSelectedMealType(parsed.mealType);
          if (parsed.stopName) setSelectedBusStop(parsed.stopName);
        } catch (ignored) {}
      }
    } else if (presetData) {
      setTitle(presetData.title);
      const parts = (presetData.targetTime || "08:30").split(":");
      const rawHour = parseInt(parts[0] || "8", 10);
      const rawMin = parts[1] || "30";

      if (rawHour >= 12) {
        setAmpm("PM");
        setTargetHour(String(rawHour === 12 ? 12 : rawHour - 12).padStart(2, "0"));
      } else {
        setAmpm("AM");
        setTargetHour(String(rawHour === 0 ? 12 : rawHour).padStart(2, "0"));
      }
      setTargetMinute(rawMin);
      setRepeatType(presetData.repeatType || "WEEKDAYS");
      setSelectedTools(presetData.targetTools || ["WEATHER"]);

      if (presetData.repeatType === "WEEKDAYS") {
        setSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);
      } else if (presetData.repeatType === "EVERYDAY") {
        setSelectedDays(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]);
      }

      if (presetData.toolParams) {
        if (presetData.toolParams.cafeteria) setSelectedCafeteria(presetData.toolParams.cafeteria);
        if (presetData.toolParams.mealType) setSelectedMealType(presetData.toolParams.mealType);
        if (presetData.toolParams.stopName) setSelectedBusStop(presetData.toolParams.stopName);
      }
    } else {
      setTitle("등교 전 맞춤 브리핑");
      setAmpm("AM");
      setTargetHour("08");
      setTargetMinute("30");
      setRepeatType("WEEKDAYS");
      setSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);
      setSelectedTools(["WEATHER", "BUS"]);
      setSelectedCafeteria("전체");
      setSelectedMealType("AUTO");
      setSelectedBusStop("인천대입구역 1번출구");
    }
  }, [isOpen, initialData, presetData]);

  const toggleDay = (dayKey: string) => {
    setSelectedDays((prev) => {
      let next: string[];
      if (prev.includes(dayKey)) {
        if (prev.length === 1) return prev;
        next = prev.filter((d) => d !== dayKey);
      } else {
        next = [...prev, dayKey];
      }

      // 동기화 repeatType
      if (next.length === 7) {
        setRepeatType("EVERYDAY");
      } else if (
        next.length === 5 &&
        ["MON", "TUE", "WED", "THU", "FRI"].every((d) => next.includes(d))
      ) {
        setRepeatType("WEEKDAYS");
      } else if (
        next.length === 2 &&
        ["SUN", "SAT"].every((d) => next.includes(d))
      ) {
        setRepeatType("WEEKENDS");
      } else {
        setRepeatType("WEEKDAYS");
      }
      return next;
    });
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) => {
      if (prev.includes(toolId)) {
        if (prev.length === 1) {
          alert("최소 1개 이상의 정보를 선택해야 해요.");
          return prev;
        }
        return prev.filter((id) => id !== toolId);
      } else {
        return [...prev, toolId];
      }
    });
  };

  // 실시간 알림 메시지 예시
  const previewNotification = useMemo(() => {
    const lines: string[] = [];
    if (selectedTools.includes("WEATHER")) {
      lines.push("• 송도 캠퍼스 날씨: 현재 18.7℃ 맑음 (우산 안 챙겨도 돼요)");
    }
    if (selectedTools.includes("BUS")) {
      lines.push(`• [${selectedBusStop.replace("인천대입구역", "인입")}] 8번(3분 뒤), 순환41번(6분 뒤) 도착 예정`);
    }
    if (selectedTools.includes("CAFETERIA")) {
      const meal = selectedMealType === "DINNER" ? "석식" : "중식";
      lines.push(`• [${selectedCafeteria} ${meal}] 김치제육볶음, 된장찌개, 계란말이`);
    }
    if (selectedTools.includes("TIMETABLE")) {
      lines.push("• 오늘 첫 수업: 10:00 운영체제 (공7호관 301호)");
    }
    if (selectedTools.includes("NOTICE")) {
      lines.push("• [주요 공지] 2026학년도 2학기 국가장학금 2차 신청 안내");
    }

    return {
      title: `🔔 ${title || "캠퍼스 맞춤 루틴"}`,
      body: lines.length > 0 ? lines.join("\n") : "선택한 동작들이 조건에 맞춰 순서대로 실행돼요.",
    };
  }, [selectedTools, selectedBusStop, selectedCafeteria, selectedMealType, title]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("루틴 이름을 입력해 주세요.");
      return;
    }
    if (selectedTools.length === 0) {
      alert("포함할 정보를 1개 이상 선택해 주세요.");
      return;
    }

    let h = parseInt(targetHour, 10);
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    const finalTime = `${String(h).padStart(2, "0")}:${targetMinute.padStart(2, "0")}`;
    const targetTool = selectedTools.join(",");

    const toolParams: Record<string, any> = {};
    if (selectedTools.includes("CAFETERIA")) {
      toolParams.cafeteria = selectedCafeteria;
      toolParams.mealType = selectedMealType;
    }
    if (selectedTools.includes("BUS")) {
      toolParams.stopName = selectedBusStop;
    }

    const toolParamsJson = JSON.stringify(toolParams);
    const titleTemplate = `🔔 ${title}`;
    const bodyTemplate = "";
    const route =
      selectedTools.length === 1 && selectedTools[0] === "CAFETERIA"
        ? "/home/menu"
        : selectedTools.length === 1 && selectedTools[0] === "BUS"
        ? "/home/bus"
        : "/home";

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await updateAgentReminder(initialData.id, {
          title,
          targetTime: finalTime,
          repeatType,
          toolParamsJson,
          titleTemplate,
          bodyTemplate,
          route,
        });
        trackEvent("[Routine+] 루틴 수정 완료", {
          id: initialData.id,
          title,
          targetTime: finalTime,
          targetTool,
        });
      } else {
        await createAgentReminder({
          title,
          targetTime: finalTime,
          repeatType,
          targetTool,
          toolParamsJson,
          titleTemplate,
          bodyTemplate,
          route,
        });
        trackEvent("[Routine+] 새 루틴 생성 완료", {
          title,
          targetTime: finalTime,
          targetTool,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("루틴 저장 실패:", error);
      alert("루틴을 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!window.confirm(`'${title}' 루틴을 삭제할까요?`)) return;
    try {
      await deleteAgentReminder(initialData.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("루틴 삭제 실패:", error);
      alert("루틴을 삭제하지 못했어요.");
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 원UI 스타일 상단 바 */}
        <ModalTopNav>
          <NavButton onClick={onClose}>취소</NavButton>
          <NavTitle>{initialData ? "루틴 수정" : "새 루틴 만들기"}</NavTitle>
          <NavSaveButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "저장 중" : "저장"}
          </NavSaveButton>
        </ModalTopNav>

        <ModalBody>
          {/* 1. 루틴 이름 카드 */}
          <OneUiCard>
            <CardHeaderLabel>루틴 이름</CardHeaderLabel>
            <TitleInput
              type="text"
              placeholder="예: 등교 전 캠퍼스 맞춤 브리핑"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={30}
            />
          </OneUiCard>

          {/* 2. 언제 실행할까요? 섹션 */}
          <SectionHeader>언제 실행할까요?</SectionHeader>
          <OneUiCard>
            <CardHeaderLabel>실행 시간 및 반복 요일</CardHeaderLabel>
            <TimeSelectorContainer>
              {/* 오전 / 오후 토글 */}
              <AmPmToggleGroup>
                <AmPmBtn
                  $active={ampm === "AM"}
                  onClick={() => setAmpm("AM")}
                  type="button"
                >
                  오전
                </AmPmBtn>
                <AmPmBtn
                  $active={ampm === "PM"}
                  onClick={() => setAmpm("PM")}
                  type="button"
                >
                  오후
                </AmPmBtn>
              </AmPmToggleGroup>

              {/* 시 / 분 셀렉터 */}
              <TimeSelectsRow>
                <StyledSelect
                  value={targetHour}
                  onChange={(e) => setTargetHour(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                    <option key={h} value={h}>
                      {h}시
                    </option>
                  ))}
                </StyledSelect>
                <TimeColon>:</TimeColon>
                <StyledSelect
                  value={targetMinute}
                  onChange={(e) => setTargetMinute(e.target.value)}
                >
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                    <option key={m} value={m}>
                      {m}분
                    </option>
                  ))}
                </StyledSelect>
              </TimeSelectsRow>
            </TimeSelectorContainer>

            {/* 반복 요일 (갤럭시 원형 요일 선택기) */}
            <RepeatDaysWrapper>
              <CardSubLabel>반복 요일</CardSubLabel>
              <DaysCircleRow>
                {DAYS.map((d) => {
                  const isSelected = selectedDays.includes(d.key);
                  return (
                    <DayCircleButton
                      key={d.key}
                      $selected={isSelected}
                      $isSunday={d.key === "SUN"}
                      $isSaturday={d.key === "SAT"}
                      onClick={() => toggleDay(d.key)}
                      type="button"
                    >
                      {d.label}
                    </DayCircleButton>
                  );
                })}
              </DaysCircleRow>
            </RepeatDaysWrapper>
          </OneUiCard>

          {/* 3. 무엇을 할까요? 섹션 */}
          <SectionHeader>무엇을 할까요?</SectionHeader>
          <OneUiCard style={{ padding: "8px 0" }}>
            {AVAILABLE_ACTIONS.map((action, idx) => {
              const isSelected = selectedTools.includes(action.id);
              return (
                <React.Fragment key={action.id}>
                  {idx > 0 && <ActionDivider />}
                  <ActionItemRow onClick={() => toggleTool(action.id)}>
                    <ActionIconBadge $bgColor={action.iconBg}>
                      {action.icon}
                    </ActionIconBadge>

                    <ActionTextCol>
                      <ActionTitle>{action.title}</ActionTitle>
                      <ActionDesc>{action.description}</ActionDesc>

                      {/* 세부 옵션 */}
                      {isSelected && action.id === "CAFETERIA" && (
                        <SubOptionContainer onClick={(e) => e.stopPropagation()}>
                          <SubOptionRow>
                            <span>식당:</span>
                            <SubOptionSelect
                              value={selectedCafeteria}
                              onChange={(e) => setSelectedCafeteria(e.target.value)}
                            >
                              {CAFETERIA_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </SubOptionSelect>
                          </SubOptionRow>
                          <SubOptionRow>
                            <span>끼니:</span>
                            <SubOptionSelect
                              value={selectedMealType}
                              onChange={(e) => setSelectedMealType(e.target.value)}
                            >
                              <option value="AUTO">자동 (시간대 맞춤)</option>
                              <option value="LUNCH">점심 (중식)</option>
                              <option value="DINNER">저녁 (석식)</option>
                              <option value="BREAKFAST">아침 (조식)</option>
                            </SubOptionSelect>
                          </SubOptionRow>
                        </SubOptionContainer>
                      )}

                      {isSelected && action.id === "BUS" && (
                        <SubOptionContainer onClick={(e) => e.stopPropagation()}>
                          <SubOptionRow>
                            <span>정류소:</span>
                            <SubOptionSelect
                              value={selectedBusStop}
                              onChange={(e) => setSelectedBusStop(e.target.value)}
                            >
                              {BUS_STOP_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </SubOptionSelect>
                          </SubOptionRow>
                        </SubOptionContainer>
                      )}
                    </ActionTextCol>

                    <OneUiCheckbox $checked={isSelected}>
                      {isSelected && <Check size={14} color="var(--text-inverse)" strokeWidth={3} />}
                    </OneUiCheckbox>
                  </ActionItemRow>
                </React.Fragment>
              );
            })}
          </OneUiCard>

          {/* 4. 동작 미리보기 */}
          <SectionHeader>동작 미리보기</SectionHeader>
          <NotificationPreviewCard>
            <NotificationHeader>
              <AppBadge>INTIP</AppBadge>
              <AppName>캠퍼스 루틴</AppName>
              <NotifTime>{ampm === "AM" ? `오전 ${targetHour}:${targetMinute}` : `오후 ${targetHour}:${targetMinute}`}</NotifTime>
            </NotificationHeader>
            <NotificationTitle>{previewNotification.title}</NotificationTitle>
            <NotificationBody>{previewNotification.body}</NotificationBody>
          </NotificationPreviewCard>

          {/* 삭제 버튼 (수정 모드일 때만 표시) */}
          {initialData && (
            <DeleteRoutineButton onClick={handleDelete} type="button">
              <Trash2 size={16} color="var(--text-error)" />
              <span>이 루틴 삭제</span>
            </DeleteRoutineButton>
          )}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
}

/* =========================================================================
 * Samsung One UI 모달 스타일
 * ========================================================================= */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
    padding: 20px;
  }
`;

const ModalContainer = styled.div`
  background: var(--bg-subtle);
  width: 100%;
  max-width: 520px;
  max-height: 92vh;
  border-radius: 28px 28px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 640px) {
    border-radius: 28px;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const ModalTopNav = styled.div`
  background: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-default);
`;

const NavTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  padding: 4px 6px;
`;

const NavSaveButton = styled.button`
  background: none;
  border: none;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--text-brand);
  cursor: pointer;
  padding: 4px 6px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalBody = styled.div`
  padding: 20px 16px 36px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionHeader = styled.h4`
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 8px 0 0 4px;
  letter-spacing: -0.3px;
`;

const OneUiCard = styled.div`
  background: var(--bg-base);
  border-radius: 22px;
  border: 1px solid var(--border-default);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
`;

const CardHeaderLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-600);
`;

const CardSubLabel = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: var(--gray-600);
`;

const TitleInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1.5px solid var(--border-default);
  border-radius: 14px;
  font-size: 15.5px;
  font-weight: 600;
  color: var(--text-primary);
  outline: none;
  background-color: var(--bg-subtle);
  transition: all 0.15s ease;

  &:focus {
    border-color: var(--border-brand);
    background-color: var(--bg-base);
  }
`;

const TimeSelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AmPmToggleGroup = styled.div`
  display: flex;
  background-color: var(--bg-muted);
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
`;

const AmPmBtn = styled.button<{ $active: boolean }>`
  border: none;
  background-color: ${({ $active }) => ($active ? "var(--bg-base)" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--text-brand)" : "var(--gray-600)")};
  font-size: 13.5px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? "0 2px 6px rgba(0,0,0,0.06)" : "none")};
  transition: all 0.15s ease;
`;

const TimeSelectsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
`;

const StyledSelect = styled.select`
  flex: 1;
  padding: 9px 12px;
  border: 1.5px solid var(--border-default);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  background-color: var(--bg-subtle);
  outline: none;
`;

const TimeColon = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: var(--text-tertiary);
`;

const RepeatDaysWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
`;

const DaysCircleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
`;

const DayCircleButton = styled.button<{
  $selected: boolean;
  $isSunday?: boolean;
  $isSaturday?: boolean;
}>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  background-color: ${({ $selected }) => ($selected ? "var(--interactive-primary)" : "var(--bg-muted)")};
  color: ${({ $selected, $isSunday, $isSaturday }) =>
    $selected
      ? "var(--text-inverse)"
      : $isSunday
      ? "var(--text-error)"
      : $isSaturday
      ? "var(--interactive-primary)"
      : "var(--gray-700)"};
`;

const ActionItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px 18px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--bg-subtle);
  }
`;

const ActionDivider = styled.div`
  height: 1px;
  background-color: var(--bg-muted);
  margin-left: 68px;
`;

const ActionIconBadge = styled.div<{ $bgColor: string }>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
`;

const ActionTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
`;

const ActionTitle = styled.div`
  font-size: 15.5px;
  font-weight: 700;
  color: var(--text-primary);
`;

const ActionDesc = styled.div`
  font-size: 12.5px;
  color: var(--gray-600);
  line-height: 1.4;
`;

const OneUiCheckbox = styled.div<{ $checked: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1.5px solid ${({ $checked }) => ($checked ? "var(--border-brand)" : "var(--border-strong)")};
  background-color: ${({ $checked }) => ($checked ? "var(--interactive-primary)" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  flex-shrink: 0;
  transition: all 0.15s ease;
`;

const SubOptionContainer = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background-color: var(--bg-subtle);
  border-radius: 12px;
  border: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SubOptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 12px;
    font-weight: 600;
    color: var(--gray-700);
    width: 40px;
  }
`;

const SubOptionSelect = styled.select`
  flex: 1;
  padding: 5px 8px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  font-size: 12.5px;
  color: var(--text-primary);
  background-color: var(--bg-base);
  outline: none;
`;

const NotificationPreviewCard = styled.div`
  background: var(--bg-base);
  border-radius: 22px;
  border: 1px solid var(--border-default);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AppBadge = styled.span`
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
  font-size: 10px;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 4px;
  letter-spacing: 0.2px;
`;

const AppName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600);
  flex: 1;
`;

const NotifTime = styled.span`
  font-size: 11.5px;
  color: var(--text-tertiary);
`;

const NotificationTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.35;
`;

const NotificationBody = styled.div`
  font-size: 12.5px;
  color: var(--gray-700);
  line-height: 1.5;
  white-space: pre-line;
`;

const DeleteRoutineButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: var(--bg-error);
  color: var(--text-error);
  border: none;
  border-radius: 16px;
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgb(254, 202, 202);
  }
`;
