import { useState } from "react";
import styled from "styled-components";
import Box from "@/components/common/Box";
import Switch from "@/components/common/Switch";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Icon from "@/components/common/Icon";
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

  const handleResetOrder = () => {
    if (window.confirm("카드 순서와 표시 설정을 기본값으로 초기화할까요?")) {
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
    }
  };

  return (
    <TitleContentArea
      title="브리핑 카드 구성"
      description="데일리 브리프 화면에 표시할 카드의 종류와 순서를 내 취향에 맞게 설정할 수 있어요."
    >
      <Box style={{ width: "100%", padding: "16px 20px" }}>
        {/* 모드 선택 카드 */}
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
                아래에서 내가 직접 지정한 카드 순서 그대로 고정하여 보여줘요.
              </ModeDesc>
            </ModeTextCol>
          </ModeOptionCard>
        </ModeCardGrid>
      </Box>

      {/* 카드 목록 및 순서 조정 */}
      <CardListHeaderRow>
        <ListTitle>카드 목록 및 노출 설정 ({order.length}개)</ListTitle>
        <ResetButton onClick={handleResetOrder}>기본값으로 초기화</ResetButton>
      </CardListHeaderRow>

      <Box style={{ width: "100%", padding: "8px 12px" }}>
        <CardOrderList>
          {order.map((cardKey, index) => {
            const meta = DAILY_BRIEF_CARD_METAS[cardKey];
            if (!meta) return null;
            const isVisible = visibility[cardKey] !== false;

            return (
              <CardOrderItem key={cardKey} $disabled={!isVisible}>
                {mode === "custom" && (
                  <OrderControlCol>
                    <OrderButton
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      aria-label="위로 이동"
                    >
                      <Icon
                        name="chevron-up"
                        size={15}
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
                        size={15}
                        color={
                          index === order.length - 1 ? "#cbd5e1" : "#475569"
                        }
                      />
                    </OrderButton>
                  </OrderControlCol>
                )}

                <CardInfoCol>
                  <CardNameRow>
                    <CardName>{meta.name}</CardName>
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
              </CardOrderItem>
            );
          })}
        </CardOrderList>
      </Box>
    </TitleContentArea>
  );
}

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

const CardListHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 4px 8px 4px;
`;

const ListTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  margin: 0;
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: #0f172a;
    text-decoration: underline;
  }
`;

const CardOrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardOrderItem = styled.div<{ $disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background-color: ${({ $disabled }) => ($disabled ? "#f8fafc" : "#ffffff")};
  border-radius: 14px;
  border: 1px solid ${({ $disabled }) => ($disabled ? "#f1f5f9" : "#e2e8f0")};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  transition: all 0.15s ease;
`;

const OrderControlCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OrderButton = styled.button`
  background: #f1f5f9;
  border: none;
  width: 26px;
  height: 22px;
  border-radius: 6px;
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
    opacity: 0.4;
  }
`;

const CardInfoCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

const CardNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CardName = styled.span`
  font-size: 14.5px;
  font-weight: 700;
  color: #1e293b;
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
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SwitchWrapper = styled.div`
  flex-shrink: 0;
`;
