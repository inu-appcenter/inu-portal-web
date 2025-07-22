import styled from "styled-components";
import MapManager from "components/map/MapManager.tsx";

export default function MobileCampusPage() {
  return (
    <MobileCampusPageWrapper>
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

  padding-top: 16px;
  box-sizing: border-box;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 16px;
`;
