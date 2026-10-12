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
        background: var(--bg-brand);
        color: var(--text-brand);

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
        background: var(--bg-error);
        color: var(--text-error);

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
        background: var(--interactive-primary);
        color: var(--text-inverse);

        &:hover:not(:disabled) {
          background: var(--interactive-primary-hover);
        }
        &:active:not(:disabled) {
          background: var(--interactive-primary-pressed);
          transform: scale(0.97);
        }
      `;
    case "secondary":
    default:
      return css`
        border: 1px solid var(--border-default);
        background: var(--bg-muted);
        color: var(--text-secondary);

        &:hover:not(:disabled) {
          background: var(--bg-disabled);
        }
        &:active:not(:disabled) {
          background: var(--border-strong);
          transform: scale(0.97);
        }
      `;
  }
};

const getSpinnerColor = (variant: CapsuleButtonVariant) => {
  switch (variant) {
    case "brand":
      return "var(--text-brand)";
    case "danger":
      return "var(--text-error)";
    case "primary":
      return "var(--text-inverse)";
    case "secondary":
    default:
      return "var(--text-secondary)";
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
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  box-shadow: var(--elevation-1-shadow);

  font-family: inherit;
  text-align: center;
  font-size: var(--heading-1-font-size);
  font-style: normal;
  font-weight: var(--heading-1-font-weight);
  line-height: var(--heading-1-line-height);

  ${({ $variant }) => getVariantStyles($variant)}

  &:disabled {
    border-color: var(--border-default);
    background: var(--bg-disabled);
    color: var(--text-disabled);
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
