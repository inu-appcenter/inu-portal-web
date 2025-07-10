import styled from "styled-components";
import BusStopHeader from "../../components/bus/BusStopHeader.tsx";
import SectionLabel from "../../components/bus/SectionLabel.tsx";
import StopImg from "../../components/bus/StopImg.tsx";
import BusCircleBox from "../../components/bus/BusCircleBox.tsx";

import { useLocation } from "react-router-dom";
import { BusStopDummy } from "../../components/bus/BusStopDummy.ts";

export default function MobileBusStopPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const stopId = searchParams.get("id");

  const stop = BusStopDummy.find((s) => s.id === stopId);

  if (stop)
    return (
      <>
        <MobileBusStopPageWrapper>
          <BusStopHeader
            stopName={stop.stopName}
            stopNotice={stop.stopNotice ?? ""}
            showInfoIcon={false}
          />

          <ImageSection>
            <SectionLabel text="정류장 위치" />
            <StopImg stopImg={stop.stopImg} />
          </ImageSection>

          <BusCircleBox label="정차버스" busList={stop.busList} />
        </MobileBusStopPageWrapper>
      </>
    );
}

const MobileBusStopPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px;
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
`;
