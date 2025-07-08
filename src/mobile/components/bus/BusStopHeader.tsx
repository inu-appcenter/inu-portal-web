import styled from "styled-components";
import InfoIcon from "mobile/components/bus/InfoIcon";

interface Props {
  stopName: string;
  stopNotice: string;
  onClickStopInfo?: () => void;
  showInfoIcon?: boolean;
}

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
  width: 100%;
  padding: 16px;
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
