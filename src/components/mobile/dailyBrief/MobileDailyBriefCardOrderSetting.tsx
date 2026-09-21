import { useState, useEffect } from "react";
import styled from "styled-components";
import Box from "@/components/common/Box";
import Switch from "@/components/common/Switch";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Divider from "@/components/common/Divider";
import Icon from "@/components/common/Icon";
import Modal from "@/components/common/Modal";
import Ripple from "@/components/common/Ripple";
import { RotateCcw } from "lucide-react";
import {
  DailyBriefCardType,
  DAILY_BRIEF_CARD_METAS,
  getStoredBriefMode,
  setStoredBriefMode,
  getStoredBriefOrder,
  setStoredBriefOrder,
  getStoredBriefVisibility,
  setStoredBriefVisibility,
  getStoredBriefDetails,
  setStoredBriefDetails,
  getStoredBriefTimeRules,
  setStoredBriefTimeRules,
} from "@/hooks/useDailyBriefRanking";
import {
  getDailyBriefCardSettings,
  updateDailyBriefCardSettings,
} from "@/apis/dailyBrief";
import type {
  DailyBriefCardDetailConfig,
  DailyBriefTimeRule,
} from "@/types/dailyBrief";
import { trackEvent } from "@/utils/mixpanel";
import DailyBriefCardDetailConfigModal from "./view/DailyBriefCardDetailConfigModal";

