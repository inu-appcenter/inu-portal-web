import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import Switch from "@/components/common/Switch";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Divider from "@/components/common/Divider";
import Skeleton from "@/components/common/Skeleton";
import CapsuleButton from "@/components/common/CapsuleButton";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Send,
  Clock,
} from "lucide-react";
import {
  getAgentReminders,
  toggleAgentReminder,
  deleteAgentReminder,
  testAgentReminder,
} from "@/apis/agentReminder";
import type { AgentReminder, AgentReminderRepeatType } from "@/types/agentReminder";
import RoutineBuilderModal from "@/components/mobile/routine/RoutineBuilderModal";
import { trackEvent } from "@/utils/mixpanel";

interface PresetItem {
  id: string;
  badge: string;
  title: string;
  targetTime: string;
  repeatType: AgentReminderRepeatType;
  targetTools: string[];
  toolParams?: Record<string, any>;
  description: string;
  tag: string;
}

const STARTER_PRESETS: PresetItem[] = [
  {
    id: "preset-morning",
    badge: "☀️ 🚌",
    title: "등교 전 올인원 브리핑",
    targetTime: "08:00",
    repeatType: "WEEKDAYS",
    targetTools: ["WEATHER", "BUS"],
    toolParams: { stopName: "인천대입구역 1번출구" },
    description: "송도 캠퍼스 날씨 + 인입런 버스 실시간 도착",
    tag: "인기 1위",
  },
  {
    id: "preset-lunch",
    badge: "🍱",
    title: "점심 학식 알리미",
    targetTime: "11:30",
    repeatType: "WEEKDAYS",
    targetTools: ["CAFETERIA"],
    toolParams: { cafeteria: "전체", mealType: "LUNCH" },
    description: "오늘 학생식당 & 기숙사 중식 메뉴 요약",
    tag: "점심 필수",
  },
  {
    id: "preset-leaving",
    badge: "🚌",
    title: "하교길 버스 알리미",
    targetTime: "17:30",
    repeatType: "WEEKDAYS",
    targetTools: ["BUS"],
    toolParams: { stopName: "인천대 정문" },
    description: "인천대 정문 정류소 실시간 버스 도착 정보",
    tag: "하교 추천",
  },
  {
    id: "preset-timetable",
    badge: "📅 ☀️",
    title: "오늘의 강의 & 날씨 브리핑",
    targetTime: "08:30",
    repeatType: "WEEKDAYS",
    targetTools: ["TIMETABLE", "WEATHER"],
    description: "당일 첫 수업 강의실 위치와 날씨 안내",
    tag: "새내기 추천",
  },
];

