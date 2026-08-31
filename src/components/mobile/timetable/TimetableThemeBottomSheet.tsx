import { useState, useEffect } from "react";
import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import CapsuleButton from "@/components/common/CapsuleButton";
import { useTimetableStore, TimetableTheme } from "@/stores/useTimetableStore";
import Icon from "@/components/common/Icon";
import { mixpanelTrack } from "@/utils/mixpanel";

export const THEME_PALETTES = {
  default: [
    "#ffa6a6",
    "#ffcb94",
    "#ffe589",
    "#8ce99a",
    "#79dddf",
    "#94cdfa",
    "#acbcfd",
    "#c1acfc",
    "#e9adf7",
    "#8fa8d9",
  ],
  pastelWarm: [
    "#ffd9d9",
    "#ffe6cc",
    "#fff4cc",
    "#f0ebcf",
    "#f5dcc9",
    "#f2d9d0",
    "#f5dce0",
    "#f2d9ee",
    "#ebdce6",
    "#e4e0d8",
  ],
  pastelCool: [
    "#d6e4fa",
    "#d0e7f7",
    "#ccecf2",
    "#ccf0ea",
    "#cff0e0",
    "#d5f0d5",
    "#ddd9f5",
    "#d9def7",
    "#e0dcf2",
    "#e8e4f5",
  ],
  monotone: [
    "#2e2e2e",
    "#454545",
    "#5c5c5c",
    "#737373",
    "#7a7a7a",
    "#a1a1a1",
    "#b8b8b8",
    "#cfcfcf",
    "#e0e0e0",
    "#ededed",
  ],
};

interface TimetableThemeBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetableId: number;
}

const DEFAULT_THEME_CONFIG: TimetableTheme = {
  colorTheme: "default",
  fontSize: "medium",
  showRoom: true,
  showProfessor: false,
};

export default function TimetableThemeBottomSheet({
  open,
  onOpenChange,
  timetableId,
}: TimetableThemeBottomSheetProps) {
  const { timetables, updateTimetableTheme } = useTimetableStore();

  const targetTimetable = timetables.find((t) => t.id === timetableId);
  const currentTheme = targetTimetable?.theme || DEFAULT_THEME_CONFIG;

  const [selectedColor, setSelectedColor] = useState<
    TimetableTheme["colorTheme"]
  >(currentTheme.colorTheme);
  const [selectedFontSize, setSelectedFontSize] = useState<
    TimetableTheme["fontSize"]
  >(currentTheme.fontSize);
  const [showRoom, setShowRoom] = useState(currentTheme.showRoom);
  const [showProfessor, setShowProfessor] = useState(
    currentTheme.showProfessor,
  );

  useEffect(() => {
    if (open) {
      setSelectedColor(currentTheme.colorTheme);
      setSelectedFontSize(currentTheme.fontSize);
      setShowRoom(currentTheme.showRoom);
      setShowProfessor(currentTheme.showProfessor);
    }
  }, [
    open,
    currentTheme.colorTheme,
    currentTheme.fontSize,
    currentTheme.showRoom,
    currentTheme.showProfessor,
  ]);

  const handleSave = () => {
    const updatedTheme: TimetableTheme = {
      colorTheme: selectedColor,
      fontSize: selectedFontSize,
      showRoom,
      showProfessor,
    };
    updateTimetableTheme(timetableId, updatedTheme);
    mixpanelTrack.timetableActionCompleted("테마 변경", {
      color_theme: updatedTheme.colorTheme,
      font_size: updatedTheme.fontSize,
      show_room: updatedTheme.showRoom,
      show_professor: updatedTheme.showProfessor,
    });
    onOpenChange(false);
  };

  const themesList = [
    { key: "default", name: "기본" },
    { key: "pastelWarm", name: "파스텔웜" },
    { key: "pastelCool", name: "파스텔쿨" },
    { key: "monotone", name: "모노톤" },
  ] as const;

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <SheetContainer>
        <Section>
          <ScrollWrapper>
            <ThemeCardsScroll>
              {themesList.map((theme) => {
                const isSelected = selectedColor === theme.key;
                const palette = THEME_PALETTES[theme.key];
                return (
                  <ThemeCard
                    key={theme.key}
                    onClick={() => setSelectedColor(theme.key)}
                  >
                    <SwatchGrid $isSelected={isSelected}>
                      <SwatchBlock
                        style={{
                          backgroundColor: palette[0],
                          gridColumn: 1,
                          gridRow: "1 / span 2",
                        }}
                      />
                      <SwatchBlock
                        style={{
                          backgroundColor: palette[2],
                          gridColumn: 2,
                          gridRow: 1,
                        }}
                      />
                      <SwatchBlock
                        style={{
                          backgroundColor: palette[5],
                          gridColumn: 3,
                          gridRow: 1,
                        }}
                      />
                      <SwatchBlock
                        style={{
                          backgroundColor: palette[7],
                          gridColumn: 4,
                          gridRow: 1,
                        }}
                      />
                      <SwatchBlock
                        style={{
                          backgroundColor: palette[3],
                          gridColumn: 2,
                          gridRow: 2,
                        }}
                      />
                      <SwatchBlock
                        style={{
                          backgroundColor: palette[6],
                          gridColumn: 3,
                          gridRow: "2 / span 2",
                        }}
                      />
                      <SwatchBlock
                        style={{
                          backgroundColor: palette[8],
                          gridColumn: 4,
                          gridRow: 2,
                        }}
                      />
                      <SwatchBlock
                        style={{
                          backgroundColor: palette[1],
                          gridColumn: 1,
                          gridRow: 3,
                        }}
                      />
                      <SwatchBlock
                        style={{
                          backgroundColor: palette[4],
                          gridColumn: 2,
                          gridRow: 3,
                        }}
                      />
                      <SwatchBlock
                        style={{
                          backgroundColor: palette[9],
                          gridColumn: 4,
                          gridRow: 3,
                        }}
                      />
                    </SwatchGrid>
                    <ThemeLabel $isSelected={isSelected}>
                      {theme.name}
                    </ThemeLabel>
                  </ThemeCard>
                );
              })}
            </ThemeCardsScroll>
            <RightGradientOverlay />
          </ScrollWrapper>
        </Section>

        <Section>
          <Row>
            <SectionTitle>글씨 크기</SectionTitle>
            <SegmentedControl>
              {(["small", "medium", "large"] as const).map((size) => {
                const label =
                  size === "small"
                    ? "작게"
                    : size === "medium"
                      ? "보통"
                      : "크게";
                const isSelected = selectedFontSize === size;
                return (
                  <SegmentButton
                    key={size}
                    $isSelected={isSelected}
                    onClick={() => setSelectedFontSize(size)}
                  >
                    {label}
                  </SegmentButton>
                );
              })}
            </SegmentedControl>
          </Row>
        </Section>

        <Section>
          <Row>
            <SectionTitle>보여질 수업 정보</SectionTitle>
            <CheckboxGroup>
              <CheckboxLabel onClick={() => setShowRoom(!showRoom)}>
                <SelectionControl $selected={showRoom}>
                  {showRoom && (
                    <Icon name="check" size={14} color="#ffffff" />
                  )}
                </SelectionControl>
                <CheckboxText>강의실</CheckboxText>
              </CheckboxLabel>

              <CheckboxLabel onClick={() => setShowProfessor(!showProfessor)}>
                <SelectionControl $selected={showProfessor}>
                  {showProfessor && (
                    <Icon name="check" size={14} color="#ffffff" />
                  )}
                </SelectionControl>
                <CheckboxText>교수명</CheckboxText>
              </CheckboxLabel>
            </CheckboxGroup>
          </Row>
        </Section>

        <BottomCta>
          <CapsuleButton variant="primary" fullWidth onClick={handleSave}>
            저장하기
          </CapsuleButton>
        </BottomCta>
      </SheetContainer>
    </BottomSheet>
  );
}

