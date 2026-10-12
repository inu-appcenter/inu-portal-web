import styled from "styled-components";

/**
 * 흰 바탕 + 기본 테두리 카드 틀. 시안에서 용도별로 둥글기만 다르다.
 * - 20: 조건 카드(Card_OffDays·Card_SoftOptions), 강의 카드, 목표 학점 카드
 * - 16: 저장 시트 미리보기(Preview, bg/subtle)
 * - 14: 실패 화면 ConflictCard
 */
const WizardCard = styled.div<{ $radius?: 14 | 16 | 20; $subtle?: boolean }>`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${({ $radius = 20 }) => $radius}px;
  border: 1px solid var(--border-default);
  background: ${({ $subtle }) =>
    $subtle ? "var(--bg-subtle)" : "var(--bg-base)"};
`;

export default WizardCard;
