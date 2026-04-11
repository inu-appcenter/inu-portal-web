import styled, { css } from "styled-components";
import { SOFT_PILL_SHADOW } from "@/styles/shadows";

interface ActionButtonProps {
  disabled?: boolean;
}

const ActionButton = styled.a<ActionButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  min-width: 176px;
  border-radius: 999px;
  padding: 13px 22px;
  background: linear-gradient(180deg, #6f9ffc 0%, #4d7ee2 100%);
  color: #fff;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  box-shadow: ${SOFT_PILL_SHADOW};
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  /* disabled 속성이 true일 때 적용할 스타일 */
  ${(props) =>
    props.disabled &&
    css`
      background: #cccccc; // 배경색 회색 처리
      color: #ffffff;
      box-shadow: none; // 그림자 제거
      cursor: not-allowed; // 금지 커서
      pointer-events: none; // 클릭 이벤트 차단
      opacity: 0.7;
    `}
`;

export default ActionButton;
