import React from "react";
import styled from "styled-components";

import Tab from "../../../mobile/components/map/Tab.tsx";
import RestroomList from "../../../mobile/components/map/RestroomList.tsx";
import SchoolList from "../../../mobile/components/map/SchoolList.tsx";

import {places, restPlaces} from "../DB.tsx";

interface BottomSheetProps {
    selectedTab?: string;
    setSelectedTab?: React.Dispatch<React.SetStateAction<string>>;
    map: any;
}

const PlaceListPanel = ({selectedTab, setSelectedTab, map}: BottomSheetProps) => {

    const handleTabClick = (tab: string) => {
        // @ts-ignore
        setSelectedTab(tab);
    };

    const placesToRender = selectedTab === "학교" ? places : selectedTab === "휴게실" ? restPlaces : [];


    return (
        <PlaceListPanelWrapper>
            <Tab handleTabClick={handleTabClick} selectedTab={selectedTab}/>
            {selectedTab === "학교" ? (
                <SchoolList placesToRender={placesToRender} map={map}/>
            ) : selectedTab === "휴게실" ? (
                <RestroomList placesToRender={placesToRender}/>
            ) : (<></>)}
        </PlaceListPanelWrapper>
    );
};
export default PlaceListPanel;


//styled components

const PlaceListPanelWrapper = styled.div`
    width: 100%;
    height: 100%;
    margin: 0px 20px 20px 20px;

`
