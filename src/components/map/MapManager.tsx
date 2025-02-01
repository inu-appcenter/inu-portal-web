import styled from "styled-components";
import BottomSheet from "mobile/components/map/BottomSheet.tsx";

import Map from "components/map/components/KakaoMap.tsx";
import TipsPageTitle from "../../mobile/components/tips/TipsPageTitle.tsx";
import {useLocation} from "react-router-dom";
import {useState} from "react";


export default function MapManager() {
    const [selectedTab, setSelectedTab] = useState<string>("학교");


    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";

    let docType = "캠퍼스맵";
    if (query) {
        docType = "SEARCH";
    } else if (params.get("type") === "notice") {
        docType = "NOTICE";
    }

    return (
        <>
            <TitleCategorySelectorWrapper>
                <TipsPageTitle value={docType + (query ? ` - ${query}` : "")}/>
            </TitleCategorySelectorWrapper>
            <Map selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
            <BottomSheet selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
        </>
    )

}


const TitleCategorySelectorWrapper = styled.div`
    width: 100%;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;
