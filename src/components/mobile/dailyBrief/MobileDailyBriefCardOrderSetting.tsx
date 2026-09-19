import { useState } from "react";
import styled from "styled-components";
import Box from "@/components/common/Box";
import Switch from "@/components/common/Switch";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Divider from "@/components/common/Divider";
import Icon from "@/components/common/Icon";
import Modal from "@/components/common/Modal";
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
} from "@/hooks/useDailyBriefRanking";
import { trackEvent } from "@/utils/mixpanel";

export default function MobileDailyBriefCardOrderSetting() {
  const [mode, setMode] = useState<"auto" | "custom">(getStoredBriefMode);
  const [order, setOrder] = useState<DailyBriefCardType[]>(getStoredBriefOrder);
  const [visibility, setVisibility] = useState<
    Record<DailyBriefCardType, boolean>
  >(getStoredBriefVisibility);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleModeChange = (newMode: "auto" | "custom") => {
    setMode(newMode);
    setStoredBriefMode(newMode);
    trackEvent("[Daily Brief] 카드 정렬 모드 변경", { mode: newMode });
  };

  const handleToggleVisibility = (
    card: DailyBriefCardType,
    visible: boolean,
  ) => {
    const nextVis = { ...visibility, [card]: visible };
    setVisibility(nextVis);
    setStoredBriefVisibility(nextVis);
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
    trackEvent("[Daily Brief] 카드 순서 변경", {
      card: nextOrder[index + 1],
      direction: "down",
    });
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
              <RadioCircle $selected={mode === "custom"} />
              <ModeTextCol>
                <ModeName>📌 내 취향대로 고정 순서</ModeName>
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
          <RotateCcw size={15} color="#64748B" />
          <span>초기화</span>
        </ResetIconButton>
      </SectionHeaderRow>

      {/* 개별 박스 제거, 하나의 Box 안에 Divider로 구분된 깔끔한 리스트 */}
      <Box style={{ width: "100%", padding: 0 }}>
        {order.map((cardKey, index) => {
          const meta = DAILY_BRIEF_CARD_METAS[cardKey];
          if (!meta) return null;
          const isVisible = visibility[cardKey] !== false;

          return (
            <div key={cardKey}>
              <CardRow $disabled={!isVisible}>
                {mode === "custom" && (
                  <OrderControlCol>
                    <OrderButton
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      aria-label="위로 이동"
                    >
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

                <SwitchWrapper>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={(checked) =>
                      handleToggleVisibility(cardKey, checked)
                    }
                  />
                </SwitchWrapper>
              </CardRow>
              {index < order.length - 1 && <Divider margin="0" />}
            </div>
          );
        })}
      </Box>

      {/* 초기화 확인 모달 */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="카드 설정 초기화"
        description="카드 노출 순서와 표시 설정을 모두 기본값으로 되돌릴까요?"
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
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModeSelectTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const ModeCardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ModeOptionCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background-color: ${({ $selected }) => ($selected ? "#eff6ff" : "#f8fafc")};
  border: 1.5px solid ${({ $selected }) => ($selected ? "#3b82f6" : "#e2e8f0")};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ $selected }) =>
      $selected ? "#eff6ff" : "#f1f5f9"};
  }
`;

const RadioCircle = styled.div<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  border: 2px solid ${({ $selected }) => ($selected ? "#3b82f6" : "#94a3b8")};
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  flex-shrink: 0;

  &::after {
    content: "";
    width: 9px;
    height: 9px;
    border-radius: 4.5px;
    background-color: ${({ $selected }) =>
      $selected ? "#3b82f6" : "transparent"};
  }
`;

const ModeTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ModeName = styled.span`
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
`;

const ModeDesc = styled.span`
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.45;
`;

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 4px 2px 0 2px;
  width: 100%;
  box-sizing: border-box;
`;

const SectionTitleTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const SectionMainTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.3px;
`;

const SectionSubTitle = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
  letter-spacing: -0.2px;
`;

const ResetIconButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.15s ease;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const CardRow = styled.div<{ $disabled: boolean }>`
  display: flex;
  align-items: center;
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

const SwitchWrapper = styled.div`
  flex-shrink: 0;
  margin-left: 4px;
`;