export default function MobileDailyBriefCardOrderSetting() {
  const [mode, setMode] = useState<"auto" | "custom">(getStoredBriefMode);
  const [order, setOrder] = useState<DailyBriefCardType[]>(getStoredBriefOrder);
  const [visibility, setVisibility] = useState<
    Record<DailyBriefCardType, boolean>
  >(getStoredBriefVisibility);
  const [details, setDetails] = useState<DailyBriefCardDetailConfig>(getStoredBriefDetails);
  const [timeRules, setTimeRules] = useState<DailyBriefTimeRule[]>(getStoredBriefTimeRules);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [detailModalCard, setDetailModalCard] = useState<DailyBriefCardType | null>(null);

  // 스마트 룰 추가 모달 상태
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [ruleCard, setRuleCard] = useState<DailyBriefCardType>("bus");
  const [ruleStartTime, setRuleStartTime] = useState("08:00");
  const [ruleEndTime, setRuleEndTime] = useState("09:30");

  // 마운트 시 서버와 설정 동기화
  useEffect(() => {
    void getDailyBriefCardSettings().then((settings) => {
      setMode(settings.mode);
      setOrder(settings.order);
      setVisibility(settings.visibility);
      setDetails(settings.details);
      setTimeRules(settings.timeRules || []);
    });
  }, []);

  const handleModeChange = (newMode: "auto" | "custom") => {
    setMode(newMode);
    setStoredBriefMode(newMode);
    void updateDailyBriefCardSettings({ mode: newMode });
    trackEvent("[Daily Brief] 카드 정렬 모드 변경", { mode: newMode });
  };

  const handleToggleVisibility = (
    card: DailyBriefCardType,
    visible: boolean,
  ) => {
    const nextVis = { ...visibility, [card]: visible };
    setVisibility(nextVis);
    setStoredBriefVisibility(nextVis);
    void updateDailyBriefCardSettings({ visibility: nextVis });
    trackEvent("[Daily Brief] 카드 표시 토글", { card, visible });
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const nextOrder = [...order];
    const temp = nextOrder[index - 1];
    nextOrder[index - 1] = nextOrder[index];
    nextOrder[index] = temp;
    setOrder(nextOrder);
    setStoredBriefOrder(nextOrder);
    void updateDailyBriefCardSettings({ order: nextOrder });
    trackEvent("[Daily Brief] 카드 순서 변경", {
      card: nextOrder[index - 1],
      direction: "up",
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= order.length - 1) return;
    const nextOrder = [...order];
    const temp = nextOrder[index + 1];
    nextOrder[index + 1] = nextOrder[index];
    nextOrder[index] = temp;
    setOrder(nextOrder);
    setStoredBriefOrder(nextOrder);
    void updateDailyBriefCardSettings({ order: nextOrder });
    trackEvent("[Daily Brief] 카드 순서 변경", {
      card: nextOrder[index + 1],
      direction: "down",
    });
  };

  const handleSaveDetail = (updatedDetails: DailyBriefCardDetailConfig) => {
    setDetails(updatedDetails);
    setStoredBriefDetails(updatedDetails);
    void updateDailyBriefCardSettings({ details: updatedDetails });
    trackEvent("[Daily Brief] 카드 세부 설정 저장", { card: detailModalCard });
  };

  const handleAddRule = () => {
    const [startH, startM] = ruleStartTime.split(":").map(Number);
    const [endH, endM] = ruleEndTime.split(":").map(Number);

    const newRule: DailyBriefTimeRule = {
      id: "rule_" + Date.now(),
      startHour: isNaN(startH) ? 8 : startH,
      startMinute: isNaN(startM) ? 0 : startM,
      endHour: isNaN(endH) ? 9 : endH,
      endMinute: isNaN(endM) ? 30 : endM,
      pinCard: ruleCard,
      label: `${DAILY_BRIEF_CARD_METAS[ruleCard]?.name || ruleCard} 고정`,
    };

    const nextRules = [...timeRules, newRule];
    setTimeRules(nextRules);
    setStoredBriefTimeRules(nextRules);
    void updateDailyBriefCardSettings({ timeRules: nextRules });
    setIsAddRuleModalOpen(false);
    trackEvent("[Daily Brief] 스마트 룰 추가", { card: ruleCard });
  };

  const handleDeleteRule = (ruleId: string) => {
    const nextRules = timeRules.filter((r) => r.id !== ruleId);
    setTimeRules(nextRules);
    setStoredBriefTimeRules(nextRules);
    void updateDailyBriefCardSettings({ timeRules: nextRules });
    trackEvent("[Daily Brief] 스마트 룰 삭제", { ruleId });
  };

  const handleConfirmReset = () => {
    handleModeChange("auto");
    const defaultOrder: DailyBriefCardType[] = [
      "timetable",
      "library",
      "cafeteria",
      "bus",
      "weather",
      "notice",
      "lms",
      "fortune",
    ];
    setOrder(defaultOrder);
    setStoredBriefOrder(defaultOrder);

    const defaultVis = defaultOrder.reduce(
      (acc, c) => ({ ...acc, [c]: true }),
      {} as Record<DailyBriefCardType, boolean>,
    );
    setVisibility(defaultVis);
    setStoredBriefVisibility(defaultVis);

    const defaultDetails: DailyBriefCardDetailConfig = {
      library: { selectedRooms: ["제1열람실", "제2열람실", "제3열람실", "힐링존"] },
      cafeteria: { preferredCafeteria: "학생식당" },
      bus: { defaultType: "auto" },
    };
    setDetails(defaultDetails);
    setStoredBriefDetails(defaultDetails);

    setTimeRules([]);
    setStoredBriefTimeRules([]);

    void updateDailyBriefCardSettings({
      mode: "auto",
      order: defaultOrder,
      visibility: defaultVis,
      details: defaultDetails,
      timeRules: [],
    });

    setIsResetModalOpen(false);
    trackEvent("[Daily Brief] 카드 설정 초기화");
  };

  return (
    <SettingContainer>
      {/* 1. 정렬 방식 선택 섹션 */}
      <TitleContentArea
        title="브리핑 카드 구성"
        description="데일리 브리프 화면에 표시할 카드의 종류와 순서를 내 취향에 맞게 설정할 수 있어요."
      >
        <Box style={{ width: "100%", padding: "16px 20px" }}>
          <ModeSelectTitle>카드 노출 순서 방식</ModeSelectTitle>
          <ModeCardGrid>
            <ModeOptionCard
              $selected={mode === "auto"}
              onClick={() => handleModeChange("auto")}
            >
              <Ripple color="rgba(59, 130, 246, 0.12)" />
              <RadioCircle $selected={mode === "auto"} />
              <ModeTextCol>
                <ModeName>✨ 상황 맞춤 자동 추천</ModeName>
                <ModeDesc>
                  등하교 시간, 수업 일정, 공강 상황에 따라 가장 필요한 카드를
                  상단에 자동으로 배치해요.
                </ModeDesc>
              </ModeTextCol>
            </ModeOptionCard>

            <ModeOptionCard
              $selected={mode === "custom"}
              onClick={() => handleModeChange("custom")}
            >
              <Ripple color="rgba(59, 130, 246, 0.12)" />
              <RadioCircle $selected={mode === "custom"} />
              <ModeTextCol>
                <ModeName>직접 설정</ModeName>
                <ModeDesc>
                  내가 직접 지정한 카드 순서 그대로 고정하여 보여줘요.
                </ModeDesc>
              </ModeTextCol>
            </ModeOptionCard>
          </ModeCardGrid>
        </Box>
      </TitleContentArea>

      {/* 2. 카드 목록 및 노출 설정 섹션 */}
      <SectionHeaderRow>
        <SectionTitleTextCol>
          <SectionMainTitle>카드 목록 및 노출 설정</SectionMainTitle>
          <SectionSubTitle>
            {mode === "custom"
              ? "화살표를 눌러 카드의 노출 순서를 변경할 수 있어요."
              : "스위치를 꺼서 원치 않는 카드를 숨길 수 있어요."}
          </SectionSubTitle>
        </SectionTitleTextCol>
        <ResetIconButton
          onClick={() => setIsResetModalOpen(true)}
          title="기본 설정으로 초기화"
          aria-label="기본 설정으로 초기화"
        >
          <Ripple color="rgba(0, 0, 0, 0.08)" />
          <RotateCcw size={15} color="#64748B" />
          <span>초기화</span>
        </ResetIconButton>
      </SectionHeaderRow>

      <Box style={{ width: "100%", padding: 0, overflow: "hidden" }}>
        {order.map((cardKey, index) => {
          const meta = DAILY_BRIEF_CARD_METAS[cardKey];
          if (!meta) return null;
          const isVisible = visibility[cardKey] !== false;
          const hasDetailConfig = ["library", "cafeteria", "bus"].includes(cardKey);

          return (
            <CardItemWrapper key={cardKey}>
              <CardRow $disabled={!isVisible}>
                {mode === "custom" && (
                  <OrderControlCol>
                    <OrderButton
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      aria-label="위로 이동"
                    >
                      <Ripple color="rgba(0, 0, 0, 0.1)" />
                      <Icon
                        name="chevron-up"
                        size={13}
                        color={index === 0 ? "#cbd5e1" : "#475569"}
                      />
                    </OrderButton>
                    <OrderButton
                      disabled={index === order.length - 1}
                      onClick={() => handleMoveDown(index)}
                      aria-label="아래로 이동"
                    >
                      <Ripple color="rgba(0, 0, 0, 0.1)" />
                      <Icon
                        name="chevron-down"
                        size={13}
                        color={
                          index === order.length - 1 ? "#cbd5e1" : "#475569"
                        }
                      />
                    </OrderButton>
                  </OrderControlCol>
                )}

                <CardInfoCol>
                  <CardNameRow>
                    <CardName $disabled={!isVisible}>{meta.name}</CardName>
                    {mode === "custom" && (
                      <OrderBadge>{index + 1}번째</OrderBadge>
                    )}
                  </CardNameRow>
                  <CardDesc>{meta.description}</CardDesc>
                </CardInfoCol>

                <ActionGroup>
                  {hasDetailConfig && (
                    <DetailConfigButton
                      onClick={() => setDetailModalCard(cardKey)}
                      aria-label={`${meta.name} 세부 설정`}
                    >
                      <Ripple color="rgba(0, 0, 0, 0.08)" />
                      <Icon name="settings" size={13} color="#475569" />
                      <span>설정</span>
                    </DetailConfigButton>
                  )}
                  <SwitchWrapper data-no-ripple="true">
                    <Switch
                      checked={isVisible}
                      onCheckedChange={(checked) =>
                        handleToggleVisibility(cardKey, checked)
                      }
                    />
                  </SwitchWrapper>
                </ActionGroup>
              </CardRow>
              {index < order.length - 1 && <Divider margin="0" />}
            </CardItemWrapper>
          );
        })}
      </Box>

      {/* 3. 특정 시간대 카드 상단 고정 (스마트 룰) */}
      <SectionHeaderRow style={{ marginTop: 24 }}>
        <SectionTitleTextCol>
          <SectionMainTitle>특정 시간대 카드 상단 고정</SectionMainTitle>
          <SectionSubTitle>
            설정한 시간대에는 지정한 카드가 최상단에 자동으로 우선 노출돼요.
          </SectionSubTitle>
        </SectionTitleTextCol>
        <AddRuleButton onClick={() => setIsAddRuleModalOpen(true)}>
          <Ripple color="rgba(59, 130, 246, 0.12)" />
          <Icon name="add-plus-sm" size={14} color="#2563EB" />
          <span>규칙 추가</span>
        </AddRuleButton>
      </SectionHeaderRow>

      <Box style={{ width: "100%", padding: timeRules.length === 0 ? "24px 20px" : 0, overflow: "hidden" }}>
        {timeRules.length === 0 ? (
          <EmptyRuleWrapper>
            <EmptyRuleIcon>⏰</EmptyRuleIcon>
            <EmptyRuleTitle>등록된 시간대 고정 규칙이 없어요</EmptyRuleTitle>
            <EmptyRuleDesc>
              예: 매일 08:00 ~ 09:30 사이에 버스 카드를 무조건 최상단에 고정
            </EmptyRuleDesc>
          </EmptyRuleWrapper>
        ) : (
          timeRules.map((rule, idx) => {
            const cardMeta = DAILY_BRIEF_CARD_METAS[rule.pinCard];
            const startStr = `${String(rule.startHour).padStart(2, "0")}:${String(rule.startMinute).padStart(2, "0")}`;
            const endStr = `${String(rule.endHour).padStart(2, "0")}:${String(rule.endMinute).padStart(2, "0")}`;

            return (
              <RuleItemWrapper key={rule.id}>
                <RuleRow>
                  <RuleInfoCol>
                    <RuleTimeTag>
                      {startStr} ~ {endStr}
                    </RuleTimeTag>
                    <RuleTitle>
                      <b>{cardMeta?.name || rule.pinCard}</b> 카드 최상단 고정
                    </RuleTitle>
                  </RuleInfoCol>
                  <DeleteRuleButton
                    onClick={() => handleDeleteRule(rule.id)}
                    aria-label="규칙 삭제"
                  >
                    <Ripple color="rgba(239, 68, 68, 0.1)" />
                    <Icon name="close-md" size={14} color="#ef4444" />
                  </DeleteRuleButton>
                </RuleRow>
                {idx < timeRules.length - 1 && <Divider margin="0" />}
              </RuleItemWrapper>
            );
          })
        )}
      </Box>

      {/* 카드 세부 커스텀 모달 */}
      <DailyBriefCardDetailConfigModal
        isOpen={detailModalCard !== null}
        onClose={() => setDetailModalCard(null)}
        cardType={detailModalCard}
        currentDetails={details}
        onSave={handleSaveDetail}
      />

      {/* 시간대 스마트 룰 추가 모달 */}
      <Modal
        isOpen={isAddRuleModalOpen}
        onClose={() => setIsAddRuleModalOpen(false)}
        title="시간대 고정 규칙 추가"
        description="특정 시간대에 무조건 최상단에 띄우고 싶은 카드를 지정하세요."
        primaryButton={{
          text: "추가하기",
          variant: "brand",
          onClick: handleAddRule,
        }}
        secondaryButton={{
          text: "취소",
          variant: "secondary",
          onClick: () => setIsAddRuleModalOpen(false),
        }}
      >
        <ModalBody>
          <FormGroup>
            <FormLabel>고정할 카드</FormLabel>
            <SelectDropdown
              value={ruleCard}
              onChange={(e) => setRuleCard(e.target.value as DailyBriefCardType)}
            >
              {order.map((c) => (
                <option key={c} value={c}>
                  {DAILY_BRIEF_CARD_METAS[c]?.name || c}
                </option>
              ))}
            </SelectDropdown>
          </FormGroup>

          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <FormLabel>시작 시각</FormLabel>
              <TimeInput
                type="time"
                value={ruleStartTime}
                onChange={(e) => setRuleStartTime(e.target.value)}
              />
            </FormGroup>
            <TimeDivider>~</TimeDivider>
            <FormGroup style={{ flex: 1 }}>
              <FormLabel>종료 시각</FormLabel>
              <TimeInput
                type="time"
                value={ruleEndTime}
                onChange={(e) => setRuleEndTime(e.target.value)}
              />
            </FormGroup>
          </FormRow>
        </ModalBody>
      </Modal>

      {/* 초기화 확인 모달 */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="카드 설정 초기화"
        description="카드 노출 순서, 세부 설정 및 스마트 룰을 모두 기본값으로 되돌릴까요?"
        primaryButton={{
          text: "초기화",
          variant: "danger",
          onClick: handleConfirmReset,
        }}
        secondaryButton={{
          text: "취소",
          variant: "secondary",
          onClick: () => setIsResetModalOpen(false),
        }}
      />
    </SettingContainer>
  );
}

const SettingContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 32px;
`;

const ModeSelectTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
  letter-spacing: -0.3px;
`;

const ModeCardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const ModeOptionCard = styled.div<{ $selected: boolean }>`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#3b82f6" : "#e2e8f0")};
  background-color: ${({ $selected }) => ($selected ? "#f0f7ff" : "#ffffff")};
  cursor: pointer;
  transition: all 0.2s ease;
`;

const RadioCircle = styled.div<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? "#3b82f6" : "#cbd5e1")};
  background-color: ${({ $selected }) => ($selected ? "#3b82f6" : "#ffffff")};
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s ease;
  position: relative;

  ${({ $selected }) =>
    $selected &&
    `
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #ffffff;
      transform: translate(-50%, -50%);
    }
  `}
