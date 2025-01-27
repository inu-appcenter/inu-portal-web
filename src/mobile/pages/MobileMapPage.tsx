import styled from "styled-components";
import TipsPageTitle from "mobile/components/tips/TipsPageTitle";
import {useLocation} from "react-router-dom";

import BottomSheet from "../components/map/BottomSheet.tsx"

import Map from "components/map/components/KakaoMap.tsx";

export default function MobileMapPage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    let docType = "캠퍼스맵";
    if (query) {
        docType = "SEARCH";
    } else if (params.get("type") === "notice") {
        docType = "NOTICE";
    }
    // const category = params.get("category") || "전체";

    return (
        <MobileTipsPageWrapper>
            <TitleCategorySelectorWrapper>
                <TipsPageTitle value={docType + (query ? ` - ${query}` : "")}/>
            </TitleCategorySelectorWrapper>
            <Map/>
            <BottomSheet/>
        </MobileTipsPageWrapper>
    );
}

const MobileTipsPageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 0 16px 0 16px;
    width: 100dvw;
    height: 70dvh;
`;

const TitleCategorySelectorWrapper = styled.div`
    width: 100%;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

