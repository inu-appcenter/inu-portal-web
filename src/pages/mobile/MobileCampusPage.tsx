import styled from "styled-components";
import MapManager from "@/components/map/MapManager.tsx";
import MobileHeader from "../../containers/mobile/common/MobileHeader.tsx";
import { useEffect } from "react";
import { postApiLogs } from "@/apis/members";

export default function MobileCampusPage() {
  useEffect(() => {
    const logApi = async () => {
      console.log("캠퍼스맵 로그");
      await postApiLogs("/api/campusmap");
    };
    logApi();
  }, []);

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

  box-sizing: border-box;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 16px;
`;
