import styled from "styled-components";
import InfoIcon from "@/components/mobile/bus/InfoIcon";
import { BusStopHeaderProps } from "@/types/bus.ts";
import SectionLabel from "@/components/mobile/bus/SectionLabel";

interface Props extends BusStopHeaderProps {
  sectionLabel?: string;
}

export default function BusStopHeader({
  stopName,
  stopNotice,
  onClickStopInfo,
  showInfoIcon = true,
  sectionLabel,
}: Props) {
  return (
    <BusStopHeaderWrapper>
      <TopWrapper>
        <LeftGroup>
          <StopName>{stopName}</StopName>
        </LeftGroup>
        <RightGroup>
          {sectionLabel && <SectionLabel text={sectionLabel} />}
          {showInfoIcon && <InfoIcon onClick={onClickStopInfo} />}
        </RightGroup>
      </TopWrapper>
      <Notice>{stopNotice}</Notice>
    </BusStopHeaderWrapper>
  );
}

const BusStopHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin: 24px 20px 0 20px;
  //margin: 24px 0;
  gap: 8px;
`;

const TopWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const StopName = styled.span`
  display: flex;
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
  align-items: center;
  justify-content: center;
`;

const Notice = styled.p`
  font-size: 13px;
  color: #3b566e;
  white-space: pre-wrap;
  margin: 0;
  line-height: 1.4;
  word-break: break-word;

  @media (max-width: 380px) {
    font-size: 12px;
  }
`;
