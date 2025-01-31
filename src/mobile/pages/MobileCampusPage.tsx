import styled from "styled-components";
import TipsPageTitle from "mobile/components/tips/TipsPageTitle";
import { useLocation } from "react-router-dom";

import BottomSheet from "../components/map/BottomSheet.tsx";

import Map from "components/map/components/KakaoMap.tsx";
import MobileCampusHeader from "../components/map/MobileCampusHeader.tsx";
import HelloBus from "../components/council/HelloBus.tsx";

export default function MobileCampusPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("search") || "";
  let docType = "캠퍼스맵";
  if (query) {
    docType = "SEARCH";
  } else if (params.get("type") === "notice") {
    docType = "NOTICE";
  }
  let type = params.get("type") || "campusmap";

  return (
    <MobileTipsPageWrapper>
      <MobileCampusHeader selectedType={type} />
      {type === "campusmap" && (
        <>
          <TitleCategorySelectorWrapper>
            <TipsPageTitle value={docType + (query ? ` - ${query}` : "")} />
          </TitleCategorySelectorWrapper>
          <Map />
          <BottomSheet />
        </>
      )}
      {type === "HelloBus" && (
        <>
          <HelloBus />
        </>
      )}
    </MobileTipsPageWrapper>
  );
}

const MobileTipsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100dvw;
  height: 70dvh;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 16px 0 16px;
`;
