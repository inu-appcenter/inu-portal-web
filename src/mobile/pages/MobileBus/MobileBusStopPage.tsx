import styled from "styled-components";
import BusStopHeader from "../../components/bus/BusStopHeader.tsx";
import SectionLabel from "../../components/bus/SectionLabel.tsx";
import BusCircleBox from "../../components/bus/BusCircleBox.tsx";

import { useLocation } from "react-router-dom";
import { BusStopDummy } from "../../components/bus/BusStopDummy.ts";
import BusStopMap from "../../components/bus/BusStopMap.tsx";

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
            sectionLabel={stop.sectionLabel}
          />

          <ImageSection>
            <SectionLabel text="정류장 위치" />
            <BusStopMap lat={stop.lat} lng={stop.lng} />
          </ImageSection>

          <BusCircleBox label="정차버스" busList={stop.busList} />
        </MobileBusStopPageWrapper>
      </>
    );
}

const MobileBusStopPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
`;
