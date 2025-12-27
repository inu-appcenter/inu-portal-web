import styled from "styled-components";
import MapManager from "@/components/map/MapManager.tsx";
import { useEffect } from "react";
import { postApiLogs } from "@/apis/members";
import { useHeader } from "@/context/HeaderContext";

export default function MobileCampusPage() {
  // 헤더 설정 주입
  useHeader({
    title: "캠퍼스맵",
  });

  useEffect(() => {
    const logApi = async () => {
      console.log("캠퍼스맵 로그");
      await postApiLogs("/api/campusmap");
    };
    logApi();
  }, []);

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

  box-sizing: border-box;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 16px;
`;
