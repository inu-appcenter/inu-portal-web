import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import CapsuleButton from "@/components/common/CapsuleButton";
import { X, Sparkles, Check, Bell, Clock, Layers } from "lucide-react";
import type { AgentReminder, AgentReminderRepeatType } from "@/types/agentReminder";
import { createAgentReminder, updateAgentReminder } from "@/apis/agentReminder";
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
    title: "캠퍼스 날씨",
    emoji: "☀️",
    description: "송도 캠퍼스 기온, 미세먼지 및 우산 챙김 알림",
    defaultPreview: "☀️ 현재 송도 18℃ 맑음 (우산 안 챙겨도 돼요)",
  },
  {
    id: "BUS",
    title: "실시간 버스",
    emoji: "🚌",
    description: "지정한 정류소의 실시간 버스 도착 예정 시간",
    defaultPreview: "🚌 [인천대입구역 1번출구] 8번(3분 뒤), 순환41번(6분 뒤)",
  },
  {
    id: "CAFETERIA",
    title: "학식 식단",
    emoji: "🍱",
    description: "선택한 교내 식당의 당일 식사 메뉴",
    defaultPreview: "🍱 [학생식당 중식] 제육볶음, 된장찌개, 계란말이",
  },
  {
    id: "TIMETABLE",
    title: "시간표 / 강의실",
    emoji: "📅",
    description: "오늘 첫 수업 시간 및 강의실 위치 안내",
    defaultPreview: "📅 [오늘 첫 수업] 10:00 자료구조 (공7호관 301호)",
  },
  {
    id: "NOTICE",
    title: "새 공지사항",
    emoji: "📢",
    description: "최신 학교 및 학과 주요 공지사항",
    defaultPreview: "📢 [공지] 2026학년도 2학기 국가장학금 신청 안내",
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

export default function RoutineBuilderModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  presetData,
}: RoutineBuilderModalProps) {
  const [title, setTitle] = useState("");
  const [targetHour, setTargetHour] = useState("08");
  const [targetMinute, setTargetMinute] = useState("30");
  const [repeatType, setRepeatType] = useState<AgentReminderRepeatType>("WEEKDAYS");
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
      setTargetHour(parts[0] || "08");
      setTargetMinute(parts[1] || "30");
      setRepeatType(initialData.repeatType || "WEEKDAYS");
      
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
      setTargetHour(parts[0] || "08");
      setTargetMinute(parts[1] || "30");
      setRepeatType(presetData.repeatType || "WEEKDAYS");
      setSelectedTools(presetData.targetTools || ["WEATHER"]);

      if (presetData.toolParams) {
        if (presetData.toolParams.cafeteria) setSelectedCafeteria(presetData.toolParams.cafeteria);
        if (presetData.toolParams.mealType) setSelectedMealType(presetData.toolParams.mealType);
        if (presetData.toolParams.stopName) setSelectedBusStop(presetData.toolParams.stopName);
      }
    } else {
      setTitle("등교 전 맞춤 브리핑");
      setTargetHour("08");
      setTargetMinute("30");
      setRepeatType("WEEKDAYS");
      setSelectedTools(["WEATHER", "BUS"]);
      setSelectedCafeteria("전체");
      setSelectedMealType("AUTO");
      setSelectedBusStop("인천대입구역 1번출구");
    }
  }, [isOpen, initialData, presetData]);

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

  // 실시간 알림 미리보기 생성
  const previewBody = useMemo(() => {
    const lines: string[] = [];
    selectedTools.forEach((toolId) => {
      const act = AVAILABLE_ACTIONS.find((a) => a.id === toolId);
      if (!act) return;

      if (toolId === "BUS") {
        lines.push(`🚌 [${selectedBusStop.replace("인천대입구역", "인입")}] 8번(3분 뒤), 순환41번(6분 뒤)`);
      } else if (toolId === "CAFETERIA") {
        const mealName = selectedMealType === "LUNCH" ? "중식" : selectedMealType === "DINNER" ? "석식" : "중식";
        lines.push(`🍱 [${selectedCafeteria} ${mealName}] 제육볶음, 된장찌개 외 3찬`);
      } else {
        lines.push(act.defaultPreview);
      }
    });
    return lines.join("\n");
  }, [selectedTools, selectedBusStop, selectedCafeteria, selectedMealType]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("루틴 이름을 입력해 주세요.");
      return;
    }
    if (selectedTools.length === 0) {
      alert("포함할 정보를 1개 이상 선택해 주세요.");
      return;
    }

    const targetTime = `${targetHour.padStart(2, "0")}:${targetMinute.padStart(2, "0")}`;
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
    const bodyTemplate = ""; // Zero-LLM 도구 포맷터 위임
    const route = selectedTools.length === 1 && selectedTools[0] === "CAFETERIA"
      ? "/home/menu"
      : selectedTools.length === 1 && selectedTools[0] === "BUS"
      ? "/home/bus"
      : "/home";

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await updateAgentReminder(initialData.id, {
          title,
          targetTime,
          repeatType,
          toolParamsJson,
          titleTemplate,
          bodyTemplate,
          route,
        });
        trackEvent("[Routine+] 루틴 수정 완료", { id: initialData.id, title, targetTime, targetTool });
      } else {
        await createAgentReminder({
          title,
          targetTime,
          repeatType,
          targetTool,
          toolParamsJson,
          titleTemplate,
          bodyTemplate,
          route,
        });
        trackEvent("[Routine+] 새 루틴 생성 완료", { title, targetTime, targetTool });
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

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <ModalHeader>
          <HeaderTitleRow>
            <Sparkles size={20} color="#2563eb" />
            <HeaderTitle>{initialData ? "캠퍼스 루틴 수정" : "새 캠퍼스 루틴 만들기"}</HeaderTitle>
          </HeaderTitleRow>
          <CloseButton onClick={onClose}>
            <X size={20} color="#64748b" />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* 루틴 이름 */}
          <SectionArea>
            <SectionLabel>루틴 이름</SectionLabel>
            <Input
              type="text"
              placeholder="예: 등교 전 올인원 브리핑"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={30}
            />
          </SectionArea>

          {/* 1단계: 언제 알릴까요? */}
          <SectionArea>
            <SectionLabel>
              <Clock size={16} color="#2563eb" />
              1. 발송 시간 및 반복 요일
            </SectionLabel>
            
            {/* 시간 선택 */}
            <TimeSelectorRow>
              <TimeSelectGroup>
                <Select
                  value={targetHour}
                  onChange={(e) => setTargetHour(e.target.value)}
                >
                  {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                    <option key={h} value={h}>
                      {parseInt(h, 10) < 12 ? `오전 ${h}시` : `오후 ${h}시`}
                    </option>
                  ))}
                </Select>
                <TimeSeparator>:</TimeSeparator>
                <Select
                  value={targetMinute}
                  onChange={(e) => setTargetMinute(e.target.value)}
                >
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                    <option key={m} value={m}>
                      {m}분
                    </option>
                  ))}
                </Select>
              </TimeSelectGroup>
            </TimeSelectorRow>

            {/* 반복 요일 칩 */}
            <RepeatChipRow>
              {[
                { type: "WEEKDAYS", label: "평일 (월~금)" },
                { type: "EVERYDAY", label: "매일 (월~일)" },
                { type: "WEEKENDS", label: "주말 (토~일)" },
                { type: "ONCE", label: "1회성" },
              ].map((chip) => (
                <RepeatChip
                  key={chip.type}
                  $active={repeatType === chip.type}
                  onClick={() => setRepeatType(chip.type as AgentReminderRepeatType)}
                >
                  {chip.label}
                </RepeatChip>
              ))}
            </RepeatChipRow>
          </SectionArea>

          {/* 2단계: 무엇을 알릴까요? (액션 선택) */}
          <SectionArea>
            <SectionLabel>
              <Layers size={16} color="#2563eb" />
              2. 포함할 정보 선택 (다중 선택 가능)
            </SectionLabel>

            <ActionGrid>
              {AVAILABLE_ACTIONS.map((action) => {
                const isSelected = selectedTools.includes(action.id);
                return (
                  <ActionCard
                    key={action.id}
                    $selected={isSelected}
                    onClick={() => toggleTool(action.id)}
                  >
                    <ActionCardHeader>
                      <ActionEmoji>{action.emoji}</ActionEmoji>
                      <ActionTitle>{action.title}</ActionTitle>
                      <CheckBadge $selected={isSelected}>
                        {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                      </CheckBadge>
                    </ActionCardHeader>
                    <ActionDesc>{action.description}</ActionDesc>

                    {/* 세부 옵션 UI (선택되었을 때만 노출) */}
                    {isSelected && action.id === "CAFETERIA" && (
                      <DetailOptionBox onClick={(e) => e.stopPropagation()}>
                        <DetailOptionRow>
                          <OptionLabel>식당:</OptionLabel>
                          <SubSelect
                            value={selectedCafeteria}
                            onChange={(e) => setSelectedCafeteria(e.target.value)}
                          >
                            {CAFETERIA_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </SubSelect>
                        </DetailOptionRow>
                        <DetailOptionRow>
                          <OptionLabel>끼니:</OptionLabel>
                          <SubSelect
                            value={selectedMealType}
                            onChange={(e) => setSelectedMealType(e.target.value)}
                          >
                            <option value="AUTO">자동 (시간대 맞춤)</option>
                            <option value="LUNCH">점심 (중식)</option>
                            <option value="DINNER">저녁 (석식)</option>
                            <option value="BREAKFAST">아침 (조식)</option>
                          </SubSelect>
                        </DetailOptionRow>
                      </DetailOptionBox>
                    )}

                    {isSelected && action.id === "BUS" && (
                      <DetailOptionBox onClick={(e) => e.stopPropagation()}>
                        <DetailOptionRow>
                          <OptionLabel>정류소:</OptionLabel>
                          <SubSelect
                            value={selectedBusStop}
                            onChange={(e) => setSelectedBusStop(e.target.value)}
                          >
                            {BUS_STOP_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </SubSelect>
                        </DetailOptionRow>
                      </DetailOptionBox>
                    )}
                  </ActionCard>
                );
              })}
            </ActionGrid>
          </SectionArea>

          {/* 3단계: 알림 미리보기 */}
          <SectionArea>
            <SectionLabel>
              <Bell size={16} color="#2563eb" />
              3. 실제 푸시 알림 미리보기
            </SectionLabel>

            <PreviewPushCard>
              <PreviewHeader>
                <AppBadgeRow>
                  <AppIcon>INTIP</AppIcon>
                  <AppName>캠퍼스 맞춤 루틴</AppName>
                </AppBadgeRow>
                <PreviewTime>{targetHour}:{targetMinute}</PreviewTime>
              </PreviewHeader>
              <PreviewTitle>🔔 {title || "AI 맞춤 알림"}</PreviewTitle>
              <PreviewContent>{previewBody || "선택된 정보가 없습니다."}</PreviewContent>
            </PreviewPushCard>
          </SectionArea>
        </ModalBody>

        {/* 모달 하단 액션 버튼 */}
        <ModalFooter>
          <CapsuleButton
            variant="secondary"
            onClick={onClose}
            style={{ flex: 1, padding: "12px 0" }}
          >
            취소
          </CapsuleButton>
          <CapsuleButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ flex: 2, padding: "12px 0", fontWeight: 700 }}
          >
            {isSubmitting ? "저장 중..." : initialData ? "루틴 수정하기" : "루틴 등록하기"}
          </CapsuleButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.6);
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
  background: #ffffff;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 640px) {
    border-radius: 24px;
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

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
`;

const HeaderTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #f1f5f9;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionLabel = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const TimeSelectorRow = styled.div`
  display: flex;
  align-items: center;
