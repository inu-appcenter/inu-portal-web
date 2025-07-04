import styled from "styled-components";
import { useLocation } from "react-router-dom";
import useMobileNavigate from "../../hooks/useMobileNavigate.ts";

import MobileCampusHeader from "../components/map/MobileCampusHeader.tsx";
import HelloBus from "../components/council/HelloBus.tsx";
import MapManager from "components/map/MapManager.tsx";
import Title from "mobile/containers/common/MobileTitleHeader.tsx";

export default function MobileCampusPage() {
  const location = useLocation();
  const mobileNavigate = useMobileNavigate();

  const params = new URLSearchParams(location.search);
  let type = params.get("type") || "campusmap";

  return (
    <MobileTipsPageWrapper>
      <Title title={"캠퍼스"} onback={() => mobileNavigate("/home")} />

      <MobileCampusHeader selectedType={type} />
      <Wrapper>
        {type === "campusmap" && (
          <>
            <MapManager />
          </>
        )}
        {type === "HelloBus" && (
          <>
            <HelloBus />
          </>
        )}
      </Wrapper>
    </MobileTipsPageWrapper>
  );
}

const MobileTipsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100dvw;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 16px;
`;
