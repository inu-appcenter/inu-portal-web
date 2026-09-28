import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { buttonReset, WIZARD_PRIMARY } from "./tokens";

interface WizardFavButtonProps {
  /** true면 담긴 상태(파란 원 + 체크), false면 담기(연파랑 원 + 플러스) */
  added: boolean;
  onClick: () => void;
  disabled?: boolean;
  /** 생략하면 상태에 맞춰 "담기" / "담기 취소" */
  "aria-label"?: string;
}

/**
 * 분반 담기 원형 버튼 (Figma FAV). 44px 터치 영역 안에 36px 원.
 * 행 클릭(상세 열기)과 겹치므로 클릭 전파를 막는다.
 */
const WizardFavButton = ({
  added,
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: WizardFavButtonProps) => (
  <HitArea
    type="button"
    aria-pressed={added}
    aria-label={ariaLabel ?? (added ? "담기 취소" : "담기")}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <Circle $added={added}>
      {added ? (
        <Icon name="check" size={24} />
      ) : (
        <Icon name="add-plus-l" size={20} />
      )}
    </Circle>
  </HitArea>
);

export default WizardFavButton;

const HitArea = styled.button`
  ${buttonReset}
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.4;
  }
`;

const Circle = styled.span<{ $added: boolean }>`
  width: 36px;
  height: 36px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid
    ${({ $added }) =>
      $added ? WIZARD_PRIMARY : "var(--border-brand-subtle, #d3e5ff)"};
  background: ${({ $added }) =>
    $added ? WIZARD_PRIMARY : "var(--bg-brand, #eff6ff)"};
  color: ${({ $added }) =>
    $added ? "var(--text-inverse, #ffffff)" : "var(--text-brand, #0061ff)"};
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;

  ${HitArea}:active:not(:disabled) & {
    transform: scale(0.92);
  }
`;
