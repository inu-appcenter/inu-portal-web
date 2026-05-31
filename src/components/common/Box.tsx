import styled from "styled-components";
import { ReactNode, CSSProperties } from "react";

interface BoxProps {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}

const Box = ({ children, onClick, style }: BoxProps) => {
  return (
    <BoxWrapper onClick={onClick} style={style}>
      {children}
    </BoxWrapper>
  );
};

export default Box;

const BoxWrapper = styled.div`
  display: flex;
  padding: var(--padding-card);
  box-sizing: border-box;
  flex-direction: column;
  align-items: flex-start;
  //gap: 16px;
  align-self: stretch;

  border-radius: var(--radius-xl, 16px);
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #fff);
`;
