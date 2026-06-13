import styled, { css } from "styled-components";
import { ReactNode, CSSProperties } from "react";
import Ripple from "./Ripple";

interface BoxProps {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}

const Box = ({ children, onClick, style }: BoxProps) => {
  return (
    <BoxWrapper onClick={onClick} style={style} $interactive={!!onClick}>
      {onClick && <Ripple />}
      {children}
    </BoxWrapper>
  );
};

export default Box;

const BoxWrapper = styled.div<{ $interactive?: boolean }>`
  display: flex;
  //padding: 20px;
  box-sizing: border-box;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;

  border-radius: 20px;
  background: #fff;
  position: relative;
  overflow: hidden;

  ${({ $interactive }) =>
    $interactive &&
    css`
      cursor: pointer;

      &.active-touch {
        > *:not(.ripple-container) {
          transform: scale(0.97);
        }
      }

      > *:not(.ripple-container) {
        transition: transform 0.12s ease-in-out;
      }
    `}
`;
