import styled from "styled-components";
import { ReactNode } from "react";

interface EmptyStateProps {
  children: ReactNode;
  padding?: string;
}

/**
 * 데이터가 없을 때 표시하는 공용 컴포넌트
 */
export default function EmptyState({ children, padding = "40px 0" }: EmptyStateProps) {
  return <StyledEmptyState $padding={padding}>{children}</StyledEmptyState>;
}

const StyledEmptyState = styled.div<{ $padding: string }>`
  width: 100%;
  padding: ${({ $padding }) => $padding};
  text-align: center;
  color: #969696;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
`;