`;

const TimeSelectGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const Select = styled.select`
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  background-color: #f8fafc;
  outline: none;
  &:focus {
    border-color: #2563eb;
  }
`;

const TimeSeparator = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #64748b;
`;

const RepeatChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`;

const RepeatChip = styled.button<{ $active: boolean }>`
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${({ $active }) => ($active ? "#2563eb" : "#e2e8f0")};
  background-color: ${({ $active }) => ($active ? "#eff6ff" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#2563eb" : "#64748b")};
  transition: all 0.15s ease;
`;

const ActionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActionCard = styled.div<{ $selected: boolean }>`
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#2563eb" : "#e2e8f0")};
  background-color: ${({ $selected }) => ($selected ? "#f8faff" : "#ffffff")};
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:hover {
    border-color: ${({ $selected }) => ($selected ? "#2563eb" : "#cbd5e1")};
  }
`;

const ActionCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ActionEmoji = styled.span`
  font-size: 18px;
  margin-right: 8px;
`;

const ActionTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  flex: 1;
`;

const CheckBadge = styled.div<{ $selected: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#2563eb" : "#cbd5e1")};
  background-color: ${({ $selected }) => ($selected ? "#2563eb" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionDesc = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
  padding-left: 26px;
`;

const DetailOptionBox = styled.div`
  margin-top: 8px;
  padding: 10px 12px;
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 26px;
`;

const DetailOptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OptionLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  width: 45px;
`;

const SubSelect = styled.select`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
`;

const PreviewPushCard = styled.div`
  background: #1e293b;
  color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
`;

const AppBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AppIcon = styled.span`
  background: #2563eb;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 4px;
`;

const AppName = styled.span`
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
`;

const PreviewTime = styled.span`
  font-size: 12px;
  color: #94a3b8;
`;

const PreviewTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
`;

const PreviewContent = styled.div`
  font-size: 13px;
  line-height: 1.5;
  color: #cbd5e1;
  white-space: pre-line;
`;

const ModalFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 10px;
`;
