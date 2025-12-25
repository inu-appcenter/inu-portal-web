import styled from "styled-components";

interface Props {
  text?: string;
  children?: React.ReactNode;
}
const Label = ({ text, children }: Props) => {
  return (
    <LabelWrapper>
      {text}
      {children}
    </LabelWrapper>
  );
};

export default Label;

const LabelWrapper = styled.div`
  display: flex;
  padding: 2px 8px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  min-width: fit-content;

  border-radius: 50px;
  background: #ecf4ff;

  color: #2f3034;
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;
