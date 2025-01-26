import React, {useState} from "react";
import styled from "styled-components";

import Tab from "../../../mobile/components/map/Tab.tsx";
import List from "../../../mobile/components/map/List";


const PlaceListPanel: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<string>("학교");

    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
    };


    return (
        <PlaceListPanelWrapper>
            <Tab handleTabClick={handleTabClick} selectedTab={selectedTab}/>
            <List selectedTab={selectedTab}/>
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
