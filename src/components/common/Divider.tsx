import styled from "styled-components";

interface DividerProps {
  margin?: string;
}

const Divider = ({ margin = "12px 0" }: DividerProps) => {
  return <StyledDivider $margin={margin} />;
};
export default Divider;

const StyledDivider = styled.div<{ $margin: string }>`
  width: 100%;
  height: 1px;
  background-color: var(--gray-200);
  margin: ${({ $margin }) => $margin};
`;
