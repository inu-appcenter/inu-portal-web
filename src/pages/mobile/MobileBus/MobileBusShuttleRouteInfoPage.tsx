import { useLocation } from "react-router-dom";
import styled from "styled-components";
import IlsanGimpoShuttle from "@/components/mobile/bus/shuttle/IlsanGimpoShuttle.tsx";
import AnsanSiheungShuttle from "@/components/mobile/bus/shuttle/AnsanSiheungShuttle.tsx";
import BucheonShuttle from "@/components/mobile/bus/shuttle/BucheonShuttle.tsx";
import { useHeader } from "@/context/HeaderContext";

const MobileBusShuttleRouteInfoPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const route = searchParams.get("route");

  // 헤더 설정 주입
  useHeader({
    title: "셔틀 노선 정보",
  });

  return (
    <Wrapper>
      {route === "ilsan-gimpo" && <IlsanGimpoShuttle />}
      {route === "bucheon" && <BucheonShuttle />}
      {route === "ansan-siheung" && <AnsanSiheungShuttle />}

      {!["ilsan-gimpo", "bucheon", "ansan-siheung"].includes(route || "") && (
        <div>노선 정보가 없습니다.</div>
      )}
    </Wrapper>
  );
};

export default MobileBusShuttleRouteInfoPage;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 16px;
  box-sizing: border-box;

  img {
    width: 100%;
  }
`;
