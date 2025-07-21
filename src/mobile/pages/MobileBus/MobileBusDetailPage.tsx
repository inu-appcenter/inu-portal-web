import { useSearchParams } from "react-router-dom";
import { busDetailDummy } from "../../components/bus/BusDetailDummy.ts";
import BusStopHeader from "../../components/bus/BusStopHeader.tsx";
import StopImg from "../../components/bus/StopImg.tsx";
import styled from "styled-components";

export default function MobileBusDetailPage() {
  const [searchParams] = useSearchParams();
  const number = searchParams.get("number");
  const busDetail = busDetailDummy.find((bus) => bus.number === number);
  //일단 임시로 구성
  if (busDetail)
    return (
      <PageWrapper>
        <BusStopHeader
          stopName={`${busDetail.number}번`}
          stopNotice={busDetail.busNotice}
          showInfoIcon={false}
        />
        <StopImg stopImg={[busDetail.routeImg]} />
      </PageWrapper>
    );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 16px;
`;
