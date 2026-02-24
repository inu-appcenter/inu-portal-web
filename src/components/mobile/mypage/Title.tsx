import styled from "styled-components";

interface titleProps {
  title?: string;
}

export default function Title({ title }: titleProps) {
  return <TitleName>{title}</TitleName>;
}

const TitleName = styled.div`
  text-align: center;
  font-size: 22px;
  font-style: normal;
  font-weight: 600;
  //line-height: normal;

  display: flex;
  width: fit-content;
  align-items: center;
  justify-content: center;

  margin-left: 8px;
`;