// --- Styles ---
const SheetContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0px 0px 0px;
  background-color: var(--bg-base, #ffffff);
  box-sizing: border-box;
  width: 100%;
  gap: 16px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const SectionTitle = styled.h3`
  color: var(--text-primary, #191f28);

  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  margin: 0;
  text-align: left;
`;

const ScrollWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const RightGradientOverlay = styled.div`
  position: absolute;
  top: -4px;
  right: -20px;
  width: 60px;
  height: calc(100% + 8px);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 21.31%, #fff 100%);
  z-index: 3;
  pointer-events: none;
`;

const ThemeCardsScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  width: auto;
  margin: 0 -20px;
  padding: 4px 20px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ThemeCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
  width: 96px;
`;

const SwatchGrid = styled.div<{ $isSelected: boolean }>`
  position: relative;
  width: 96px;
  height: 96px;
  display: grid;
  grid-template-cols: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 2px;
  padding: 2px;
  background-color: #ffffff;
  border: 2px solid
    ${({ $isSelected }) =>
      $isSelected
        ? "var(--interactive-primary-pressed, #0061ff)"
        : "var(--border-default, #e5e8eb)"};
  border-radius: 20px;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.2s ease;
`;

const SwatchBlock = styled.div`
  border-radius: 4px;
  width: 100%;
  height: 100%;
`;

const ThemeLabel = styled.span<{ $isSelected: boolean }>`
  text-align: center;

  /* label-2 */
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 142.857% */
  color: ${({ $isSelected }) =>
    $isSelected
      ? "var(--text-brand, #0061FF)"
      : "var(--text-secondary, #333d4b)"};
  transition: color 0.2s ease;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const SegmentedControl = styled.div`
  display: flex;
  background-color: var(--bg-subtle, #f8f9fb);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
`;

const SegmentButton = styled.button<{ $isSelected: boolean }>`
  font-family: Pretendard;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  padding: 6px 14px;
  border: ${({ $isSelected }) =>
    $isSelected
      ? "1px solid var(--border-default, #e5e8eb)"
      : "1px solid transparent"};
  background-color: ${({ $isSelected }) =>
    $isSelected ? "#ffffff" : "transparent"};
  color: ${({ $isSelected }) =>
    $isSelected
      ? "var(--text-brand, #0061FF)"
      : "var(--text-secondary, #333D4B)"};
  border-radius: 6px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: ${({ $isSelected }) =>
    $isSelected ? "0px 2px 4px rgba(0, 0, 0, 0.04)" : "none"};

  &:active {
    opacity: 0.8;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CheckboxLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const SelectionControl = styled.div<{ $selected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background-color: ${({ $selected }) =>
    $selected ? "var(--interactive-primary-pressed, #0061ff)" : "transparent"};
  border: ${({ $selected }) =>
    $selected ? "none" : "1.5px solid var(--border-strong, #d1d6db)"};
`;

const CheckboxText = styled.span`
  color: var(--text-primary, #191f28);
  font-family: "Noto Sans KR";
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const BottomCta = styled.div`
  display: flex;
  width: 100%;
  position: sticky;
  bottom: 0;
  background-color: var(--bg-base, #ffffff);
  padding: 12px 0px 0px 0px;
  box-sizing: border-box;
  z-index: 10;
`;
