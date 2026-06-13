import React from "react";
import styled from "styled-components";
import Ripple from "./Ripple";

// 버튼 설정 인터페이스
export interface ButtonConfig {
  label: string;
  onClick: () => void;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  flex?: number;
}

// 프롭 인터페이스
export interface BottomButtonGroupProps {
  leftButton: ButtonConfig;
  rightButton: ButtonConfig;
  height?: string;
  gap?: string;
  padding?: string;
  containerBackgroundColor?: string;
  position?: "fixed" | "static" | "relative" | "absolute";
}

const BottomButtonGroup: React.FC<BottomButtonGroupProps> = ({
  leftButton,
  rightButton,
  height = "68px",
  gap = "10px",
  padding = "10px 16px",
  containerBackgroundColor = "#ffffff",
  position = "fixed",
}) => {
  const paddingVal = padding.split(" ")[0];

  return (
    <>
      <ButtonGroupContainer
        $height={height}
        $gap={gap}
        $padding={padding}
        $paddingVal={paddingVal}
        $containerBackgroundColor={containerBackgroundColor}
        $position={position}
      >
        <GroupButton
          $flex={leftButton.flex || 1}
          $backgroundColor={leftButton.backgroundColor || "#e5e7eb"}
          $textColor={leftButton.textColor || "#374151"}
          $disabled={leftButton.disabled}
          onClick={leftButton.onClick}
          disabled={leftButton.disabled}
        >
          {!leftButton.disabled && <Ripple color="rgba(243, 244, 247, 0.7)" />}
          {leftButton.label}
        </GroupButton>
        <GroupButton
          $flex={rightButton.flex || 1}
          $backgroundColor={rightButton.backgroundColor || "#3b82f6"}
          $textColor={rightButton.textColor || "#ffffff"}
          $disabled={rightButton.disabled}
          onClick={rightButton.onClick}
          disabled={rightButton.disabled}
        >
          {!rightButton.disabled && <Ripple color="rgba(255, 255, 255, 0.35)" />}
          {rightButton.label}
        </GroupButton>
      </ButtonGroupContainer>

      {/* 레이아웃용 스페이서 */}
      {position === "fixed" && (
        <Spacer $height={height} />
      )}
    </>
  );
};

interface ContainerProps {
  $height: string;
  $gap: string;
  $padding: string;
  $paddingVal: string;
  $containerBackgroundColor: string;
  $position: string;
}

const ButtonGroupContainer = styled.div<ContainerProps>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: ${props => props.$height};
  padding: ${props => props.$padding};
  gap: ${props => props.$gap};
  background-color: ${props => props.$containerBackgroundColor};
  box-sizing: border-box;
  position: ${props => props.$position};
  bottom: 0;
  left: 0;
  box-shadow: ${props => props.$position === "fixed" ? "0 -2px 10px rgba(0, 0, 0, 0.05)" : "none"};
  z-index: 1000;

  padding-bottom: ${props =>
    props.$position === "fixed"
      ? `calc(${props.$paddingVal} + env(safe-area-inset-bottom, 0px))`
      : props.$paddingVal};
`;

interface ButtonProps {
  $flex: number;
  $backgroundColor: string;
  $textColor: string;
  $disabled?: boolean;
}

const GroupButton = styled.button<ButtonProps>`
  flex: ${props => props.$flex};
  height: 100%;
  background-color: ${props => props.$backgroundColor};
  color: ${props => props.$textColor};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: ${props => props.$disabled ? "not-allowed" : "pointer"};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.1s ease, opacity 0.2s ease;
  outline: none;
  position: relative;
  overflow: hidden;

  &.active-touch {
    transform: ${props => props.$disabled ? "none" : "scale(0.96)"};
  }
`;

const Spacer = styled.div<{ $height: string }>`
  height: calc(${props => props.$height} + env(safe-area-inset-bottom, 0px));
  width: 100%;
  visibility: hidden;
  pointer-events: none;
`;

export default BottomButtonGroup;

