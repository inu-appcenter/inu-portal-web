import styled from "styled-components";
import { SOFT_PILL_SHADOW } from "@/styles/shadows";
import { ExternalLinkIcon } from "@/resources/assets/icons/mobile-home/chip";

// 버튼 속성 상속 인터페이스
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isExternalLink?: boolean;
}

const FillButton = ({ children, isExternalLink, ...props }: Props) => {
  return (
    // 나머지 속성 전달
    <FillButtonWrapper {...props}>
      {children} {isExternalLink && <ExternalLinkIcon aria-hidden="true" />}
    </FillButtonWrapper>
  );
};

export default FillButton;

const FillButtonWrapper = styled.button`
  min-width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: fit-content;
  border-radius: 100px;
  padding: 8px 14px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 500;

  background: #5e92f0;
  color: #f4f4f4;
  box-shadow: ${SOFT_PILL_SHADOW};
  cursor: pointer;

  /* 비활성화 상태 스타일 */
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;
