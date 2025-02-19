import styled from "styled-components";

import Map from "components/map/components/KakaoMap.tsx";
import TipsPageTitle from "../../mobile/components/tips/TipsPageTitle.tsx";
import {useLocation} from "react-router-dom";
import {useState} from "react";
import PlaceListPanel from "./components/PlaceListPanel.tsx";

interface XY {
    X: number;
    Y: number;
}

export default function MapManager() {
    const [selectedTab, setSelectedTab] = useState<string>("학교");
    const [map, setMap] = useState<any>(null);
    const [isOpen] = useState<boolean>(true);

    //캠퍼스맵 실행시 학교 위치
    const viewXY: XY = {
        X: 37.374474020920864,
        Y: 126.63361466845616,
    }

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

            <MapWrapper>
                <Map
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                    viewXY={viewXY}
                    map={map}
                    setMap={setMap}
                />
            </MapWrapper>

            {/*바텀시트 장소목록*/}
            <PlaceListPanel isOpen={isOpen} selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab} map={map}/>


        </>
    );
}

const TitleCategorySelectorWrapper = styled.div`
    width: 100%;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const MapWrapper = styled.div`
    height: 70dvh;
    width: 100%;
`;
