import { memo } from "react";
import styled from "styled-components";
import { motionTokens } from "@/styles/motion";

export interface SlidingNumberProps {
  value: number | string;
  className?: string;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

interface DigitColumnProps {
  digit: string;
}

const DigitColumn = memo(({ digit }: DigitColumnProps) => {
  const num = parseInt(digit, 10);
  const isNumber = !isNaN(num) && num >= 0 && num <= 9;

  if (!isNumber) {
    return <StaticChar>{digit}</StaticChar>;
  }

  return (
    <ColumnWrapper aria-hidden="true">
      <DigitTrack style={{ transform: `translateY(-${num * 10}%)` }}>
        {DIGITS.map((d) => (
          <DigitChar key={d}>{d}</DigitChar>
        ))}
      </DigitTrack>
    </ColumnWrapper>
  );
});

DigitColumn.displayName = "DigitColumn";

/**
 * Apple Watch / Wallet 스타일의 자릿수 슬라이딩 롤러 (Sliding Digit Odometer)
 *
 * - 숫자가 바뀔 때 기계식 롤러처럼 위아래로 회전하며 부드럽게 감속 안착합니다.
 * - 부모의 `font-size`, `font-weight`, `color`를 1em 기반으로 그대로 상속합니다.
 * - `tabular-nums`를 적용하여 레이아웃 흔들림(CLS)을 원천 차단합니다.
 */
export const SlidingNumber = memo(({ value, className }: SlidingNumberProps) => {
  const stringValue = String(value);
  const chars = stringValue.split("");

  return (
    <Container className={className} aria-label={stringValue}>
      <VisuallyHidden>{stringValue}</VisuallyHidden>
      {chars.map((char, index) => (
        <DigitColumn key={`${chars.length - index}-${char}`} digit={char} />
      ))}
    </Container>
  );
});

SlidingNumber.displayName = "SlidingNumber";

export default SlidingNumber;

const Container = styled.span`
  display: inline-flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
  line-height: 1em;
  height: 1em;
  overflow: hidden;
  vertical-align: baseline;
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ColumnWrapper = styled.span`
  display: inline-block;
  height: 1em;
  line-height: 1em;
  overflow: hidden;
  position: relative;
  vertical-align: baseline;
`;

const DigitTrack = styled.span`
  display: flex;
  flex-direction: column;
  transition: transform ${motionTokens.duration.gentle} ${motionTokens.easeOut};
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    transition: none !important;
  }
`;

const DigitChar = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1em;
  line-height: 1em;
`;

const StaticChar = styled.span`
  display: inline-block;
  height: 1em;
  line-height: 1em;
`;
