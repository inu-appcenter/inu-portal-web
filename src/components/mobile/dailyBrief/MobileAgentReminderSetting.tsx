import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import Box from "@/components/common/Box";
import Switch from "@/components/common/Switch";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Divider from "@/components/common/Divider";
import Skeleton from "@/components/common/Skeleton";
import CapsuleButton from "@/components/common/CapsuleButton";
import Icon from "@/components/common/Icon";
import { Pencil, Trash2, MessageSquarePlus } from "lucide-react";
import useAIChatStore from "@/stores/useAIChatStore";
import {
  getAgentReminders,
  toggleAgentReminder,
  updateAgentReminder,
  deleteAgentReminder,
} from "@/apis/agentReminder";
import type { AgentReminder } from "@/types/agentReminder";
import { trackEvent } from "@/utils/mixpanel";

export default function MobileAgentReminderSetting() {
  const { openAgent } = useAIChatStore();
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
      alert("알림 상태를 변경하지 못했어요. 네트워크를 확인해 주세요.");
    }
  };

  const handleStartEdit = (reminder: AgentReminder) => {
    if (editingId === reminder.id) {
      setEditingId(null);
    } else {
      setEditingId(reminder.id);
      setEditingTime(reminder.targetTime || "08:30");
    }
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
    return "⏰";
  };

  return (
    <ReminderSettingWrapper>
      <TitleContentArea
        title="AI 맞춤 알림"
        description="AI 캠퍼스 비서에게 대화로 요청한 나만의 맞춤 예약 알림들을 확인하고 관리할 수 있어요."
      >
        {isLoading ? (
          <Box style={{ width: "100%", padding: 0 }}>
            <SettingRow>
              <RowContent>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={14} />
              </RowContent>
            </SettingRow>
            <Divider margin="0" />
            <SettingRow>
              <RowContent>
                <Skeleton variant="text" width="50%" height={20} />
                <Skeleton variant="text" width="35%" height={14} />
              </RowContent>
            </SettingRow>
          </Box>
        ) : reminders.length === 0 ? (
          <Box style={{ width: "100%", padding: 0 }}>
            <EmptyBox>
              <EmptyIconBadge>🤖</EmptyIconBadge>
              <EmptyTitle>등록된 맞춤 알림이 아직 없어요</EmptyTitle>
              <EmptyDescription>
                AI 캠퍼스 비서에게 평소 필요한 알림을 자유롭게 요청해 보세요!
                <br />
                예: <i>"오전 11시에 학식 알려줘"</i>, <i>"8시 30분에 날씨 알려줘"</i>
              </EmptyDescription>
              <CapsuleButtonWrapper>
                <CapsuleButton
                  variant="primary"
                  onClick={openAgent}
                  leftIcon={<MessageSquarePlus size={17} />}
                  style={{
                    fontSize: "15px",
                    padding: "10px 22px",
                    lineHeight: "22px",
                  }}
                >
                  AI 비서에게 알림 부탁하기
                </CapsuleButton>
              </CapsuleButtonWrapper>
            </EmptyBox>
          </Box>
        ) : (
          <Box style={{ width: "100%", padding: 0 }}>
            {reminders.map((reminder, idx) => (
              <div key={reminder.id}>
                <SettingRow>
                  <RowContent>
                    <TitleRow>
                      <ToolEmojiBadge>
                        {getToolEmoji(reminder.targetTool)}
                      </ToolEmojiBadge>
                      <RowTitle $disabled={!reminder.enabled}>
                        {reminder.title}
                      </RowTitle>
                    </TitleRow>
                    <RowDescription>
                      {reminder.repeatTypeDesc} • {reminder.targetTime} 발송
                    </RowDescription>
                  </RowContent>

                  <RightControls>
                    <IconButton
                      title="시간 수정"
                      onClick={() => handleStartEdit(reminder)}
                    >
                      <Pencil size={15} color="#6B7280" />
                    </IconButton>
                    <IconButton
                      title="알림 삭제"
                      $danger
                      onClick={() => handleDelete(reminder.id, reminder.title)}
                    >
                      <Trash2 size={15} color="#EF4444" />
                    </IconButton>
                    <SwitchContainer>
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={() =>
                          handleToggle(reminder.id, reminder.enabled)
                        }
                      />
                    </SwitchContainer>
                  </RightControls>
                </SettingRow>

                {/* 인라인 시간 수정 서브 패널 */}
                {editingId === reminder.id && (
                  <SubOptionBox>
                    <SubOptionHeader>
                      <SubOptionTextWrapper>
                        <SubOptionTitle>발송 시간 변경</SubOptionTitle>
                        <SubOptionDesc>
                          알림을 수신할 시간을 설정해 주세요.
                        </SubOptionDesc>
                      </SubOptionTextWrapper>
                    </SubOptionHeader>

                    <CustomTimeRow>
                      <StyledTimeInput
                        type="time"
                        value={editingTime}
                        onChange={(e) => setEditingTime(e.target.value)}
                      />
                      <ApplyButton onClick={() => handleSaveTime(reminder.id)}>
                        적용
                      </ApplyButton>
                      <CancelButton onClick={() => setEditingId(null)}>
                        취소
                      </CancelButton>
                    </CustomTimeRow>
                  </SubOptionBox>
                )}

                {idx < reminders.length - 1 && <Divider margin="0" />}
              </div>
            ))}

            {/* 하단 새 알림 추가 버튼 (CapsuleButton) */}
            <Divider margin="0" />
            <AddActionRow>
              <CapsuleButton
                variant="brand"
                fullWidth
                onClick={openAgent}
                leftIcon={<MessageSquarePlus size={16} />}
                style={{
                  fontSize: "14.5px",
                  padding: "10px 18px",
                  lineHeight: "22px",
                  boxShadow: "none",
                }}
              >
                + AI 비서에게 새 맞춤 알림 부탁하기
              </CapsuleButton>
            </AddActionRow>
          </Box>
        )}
      </TitleContentArea>

      {/* 푸시 알림 예시 미리보기 (INTIP 표준 배너) */}
      <PreviewSectionWrapper>
        <PreviewSectionLabel>알림 예시</PreviewSectionLabel>
        <NotificationPreviewList>
          <OsNotificationBanner>
            <OsHeader>
              <OsAppIconWrapper>
                <Icon name="bell" size={10} color="#ffffff" />
              </OsAppIconWrapper>
              <OsAppName>INTIP AI 비서</OsAppName>
              <OsTimeText>11:00</OsTimeText>
            </OsHeader>
            <OsTitle>🍱 [11:00] 오늘의 점심 학식 안내</OsTitle>
            <OsBody>
              제1기숙사 식당: 치즈돈까스(5,500원) / 학생식당: 김치제육볶음
            </OsBody>
          </OsNotificationBanner>

          <OsNotificationBanner>
            <OsHeader>
              <OsAppIconWrapper>
                <Icon name="bell" size={10} color="#ffffff" />
              </OsAppIconWrapper>
              <OsAppName>INTIP AI 비서</OsAppName>
              <OsTimeText>08:30</OsTimeText>
            </OsHeader>
            <OsTitle>☀️ [08:30] 송도캠퍼스 날씨 브리핑</OsTitle>
            <OsBody>
              현재 기온 18.7℃, 미세먼지 '좋음'. 오후 3시경 소나기가 예상되니 우산을 챙기세요! ☂️
            </OsBody>
          </OsNotificationBanner>
        </NotificationPreviewList>
      </PreviewSectionWrapper>
    </ReminderSettingWrapper>
  );
}

