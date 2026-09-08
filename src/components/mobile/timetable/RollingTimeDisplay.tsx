import styled from "styled-components";

interface RollingTimeDisplayProps {
  /** "HH:MM" */
  value: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const DIGIT_HEIGHT = 24;

/**
 * 시각을 자리별 슬롯머신처럼 굴려서 보여준다.
 * 값이 바뀌면 해당 자리 트랙만 세로로 이동하므로, 시작 시간을 옮겨
 * 종료 시간이 따라 움직이는 것이 눈에 들어온다.
 */
const RollingTimeDisplay = ({ value }: RollingTimeDisplayProps) => (
  <DisplayRow aria-label={value}>
    {value.split("").map((char, index) => {
      const digit = Number(char);
      if (Number.isNaN(digit)) {
        return <Separator key={index}>{char}</Separator>;
      }
      return (
        <DigitWindow key={index}>
          <DigitTrack $offset={digit}>
            {DIGITS.map((candidate) => (
              <Digit key={candidate}>{candidate}</Digit>
            ))}
          </DigitTrack>
        </DigitWindow>
      );
    })}
  </DisplayRow>
);

export default RollingTimeDisplay;

// --- Styles ---
const DisplayRow = styled.span`
  display: flex;
  align-items: center;
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: ${DIGIT_HEIGHT}px;
  color: var(--text-primary, #333d4b);
  /* 자릿수가 바뀌어도 폭이 흔들리지 않게 */
  font-variant-numeric: tabular-nums;
`;

const DigitWindow = styled.span`
  display: block;
  height: ${DIGIT_HEIGHT}px;
  overflow: hidden;
`;

const DigitTrack = styled.span<{ $offset: number }>`
  display: block;
  transform: translateY(${({ $offset }) => -$offset * DIGIT_HEIGHT}px);
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Digit = styled.span`
  display: block;
  height: ${DIGIT_HEIGHT}px;
  text-align: left;
`;

const Separator = styled.span`
  display: block;
  height: ${DIGIT_HEIGHT}px;
`;
