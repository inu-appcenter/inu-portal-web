import styled from "styled-components";
import 외부연결버튼 from "@/resources/assets/mobile-home/chip/ExternalLink-white.svg";

// 버튼 속성 상속 인터페이스
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isExternalLink?: boolean;
}

const FillButton = ({ children, isExternalLink, ...props }: Props) => {
  return (
    // 나머지 속성 전달
    <FillButtonWrapper {...props}>
      {children} {isExternalLink && <img src={외부연결버튼} />}
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
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;

  /* 비활성화 상태 스타일 */
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;
