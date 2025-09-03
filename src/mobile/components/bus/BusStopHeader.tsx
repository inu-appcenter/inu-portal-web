import styled from "styled-components";
import InfoIcon from "mobile/components/bus/InfoIcon";
import { BusStopHeaderProps } from "types/bus.ts";
import SectionLabel from "mobile/components/bus/SectionLabel";

interface Props extends BusStopHeaderProps {
  sectionLabel?: string;
}

export default function ponBusStopHeader({
  stopName,
  stopNotice,
  onClickStopInfo,
  showInfoIcon = true,
  sectionLabel,
}: Props) {
  return (
    <BusStopHeaderWrapper>
      <TopWrapper>
        <StopName>{stopName}</StopName>
        {sectionLabel && <SectionLabel text={sectionLabel} />}
        {showInfoIcon && <InfoIcon onClick={onClickStopInfo} />}
      </TopWrapper>
      <Notice>{stopNotice}</Notice>
    </BusStopHeaderWrapper>
  );
}

const BusStopHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
  box-sizing: border-box;
`;

const TopWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StopName = styled.h2`
  font-size: 18px;
  font-weight: bold;
`;

const Notice = styled.p`
  font-size: 14px;
  color: #3b566e;
  white-space: pre-wrap;
  margin: 0;
  line-height: 1.8;

  @media (max-width: 380px) {
    font-size: 13px;
  }
`;