`;

const ModeTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
`;

const ModeName = styled.span`
  font-size: 14.5px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.2px;
`;

const ModeDesc = styled.span`
  font-size: 12.5px;
  font-weight: 400;
  color: #64748b;
  line-height: 1.4;
  letter-spacing: -0.2px;
`;

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 28px;
  margin-bottom: 12px;
  padding: 0 4px;
`;

const SectionTitleTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const SectionMainTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.3px;
`;

const SectionSubTitle = styled.span`
  font-size: 12px;
  color: #64748b;
  letter-spacing: -0.2px;
`;

const ResetIconButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

const AddRuleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
  color: #2563eb;
  position: relative;
  overflow: hidden;
`;

const CardItemWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-self: stretch;
`;

const CardRow = styled.div<{ $disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  gap: 14px;
  padding: 16px 20px;
  background-color: #ffffff;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: opacity 0.15s ease;
`;

const OrderControlCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
`;

const OrderButton = styled.button`
  position: relative;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  width: 24px;
  height: 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease;

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover:not(:disabled) {
    background: #e2e8f0;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
    border-color: #f1f5f9;
  }
`;

const CardInfoCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
`;

const CardNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CardName = styled.span<{ $disabled?: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${({ $disabled }) => ($disabled ? "#94a3b8" : "#1e293b")};
  letter-spacing: -0.2px;
`;

const OrderBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #3b82f6;
  background-color: #eff6ff;
  padding: 1px 5px;
  border-radius: 4px;
`;

const CardDesc = styled.span`
  font-size: 12.5px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const DetailConfigButton = styled.button`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f1f5f9;
  }
`;

const SwitchWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const EmptyRuleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px 0;
`;

const EmptyRuleIcon = styled.span`
  font-size: 24px;
  margin-bottom: 6px;
`;

const EmptyRuleTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 2px;
`;

const EmptyRuleDesc = styled.span`
  font-size: 12px;
  color: #94a3b8;
`;

const RuleItemWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const RuleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background-color: #ffffff;
`;

const RuleInfoCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const RuleTimeTag = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
`;

const RuleTitle = styled.span`
  font-size: 13.5px;
  color: #1e293b;
`;

const DeleteRuleButton = styled.button`
  position: relative;
  overflow: hidden;
  background: none;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fef2f2;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #475569;
`;

const SelectDropdown = styled.select`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  background: #ffffff;
  color: #1e293b;
  outline: none;

  &:focus {
    border-color: #3b82f6;
  }
`;

const TimeInput = styled.input`
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  background: #ffffff;
  color: #1e293b;
  outline: none;

  &:focus {
    border-color: #3b82f6;
  }
`;

const TimeDivider = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #94a3b8;
  margin-top: 20px;
`;
