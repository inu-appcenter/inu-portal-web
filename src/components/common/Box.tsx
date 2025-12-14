import styled from "styled-components";
import { ReactNode } from "react";

interface BoxProps {
  children: ReactNode;
}

const Box = ({ children }: BoxProps) => {
  return <BoxWrapper>{children}</BoxWrapper>;
};

export default Box;

const BoxWrapper = styled.div`
  display: flex;
  padding: 20px;
  box-sizing: border-box;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;

  border-radius: 20px;
  background: #fff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
`;
