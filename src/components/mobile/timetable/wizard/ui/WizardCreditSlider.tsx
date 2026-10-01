import styled from "styled-components";
import { WIZARD_PRIMARY } from "./tokens";
import { typography } from "@/styles/typography";

interface WizardCreditSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  /** 눈금 라벨. 생략하면 "{n}학점" */
  formatLabel?: (value: number) => string;
  "aria-label"?: string;
}

/**
 * 목표 학점 단일 핸들 슬라이더 (Figma Slider 3561:11215).
 * 기존 CreditRangeSlider는 min/max 두 핸들이라 시안(목표 학점 하나)과 맞지 않는다.
 * 네이티브 range input을 덮어써서 키보드·스크린리더 조작을 그대로 얻는다.
 */
const WizardCreditSlider = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatLabel = (n) => `${n}학점`,
  "aria-label": ariaLabel = "목표 학점",
}: WizardCreditSliderProps) => {
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <Wrapper>
      <Range
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        aria-valuetext={formatLabel(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${percent}%` } as React.CSSProperties}
      />
      <Scale aria-hidden>
        <span>{formatLabel(min)}</span>
        <span>{formatLabel(max)}</span>
      </Scale>
    </Wrapper>
  );
};

export default WizardCreditSlider;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const thumb = `
  width: 20px;
  height: 20px;
  box-sizing: border-box;
  border-radius: 50%;
  border: 3px solid var(--interactive-brand, #0061ff);
  background: #ffffff;
  cursor: grab;
`;

const Range = styled.input`
  width: 100%;
  height: 20px;
  margin: 0;
  background: transparent;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(
      to right,
      ${WIZARD_PRIMARY} var(--fill),
      var(--border-default, #e5e8eb) var(--fill)
    );
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    /* 트랙(6) 가운데에 20px 핸들을 맞춘다 */
    margin-top: -7px;
    ${thumb}
  }

  &::-moz-range-track {
    height: 6px;
    border-radius: 3px;
    background: var(--border-default, #e5e8eb);
  }
  &::-moz-range-progress {
    height: 6px;
    border-radius: 3px;
    background: ${WIZARD_PRIMARY};
  }
  &::-moz-range-thumb {
    ${thumb}
  }

  &:focus-visible {
    outline: none;
  }
  &:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px var(--bg-brand, #eff6ff);
  }
`;

const Scale = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--text-tertiary, #8b95a1);
  ${typography.body2}
`;