export default function LabsRoutinePage() {
  useHeader({ title: "캠퍼스 맞춤 루틴+" });

  const [reminders, setReminders] = useState<AgentReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<AgentReminder | null>(null);
  const [presetToOpen, setPresetToOpen] = useState<PresetItem | null>(null);
  const [isTestingId, setIsTestingId] = useState<number | null>(null);

  const fetchReminders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAgentReminders();
      if (res.data) {
        setReminders(res.data);
      }
    } catch (error) {
      console.error("루틴 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleToggle = async (id: number, currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: nextEnabled } : r)),
    );
    try {
      await toggleAgentReminder(id, nextEnabled);
      trackEvent("[Routine+] 루틴 토글", { id, enabled: nextEnabled });
    } catch (error) {
      console.error("루틴 토글 실패:", error);
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: currentEnabled } : r)),
      );
      alert("루틴 상태를 변경하지 못했어요.");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`'${title}' 루틴을 삭제할까요?`)) return;
    try {
      await deleteAgentReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      trackEvent("[Routine+] 루틴 삭제", { id, title });
    } catch (error) {
      console.error("루틴 삭제 실패:", error);
      alert("루틴을 삭제하지 못했어요.");
    }
  };

  const handleTestDispatch = async (id: number, title: string) => {
    setIsTestingId(id);
    try {
      await testAgentReminder(id);
      alert(`'${title}' 테스트 알림이 발송되었습니다! (잠시 후 푸시가 도착해요)`);
      trackEvent("[Routine+] 루틴 테스트 발송", { id, title });
    } catch (error) {
      console.error("테스트 발송 실패:", error);
      alert("테스트 알림 발송 중 오류가 발생했습니다.");
    } finally {
      setIsTestingId(null);
    }
  };

  const handleOpenNew = () => {
    setEditingReminder(null);
    setPresetToOpen(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reminder: AgentReminder) => {
    setEditingReminder(reminder);
    setPresetToOpen(null);
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: PresetItem) => {
    setEditingReminder(null);
    setPresetToOpen(preset);
    setIsModalOpen(true);
  };

  const getToolEmojis = (toolNames: string) => {
    if (!toolNames) return "⏰";
    const tools = toolNames.split(",").map((s) => s.trim().toUpperCase());
    const emojis = tools.map((t) => {
      if (t.includes("WEATHER")) return "☀️";
      if (t.includes("BUS")) return "🚌";
      if (t.includes("CAFETERIA")) return "🍱";
      if (t.includes("TIMETABLE")) return "📅";
      if (t.includes("NOTICE")) return "📢";
      return "⏰";
    });
    return emojis.join(" ");
  };

  return (
    <PageWrapper>
      {/* 히어로 배너 */}
      <HeroCard>
        <HeroHeader>
          <HeroTag>
            <Sparkles size={13} color="#2563eb" />
            실험실 ALPHA
          </HeroTag>
          <HeroTitle>캠퍼스 맞춤 루틴+</HeroTitle>
        </HeroHeader>
        <HeroDescription>
          갤럭시 루틴+와 아이폰 자동화처럼, 원하는 시간과 요일에 맞춤 캠퍼스 정보(날씨·학식·버스·시간표)를 단 하나의 알림으로 받아보세요.
        </HeroDescription>
        <HeroCTAButton onClick={handleOpenNew}>
          <Plus size={16} strokeWidth={2.5} />
          나만의 루틴 만들기
        </HeroCTAButton>
      </HeroCard>

      {/* 추천 프리셋 섹션 */}
      <TitleContentArea
        title="추천 스타터 프리셋"
        description="인천대 학생들이 가장 많이 찾는 대표 루틴들을 터치 한 번으로 시작해 보세요."
      >
        <PresetScrollRow>
          {STARTER_PRESETS.map((preset) => (
            <PresetCard key={preset.id} onClick={() => handleApplyPreset(preset)}>
              <PresetHeader>
                <PresetBadge>{preset.badge}</PresetBadge>
                <PresetTag>{preset.tag}</PresetTag>
              </PresetHeader>
              <PresetTitle>{preset.title}</PresetTitle>
              <PresetDesc>{preset.description}</PresetDesc>
              <PresetTimeRow>
                <Clock size={13} color="#64748b" />
                <span>{preset.repeatType === "WEEKDAYS" ? "평일" : "매일"} {preset.targetTime}</span>
              </PresetTimeRow>
            </PresetCard>
          ))}
        </PresetScrollRow>
      </TitleContentArea>

      {/* 내 루틴 목록 */}
      <TitleContentArea
        title="내가 등록한 루틴"
        description="설정된 시간에 맞춰 조건별 데이터를 Zero-LLM으로 안전하게 합성해 발송합니다."
      >
        {isLoading ? (
          <Box style={{ width: "100%", padding: 0 }}>
            <RoutineItemRow>
              <Skeleton variant="text" width="60%" height={22} />
            </RoutineItemRow>
            <Divider margin="0" />
            <RoutineItemRow>
              <Skeleton variant="text" width="50%" height={22} />
            </RoutineItemRow>
          </Box>
        ) : reminders.length === 0 ? (
          <Box style={{ width: "100%", padding: 0 }}>
            <EmptyBox>
              <EmptyEmoji>🤖</EmptyEmoji>
              <EmptyTitle>아직 등록된 루틴이 없어요</EmptyTitle>
              <EmptyDesc>
                위 추천 프리셋을 누르거나 아래 버튼으로 첫 번째 루틴을 만들어 보세요!
              </EmptyDesc>
              <CapsuleButton
                variant="primary"
                onClick={handleOpenNew}
                leftIcon={<Plus size={16} />}
                style={{ marginTop: 8 }}
              >
                첫 루틴 추가하기
              </CapsuleButton>
            </EmptyBox>
          </Box>
        ) : (
          <Box style={{ width: "100%", padding: 0 }}>
            {reminders.map((reminder, idx) => (
              <React.Fragment key={reminder.id}>
                {idx > 0 && <Divider margin="0" />}
                <RoutineItemRow>
                  <RoutineLeftContent>
                    <TitleRow>
                      <ToolEmojiBadge>{getToolEmojis(reminder.targetTool)}</ToolEmojiBadge>
                      <RoutineTitle $disabled={!reminder.enabled}>
                        {reminder.title}
                      </RoutineTitle>
                    </TitleRow>
                    <RoutineMetaRow>
                      <MetaBadge>{reminder.repeatTypeDesc}</MetaBadge>
                      <MetaTime>{reminder.targetTime} 발송</MetaTime>
                    </RoutineMetaRow>
                  </RoutineLeftContent>

                  <RoutineRightControls>
                    <IconButton
                      title="즉시 테스트 발송"
                      disabled={isTestingId === reminder.id}
                      onClick={() => handleTestDispatch(reminder.id, reminder.title)}
                    >
                      <Send size={15} color="#2563eb" />
                    </IconButton>
                    <IconButton
                      title="루틴 수정"
                      onClick={() => handleOpenEdit(reminder)}
                    >
                      <Pencil size={15} color="#64748b" />
                    </IconButton>
                    <IconButton
                      title="루틴 삭제"
                      $danger
                      onClick={() => handleDelete(reminder.id, reminder.title)}
                    >
                      <Trash2 size={15} color="#ef4444" />
                    </IconButton>
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={() => handleToggle(reminder.id, reminder.enabled)}
                    />
                  </RoutineRightControls>
                </RoutineItemRow>
              </React.Fragment>
            ))}
          </Box>
        )}
      </TitleContentArea>

      {/* 루틴 빌더 모달 */}
      <RoutineBuilderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchReminders}
        initialData={editingReminder}
        presetData={presetToOpen}
      />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 40px 16px;
`;

const HeroCard = styled.div`
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
  border: 1.5px solid #dbeafe;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
`;

const HeroHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HeroTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  background-color: #dbeafe;
  padding: 3px 8px;
  border-radius: 6px;
  width: fit-content;
`;

const HeroTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`;

const HeroDescription = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
  margin: 0;
`;

const HeroCTAButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const PresetScrollRow = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const PresetCard = styled.div`
  min-width: 200px;
  max-width: 220px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover {
    border-color: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const PresetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PresetBadge = styled.span`
  font-size: 18px;
`;

const PresetTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #ea580c;
  background-color: #ffedd5;
  padding: 2px 6px;
  border-radius: 4px;
`;

const PresetTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
`;

const PresetDesc = styled.div`
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
  height: 34px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PresetTimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-top: 4px;
`;

const RoutineItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  gap: 12px;
`;

const RoutineLeftContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToolEmojiBadge = styled.span`
  font-size: 16px;
`;

const RoutineTitle = styled.div<{ $disabled: boolean }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ $disabled }) => ($disabled ? "#94a3b8" : "#0f172a")};
`;

const RoutineMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MetaBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  background-color: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
`;

const MetaTime = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
`;

const RoutineRightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  background: none;
  border: none;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ $danger }) => ($danger ? "#fee2e2" : "#f1f5f9")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyBox = styled.div`
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
`;

const EmptyEmoji = styled.div`
  font-size: 36px;
  margin-bottom: 4px;
`;

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
`;

const EmptyDesc = styled.div`
  font-size: 13px;
  color: #64748b;
  max-width: 260px;
  line-height: 1.5;
`;
