import { useLocation } from "react-router-dom";
import styled from "styled-components";
import GimpoCheongnaShuttle from "../../components/bus/GimpoCheongnaShuttle.tsx";
import AnsanSiheungShuttle from "../../components/bus/AnsanSiheungShuttle.tsx";
import BucheonShuttle from "../../components/bus/BucheonShuttle.tsx";

const MobileBusShuttleRouteInfoPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const route = searchParams.get("route");

  return (
    <Wrapper>
      {route === "gimpo-cheongna" && <GimpoCheongnaShuttle />}
      {route === "bucheon" && <BucheonShuttle />}
      {route === "ansan-siheung" && <AnsanSiheungShuttle />}

      {!["gimpo-cheongna", "bucheon", "ansan-siheung"].includes(
        route || "",
      ) && <div>노선 정보가 없습니다.</div>}
    </Wrapper>
  );
};

export default MobileBusShuttleRouteInfoPage;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;

  img {
    width: 100%;
  }
`;