/* --- INTIP 디자인 시스템 스타일드 컴포넌트 --- */

const ReminderSettingWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  width: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
`;

const RowContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  padding-right: 12px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToolEmojiBadge = styled.span`
  font-size: 16px;
  line-height: 1;
`;

const RowTitle = styled.div<{ $disabled?: boolean }>`
  font-size: 15.5px;
  font-weight: 600;
  color: ${({ $disabled }) => ($disabled ? "#8E8E93" : "#1C1C1E")};
`;

const RowDescription = styled.div`
  font-size: 13px;
  color: #8e8e93;
  line-height: 1.4;
  padding-left: 24px;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background-color: ${({ $danger }) => ($danger ? "#FFF1F2" : "#F4F6F8")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ $danger }) => ($danger ? "#FFE4E6" : "#E5E7EB")};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 4px;
`;

const SubOptionBox = styled.div`
  width: 100%;
  padding: 14px 20px;
  background-color: #fafbfc;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #f0f2f5;
`;

const SubOptionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const SubOptionTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SubOptionTitle = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  color: #2c3e50;
`;

const SubOptionDesc = styled.div`
  font-size: 12px;
  color: #8e8e93;
`;

const CustomTimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const StyledTimeInput = styled.input`
  width: 130px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 6px 10px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  background-color: #fff;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #5e92f0;
  }
`;

const ApplyButton = styled.button`
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background-color: #5e92f0;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const CancelButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  color: #666666;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;
  gap: 8px;
`;

const EmptyIconBadge = styled.div`
  font-size: 40px;
  margin-bottom: 4px;
`;

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1c1c1e;
`;

const EmptyDescription = styled.div`
  font-size: 13.5px;
  color: #8e8e93;
  line-height: 1.5;
  margin-top: 2px;
`;

const CapsuleButtonWrapper = styled.div`
  margin-top: 14px;
`;

const AddActionRow = styled.div`
  padding: 14px 20px;
  background-color: #ffffff;
  width: 100%;
  box-sizing: border-box;
`;

/* --- INTIP OS Notification Banner Components --- */

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

const NotificationPreviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const OsNotificationBanner = styled.div`
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

const OsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-bottom: 2px;
`;

const OsAppIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: #5e92f0;
  flex-shrink: 0;
`;

const OsAppName = styled.span`
  font-size: 11.5px;
  font-weight: 600;
  color: #4b5563;
  flex: 1;
  letter-spacing: -0.2px;
`;

const OsTimeText = styled.span`
  font-size: 11px;
  color: #9ca3af;
`;

const OsTitle = styled.div`
  font-size: 13.5px;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
  letter-spacing: -0.2px;
`;

const OsBody = styled.div`
  font-size: 12.5px;
  color: #374151;
  line-height: 1.45;
  white-space: pre-line;
  letter-spacing: -0.1px;
`;
