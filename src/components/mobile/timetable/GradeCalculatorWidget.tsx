import styled from "styled-components";
import Box from "@/components/common/Box.tsx";

const GradeCalculatorWidget = () => {
  return (
    <Box>
      <GradeCalculatorWidgetWrapper>
        <ItemWrapper>
          <Title>전체 평점</Title>
          <ScoreArea>4.23 / 4.5</ScoreArea>
        </ItemWrapper>
        <Divider />
        <ItemWrapper>
          <Title>전공 평점</Title>
          <ScoreArea>4.26 / 4.5</ScoreArea>
        </ItemWrapper>
        <Divider />
        <ItemWrapper>
          <Title>취득 평점</Title>
          <ScoreArea>130 / 140</ScoreArea>
        </ItemWrapper>
      </GradeCalculatorWidgetWrapper>
    </Box>
  );
};

export default GradeCalculatorWidget;

const GradeCalculatorWidgetWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
  align-items: stretch;
`;

const ItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.div`
  color: var(--text-secondary);
  text-align: center;

  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
`;
const ScoreArea = styled.div`
  color: #6b7280;
  text-align: center;

  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`;

const Divider = styled.div`
  width: 1px;
  background-color: var(--border-default);
`;
