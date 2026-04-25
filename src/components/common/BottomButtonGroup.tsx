import React from "react";

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
}

const BottomButtonGroup: React.FC<BottomButtonGroupProps> = ({
  leftButton,
  rightButton,
  height = "68px",
  gap = "10px",
  padding = "10px 16px",
  containerBackgroundColor = "#ffffff",
}) => {
  // 실제 버튼이 담긴 고정 컨테이너 스타일
  const fixedContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: height,
    padding: padding,
    gap: gap,
    backgroundColor: containerBackgroundColor,
    boxSizing: "border-box",
    position: "fixed",
    bottom: 0,
    left: 0,
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
    zIndex: 1000,
    // 기기 하단 safe area 대응
    paddingBottom: `calc(${padding.split(" ")[0]} + env(safe-area-inset-bottom, 0px))`,
  };

  // 버튼 스타일 생성
  const getButtonStyle = (
    config: ButtonConfig,
    isRight: boolean,
  ): React.CSSProperties => ({
    flex: config.flex || 1,
    height: "100%",
    backgroundColor:
      config.backgroundColor || (isRight ? "#3b82f6" : "#e5e7eb"),
    color: config.textColor || (isRight ? "#ffffff" : "#374151"),
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: config.disabled ? "not-allowed" : "pointer",
    opacity: config.disabled ? 0.5 : 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });

  // 컴포넌트 자체에서 공간 확보
  return (
    <>
      {/* 1. 실제 버튼 (고정됨) */}
      <div style={fixedContainerStyle}>
        <button
          style={getButtonStyle(leftButton, false)}
          onClick={leftButton.onClick}
          disabled={leftButton.disabled}
        >
          {leftButton.label}
        </button>
        <button
          style={getButtonStyle(rightButton, true)}
          onClick={rightButton.onClick}
          disabled={rightButton.disabled}
        >
          {rightButton.label}
        </button>
      </div>

      {/* 2. 레이아웃용 스페이서: fixed 버튼이 차지하는 만큼 공간 확보 */}
      <div
        style={{
          height: `calc(${height} + env(safe-area-inset-bottom, 0px))`,
          width: "100%",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default BottomButtonGroup;
