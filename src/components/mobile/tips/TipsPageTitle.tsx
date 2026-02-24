import styled from "styled-components";

interface TipsPageTitleProps {
  value: string;
}

export default function WritePageTitle({ value }: TipsPageTitleProps) {
  return <TipsPageTitleWrapper>{value}</TipsPageTitleWrapper>;
}

const TipsPageTitleWrapper = styled.div`
  font-size: 14px;
  font-weight: 600;
`;
