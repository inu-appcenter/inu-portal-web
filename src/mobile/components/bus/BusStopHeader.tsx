import styled from "styled-components";
import InfoIcon from "mobile/components/bus/InfoIcon";
import { BusStopHeaderProps } from "types/bus.ts";

interface Props extends BusStopHeaderProps {}

export default function BusStopHeader({
  stopName,
  stopNotice,
  onClickStopInfo,
  showInfoIcon = true,
}: Props) {
  return (
    <BusStopHeaderWrapper>
      <TopWrapper>
        <StopName>{stopName}</StopName>
        {showInfoIcon && <InfoIcon onClick={onClickStopInfo} />}
      </TopWrapper>
      <Notice>{stopNotice}</Notice>
    </BusStopHeaderWrapper>
  );
}

const BusStopHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
`;

const TopWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StopName = styled.h2`
  font-size: 20px;
  font-weight: bold;
`;

const Notice = styled.p`
  font-size: 14px;
  color: #3b566e;
  white-space: pre-line;
`;
