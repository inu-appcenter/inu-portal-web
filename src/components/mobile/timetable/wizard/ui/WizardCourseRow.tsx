import styled from "styled-components";
import { typography } from "@/styles/typography";

interface WizardCourseRowProps {
  title: string;
  /** "교수명 · 3학점 · 화 09:00~10:30" 처럼 이미 이어 붙인 한 줄 */
  meta: string;
  onClick?: () => void;
}

/**
 * 추천시간표 하단 과목 목록의 한 줄 (Figma Row_Course 3518:16185).
 * 시안 심볼만 Noto Sans KR로 되어 있는데 다른 텍스트와 섞이면 튀어서 전역 Pretendard를 쓴다.
 */
const WizardCourseRow = ({ title, meta, onClick }: WizardCourseRowProps) => {
  const content = (
    <>
      <Title>{title}</Title>
      <Meta>{meta}</Meta>
    </>
  );

  return onClick ? (
    <ButtonRow type="button" onClick={onClick}>
      {content}
    </ButtonRow>
  ) : (
    <Row>{content}</Row>
  );
};

export default WizardCourseRow;

const Row = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 8px 8px 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  word-break: break-word;
`;

const ButtonRow = styled(Row).attrs({ as: "button" })`
  margin: 0;
  border: none;
  background: none;
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: var(--bg-subtle);
  }
`;

const Title = styled.span`
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
`;

const Meta = styled.span`
  color: var(--text-tertiary);
  ${typography.caption1}
  line-height: 18px;
`;
