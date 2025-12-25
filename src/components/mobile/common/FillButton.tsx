import styled from "styled-components";

// 버튼 속성 상속 인터페이스
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const FillButton = ({ children, ...props }: Props) => {
  return (
    // 나머지 속성 전달
    <FillButtonWrapper {...props}>{children}</FillButtonWrapper>
  );
};

export default FillButton;

const FillButtonWrapper = styled.button`
  min-width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
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
