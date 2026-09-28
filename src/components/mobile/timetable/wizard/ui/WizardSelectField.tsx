import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { typo, WIZARD_PRIMARY } from "./tokens";

export interface WizardSelectOption {
  value: string;
  label: string;
}

interface WizardSelectFieldProps {
  value: string;
  options: WizardSelectOption[];
  onChange: (value: string) => void;
  /** 값이 없을 때 보이는 문구 */
  placeholder?: string;
  "aria-label"?: string;
  disabled?: boolean;
}

/**
 * 드롭다운 (Figma Dropdown_Term 3437:10229).
 * 선택 UI는 OS 기본 피커를 쓴다 — 웹뷰에서도 네이티브 휠이 떠서 커스텀 목록보다 낫다.
 * 다만 appearance:none인 select는 브라우저마다 글자 세로 위치가 달라서, 보이는 부분은
 * span으로 시안대로 그리고 투명한 select를 그 위에 덮는다.
 */
const WizardSelectField = ({
  value,
  options,
  onChange,
  placeholder = "선택",
  disabled,
  "aria-label": ariaLabel,
}: WizardSelectFieldProps) => {
  const selected = options.find((option) => option.value === value);

  return (
    <Field $disabled={disabled}>
      <Value $placeholder={!selected} aria-hidden>
        {selected?.label ?? placeholder}
      </Value>
      <Chevron aria-hidden>
        <Icon name="chevron-down" size={24} />
      </Chevron>
      <NativeSelect
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      >
        {!selected && (
          <option value={value} disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect>
    </Field>
  );
};

export default WizardSelectField;

const Field = styled.div<{ $disabled?: boolean }>`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 0 8px 16px;
  display: flex;
  align-items: center;
  border-radius: 20px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  &:focus-within {
    border-color: ${WIZARD_PRIMARY};
  }
`;

const Value = styled.span<{ $placeholder: boolean }>`
  flex: 1 0 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $placeholder }) =>
    $placeholder
      ? "var(--text-tertiary, #8b95a1)"
      : "var(--text-secondary, #333d4b)"};
  ${typo.heading2}
`;

const Chevron = styled.span`
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #333d4b);
`;

const NativeSelect = styled.select`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }
`;
