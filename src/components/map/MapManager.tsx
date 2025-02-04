import styled from "styled-components";
import BottomSheet from "mobile/components/map/BottomSheet.tsx";

import Map from "components/map/components/KakaoMap.tsx";
import TipsPageTitle from "../../mobile/components/tips/TipsPageTitle.tsx";
import {useLocation} from "react-router-dom";
import {useState} from "react";

interface XY {
    X: number;
    Y: number;
}


export default function MapManager() {
    const [selectedTab, setSelectedTab] = useState<string>("학교");
    const [viewXY, setViewXY] = useState<XY>({X: 37.374474020920864, Y: 126.63361466845616});   //초기값은 캠퍼스맵 실행시 학교 위치이며, 바텀시트에서 장소 클릭시 좌표가 변경됨

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
            <Map selectedTab={selectedTab} setSelectedTab={setSelectedTab} viewXY={viewXY}/>
            <BottomSheet selectedTab={selectedTab} setSelectedTab={setSelectedTab} setViewXY={setViewXY}/>
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
