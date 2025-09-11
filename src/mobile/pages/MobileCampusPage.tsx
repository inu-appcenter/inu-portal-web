import styled from "styled-components";
import MapManager from "components/map/MapManager.tsx";
import MobileHeader from "../containers/common/MobileHeader.tsx";

export default function MobileCampusPage() {
  return (
    <MobileCampusPageWrapper>
      <MobileHeader title={"캠퍼스맵"} />

      <Wrapper>
        <MapManager />
      </Wrapper>
    </MobileCampusPageWrapper>
  );
}

const MobileCampusPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100dvw;

  padding-top: 72px;

  box-sizing: border-box;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 16px;
`;
