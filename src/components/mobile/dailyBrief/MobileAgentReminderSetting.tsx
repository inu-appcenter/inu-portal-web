import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Box from "@/components/common/Box";
import Switch from "@/components/common/Switch";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Skeleton from "@/components/common/Skeleton";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import {
  getAgentReminders,
  toggleAgentReminder,
  updateAgentReminder,
  deleteAgentReminder,
} from "@/apis/agentReminder";
import type { AgentReminder } from "@/types/agentReminder";
import { trackEvent } from "@/utils/mixpanel";

export default function MobileAgentReminderSetting() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<AgentReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTime, setEditingTime] = useState<string>("08:30");

  const fetchReminders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAgentReminders();
      if (res.data) {
        setReminders(res.data);
      }
    } catch (error) {
      console.error("AI 맞춤 알림 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleToggle = async (id: number, currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    // 낙관적 업데이트
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: nextEnabled } : r)),
    );
    try {
      await toggleAgentReminder(id, nextEnabled);
      trackEvent("[Daily Brief] AI 맞춤 알림 토글", { id, enabled: nextEnabled });
    } catch (error) {
      console.error("AI 맞춤 알림 토글 실패:", error);
      // 롤백
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: currentEnabled } : r)),
      );
      alert("알림 상태를 변경하지 못했어요.");
    }
  };

  const handleStartEdit = (reminder: AgentReminder) => {
    setEditingId(reminder.id);
    setEditingTime(reminder.targetTime || "08:30");
  };

  const handleSaveTime = async (id: number) => {
    try {
      const res = await updateAgentReminder(id, { targetTime: editingTime });
      if (res.data) {
        setReminders((prev) =>
          prev.map((r) => (r.id === id ? { ...r, targetTime: editingTime } : r)),
        );
      }
      setEditingId(null);
      trackEvent("[Daily Brief] AI 맞춤 알림 시간 수정", { id, time: editingTime });
    } catch (error) {
      console.error("알림 시간 수정 실패:", error);
      alert("시간을 수정하지 못했어요.");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`'${title}' 알림을 삭제할까요?`)) return;
    try {
      await deleteAgentReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      trackEvent("[Daily Brief] AI 맞춤 알림 삭제", { id, title });
    } catch (error) {
      console.error("알림 삭제 실패:", error);
      alert("알림을 삭제하지 못했어요.");
    }
  };

  const getToolEmoji = (toolName: string) => {
    const upper = (toolName || "").toUpperCase();
    if (upper.includes("CAFETERIA")) return "🍱";
    if (upper.includes("WEATHER")) return "☀️";
    if (upper.includes("BUS")) return "🚌";
    if (upper.includes("NOTICE")) return "📢";
    if (upper.includes("SCHEDULE")) return "📅";
    return "🔔";
  };

  return (
    <SettingWrapper>
      <TitleContentArea
        title="AI 맞춤 알림"
        description="AI 비서에게 대화로 요청한 나만의 맞춤 예약 알림들을 관리할 수 있어요."
      >
        {isLoading ? (
          <SkeletonList>
            <Skeleton variant="card" height={100} style={{ borderRadius: "16px" }} />
            <Skeleton variant="card" height={100} style={{ borderRadius: "16px" }} />
          </SkeletonList>
        ) : reminders.length === 0 ? (
          <EmptyContainer>
            <EmptyIcon>🤖</EmptyIcon>
            <EmptyTitle>등록된 맞춤 알림이 아직 없어요</EmptyTitle>
            <EmptyDesc>
              AI 캠퍼스 비서에게 평소 필요한 알림을 자유롭게 요청해 보세요!
              <br />
              예: <i>"오전 11시에 학식 알려줘"</i>, <i>"8시 30분에 날씨 알려줘"</i>
            </EmptyDesc>
            <GoAgentButton onClick={() => navigate(ROUTES.AI.ROOT)}>
              <span>AI 비서에게 알림 부탁하기</span>
              <ChevronRight size={14} color="#FFFFFF" />
            </GoAgentButton>
          </EmptyContainer>
        ) : (
          <ReminderList>
            {reminders.map((reminder) => (
              <ReminderCard key={reminder.id} $enabled={reminder.enabled}>
                <CardTopRow>
                  <CardTitleArea>
                    <EmojiBadge>{getToolEmoji(reminder.targetTool)}</EmojiBadge>
                    <TitleTextWrapper>
                      <CardTitle>{reminder.title}</CardTitle>
                      <CardSubtitle>
                        {reminder.repeatTypeDesc} • {reminder.targetTime}
                      </CardSubtitle>
                    </TitleTextWrapper>
                  </CardTitleArea>
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={() => handleToggle(reminder.id, reminder.enabled)}
                  />
                </CardTopRow>

                {editingId === reminder.id ? (
                  <EditTimeRow>
                    <TimePickerLabel>시간 변경:</TimePickerLabel>
                    <StyledTimeInput
                      type="time"
                      value={editingTime}
                      onChange={(e) => setEditingTime(e.target.value)}
                    />
                    <SmallActionButton $primary onClick={() => handleSaveTime(reminder.id)}>
                      저장
                    </SmallActionButton>
                    <SmallActionButton onClick={() => setEditingId(null)}>
                      취소
                    </SmallActionButton>
                  </EditTimeRow>
                ) : (
                  <CardBottomRow>
                    <TimeBadge>{reminder.targetTime} 발송</TimeBadge>
                    <ButtonGroup>
                      <ActionButton onClick={() => handleStartEdit(reminder)}>
                        <Pencil size={12} color="#6B7280" />
                        <span>시간 수정</span>
                      </ActionButton>
                      <ActionButton
                        $danger
                        onClick={() => handleDelete(reminder.id, reminder.title)}
                      >
                        <Trash2 size={12} color="#EF4444" />
                        <span>삭제</span>
                      </ActionButton>
                    </ButtonGroup>
                  </CardBottomRow>
                )}
              </ReminderCard>
            ))}
          </ReminderList>
        )}
      </TitleContentArea>

      {/* 대화형 수정 안내 팁 카드 */}
      <TipCard>
        <TipHeader>
          <TipIcon>💡</TipIcon>
          <TipTitle>대화로도 언제든 수정할 수 있어요</TipTitle>
        </TipHeader>
        <TipBody>
          AI 비서와의 채팅창에서 <b>"아까 학식 알림 11시 반으로 바꿔줘"</b> 또는{" "}
          <b>"날씨 알림 꺼줘"</b>라고 말씀하셔도 설정이 자동으로 연동됩니다.
        </TipBody>
      </TipCard>

      {/* 푸시 알림 예시 배너 */}
      <PreviewSectionWrapper>
        <PreviewSectionLabel>알림 수신 예시</PreviewSectionLabel>
        <BannerCard>
          <BannerHeader>
            <AppIcon>INTIP</AppIcon>
            <AppName>INTIP AI 비서</AppName>
            <BannerTime>11:00</BannerTime>
          </BannerHeader>
          <BannerTitle>🍱 오늘의 11시 학식 메뉴 배달</BannerTitle>
          <BannerBody>
            제1기숙사 식당: 치즈돈까스(5,500원) / 학생식당: 김치제육볶음이 준비되어
            있어요. 맛있는 점심 드세요!
          </BannerBody>
        </BannerCard>
      </PreviewSectionWrapper>
    </SettingWrapper>
  );
}

const SettingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const SkeletonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const ReminderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const ReminderCard = styled(Box)<{ $enabled: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  width: 100%;
  box-sizing: border-box;
  opacity: ${({ $enabled }) => ($enabled ? 1 : 0.65)};
  transition: opacity 0.2s ease;
  border: 1px solid #edf2f7;
`;

const CardTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const CardTitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const EmojiBadge = styled.div`
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: #f3f6fb;
  flex-shrink: 0;
`;

const TitleTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const CardTitle = styled.div`
  font-size: 15.5px;
  font-weight: 700;
  color: #1a202c;
  letter-spacing: -0.2px;
`;

const CardSubtitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #718096;
`;

const CardBottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
`;

const TimeBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  background-color: #eff6ff;
  padding: 4px 10px;
  border-radius: 6px;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 9px;
  border: 1px solid ${({ $danger }) => ($danger ? "#FEE2E2" : "#E5E7EB")};
  background-color: ${({ $danger }) => ($danger ? "#FEF2F2" : "#FFFFFF")};
  color: ${({ $danger }) => ($danger ? "#EF4444" : "#4B5563")};
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ $danger }) => ($danger ? "#FEE2E2" : "#F3F4F6")};
  }
`;

const EditTimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
`;

const TimePickerLabel = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: #4b5563;
`;

const StyledTimeInput = styled.input`
  font-size: 13px;
  font-weight: 600;
  padding: 5px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #1f2937;
  outline: none;

  &:focus {
    border-color: #3b82f6;
  }
`;

const SmallActionButton = styled.button<{ $primary?: boolean }>`
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background-color: ${({ $primary }) => ($primary ? "#3B82F6" : "#E5E7EB")};
  color: ${({ $primary }) => ($primary ? "#FFFFFF" : "#374151")};
`;

const EmptyContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 36px 20px;
  width: 100%;
  box-sizing: border-box;
  gap: 12px;
  background-color: #ffffff;
  border: 1px dashed #cbd5e1;
`;

const EmptyIcon = styled.div`
  font-size: 38px;
  margin-bottom: 4px;
`;

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
`;

const EmptyDesc = styled.div`
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
`;

const GoAgentButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: #ffffff;
  border: none;
  border-radius: 100px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const TipCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  width: 100%;
  box-sizing: border-box;
`;

const TipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TipIcon = styled.span`
  font-size: 14px;
`;

const TipTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #334155;
`;

const TipBody = styled.div`
  font-size: 12px;
  color: #64748b;
  line-height: 1.45;
`;

const PreviewSectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const PreviewSectionLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #8e8e93;
  margin-left: 2px;
`;

const BannerCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e9ecef;
  gap: 3px;
`;

const BannerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-bottom: 2px;
`;

const AppIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 800;
  color: white;
  width: 24px;
  height: 15px;
  border-radius: 4px;
  background-color: #5e92f0;
  flex-shrink: 0;
`;

const AppName = styled.span`
  font-size: 11.5px;
  font-weight: 600;
  color: #4b5563;
  flex: 1;
`;

const BannerTime = styled.span`
  font-size: 11px;
  color: #9ca3af;
`;

const BannerTitle = styled.div`
  font-size: 13.5px;
  font-weight: 700;
  color: #111827;
`;

const BannerBody = styled.div`
  font-size: 12.5px;
  color: #374151;
  line-height: 1.45;
`;
