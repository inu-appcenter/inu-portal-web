import React, { ButtonHTMLAttributes, ReactNode } from "react";
import styled, { css, keyframes } from "styled-components";

export type CapsuleButtonVariant = "brand" | "danger" | "primary" | "secondary";

export interface CapsuleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CapsuleButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface ButtonGroupProps {
  children: ReactNode;
  gap?: number | string;
  direction?: "row" | "column";
  align?: "flex-start" | "center" | "flex-end" | "stretch";
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  border-top-color: ${({ $color }) => $color};
  animation: ${spin} 0.8s linear infinite;
  margin-right: 8px;
  flex-shrink: 0;
`;

const getVariantStyles = (variant: CapsuleButtonVariant) => {
  switch (variant) {
    case "brand":
      return css`
        background: var(--bg-brand-subtle, #eff6ff);
        color: var(--text-brand, #0061ff);

        &:hover:not(:disabled) {
          background: rgba(0, 97, 255, 0.12);
        }
        &:active:not(:disabled) {
          background: rgba(0, 97, 255, 0.18);
          transform: scale(0.97);
        }
      `;
    case "danger":
      return css`
        background: var(--bg-error, #fff0f0);
        color: var(--text-error, #ef4444);

        &:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.12);
        }
        &:active:not(:disabled) {
          background: rgba(239, 68, 68, 0.18);
          transform: scale(0.97);
        }
      `;
    case "primary":
      return css`
        background: var(--interactive-primary, #3b82f6);
        color: var(--text-inverse, #fff);

        &:hover:not(:disabled) {
          background: var(--interactive-primary-hover, #60a5fa);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        &:active:not(:disabled) {
          background: var(--interactive-primary-pressed, #0061ff);
          transform: scale(0.97);
        }
      `;
    case "secondary":
    default:
      return css`
        background: var(--bg-muted, #f1f3f5);
        color: var(--text-secondary, #333d4b);

        &:hover:not(:disabled) {
          background: var(--bg-disabled, #e5e8eb);
        }
        &:active:not(:disabled) {
          background: var(--border-strong, #d1d6db);
          transform: scale(0.97);
        }
      `;
  }
};

const getSpinnerColor = (variant: CapsuleButtonVariant) => {
  switch (variant) {
    case "brand":
      return "var(--text-brand, #0061FF)";
    case "danger":
      return "var(--text-error, #EF4444)";
    case "primary":
      return "var(--text-inverse, #FFF)";
    case "secondary":
    default:
      return "var(--text-secondary, #333D4B)";
  }
};

const StyledButton = styled.button<{
  $variant: CapsuleButtonVariant;
  $fullWidth: boolean;
  $loading: boolean;
}>`
  display: flex;
  padding: 12px 24px;
  justify-content: center;
  align-items: center;
  border-radius: 999px;
  border: none;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: -0.2px;

  ${({ $variant }) => getVariantStyles($variant)}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  ${({ $loading }) =>
    $loading &&
    css`
      pointer-events: none;
      opacity: 0.8;
    `}
`;

const ContentWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const StyledGroup = styled.div<{
  $gap: number | string;
  $direction: "row" | "column";
  $align: "flex-start" | "center" | "flex-end" | "stretch";
}>`
  display: flex;
  flex-direction: ${({ $direction }) => $direction};
  gap: ${({ $gap }) => (typeof $gap === "number" ? `${$gap}px` : $gap)};
  align-items: ${({ $align }) => $align};
  justify-content: center;
  width: 100%;
  box-sizing: border-box;

  /* 가로 stretch 정렬 시 등분할 */
  ${({ $direction, $align }) =>
    $direction === "row" &&
    $align === "stretch" &&
    css`
      & > button {
        flex: 1;
      }
    `}

  /* 세로 정렬 시 그림자 효과 추가 */
  ${({ $direction }) =>
    $direction === "column" &&
    css`
      & > button {
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.16);
      }
    `}
`;

export const ButtonGroup: React.FC<ButtonGroupProps> = function ButtonGroup({
  gap = 10,
  direction = "row",
  align = "stretch",
  children,
}) {
  return (
    <StyledGroup $gap={gap} $direction={direction} $align={align}>
      {children}
    </StyledGroup>
  );
};

interface CapsuleButtonComponent extends React.FC<CapsuleButtonProps> {
  Group: React.FC<ButtonGroupProps>;
}

const CapsuleButton: CapsuleButtonComponent = function CapsuleButton({
  variant = "primary",
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: CapsuleButtonProps) {
  const spinnerColor = getSpinnerColor(variant);
  const isButtonDisabled = disabled || loading;

  return (
    <StyledButton
      $variant={variant}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={isButtonDisabled}
      {...props}
    >
      <ContentWrapper>
        {loading && <Spinner $color={spinnerColor} />}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </ContentWrapper>
    </StyledButton>
  );
} as any;

// Compound Component 바인딩
CapsuleButton.Group = ButtonGroup;

export default CapsuleButton;
