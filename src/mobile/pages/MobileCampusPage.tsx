import styled from "styled-components";
import {useLocation} from "react-router-dom";

import MobileCampusHeader from "../components/map/MobileCampusHeader.tsx";
import HelloBus from "../components/council/HelloBus.tsx";
import MapManager from "components/map/MapManager.tsx";

export default function MobileCampusPage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    let type = params.get("type") || "campusmap";


    return (
        <MobileTipsPageWrapper>
            <MobileCampusHeader selectedType={type}/>
            {type === "campusmap" && (
                <>
                    <MapManager/>
                </>
            )}
            {type === "HelloBus" && (
                <>
                    <HelloBus/>
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
    padding: 0 16px 0 16px;
    width: 100dvw;
    height: 70dvh;
`;


