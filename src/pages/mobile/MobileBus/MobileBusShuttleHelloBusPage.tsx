import styled from "styled-components";
import HelloBus from "@/components/mobile/bus/shuttle/HelloBus.tsx";
import { useHeader } from "@/context/HeaderContext";
import { useState, useCallback } from "react";

const MobileBusShuttleHelloBusPage = () => {
  const [show, setShow] = useState(0);

  const manualTitles = [
    "셔틀버스 안내",
    "앱 다운로드 메뉴얼",
    "이용 권한 요청 메뉴얼",
    "노선등록 메뉴얼",
    "알림존 설정",
  ];

  const handleBackToList = useCallback(() => {
    setShow(0);
  }, []);

  // 헤더 설정 주입
  useHeader({
    title: manualTitles[show] || "셔틀버스 안내",
    onBack: show > 0 ? handleBackToList : undefined,
  });

  return (
    <Wrapper>
      <HelloBus show={show} setShow={setShow} />
    </Wrapper>
  );
};

export default MobileBusShuttleHelloBusPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 16px;
  //padding-top: calc(56px + 16px);
  box-sizing: border-box;

  img {
    width: 100%;
  }
`;
