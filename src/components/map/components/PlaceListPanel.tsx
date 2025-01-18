import React, {useState} from "react";
import styled from "styled-components";
import {Place, places, restPlaces} from "../DB";


// TabButton을 함수형 컴포넌트로 정의
const TabButton = ({text, isSelected, onClick}: { text: string, isSelected: boolean, onClick: () => void }) => {
    return (
        <TabButtonWrapper isSelected={isSelected} onClick={onClick}>
            {text}
        </TabButtonWrapper>
    );
};

const PlaceListPanel: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<string>("학교");

    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
    };
    const placesToRender = selectedTab === "학교" ? places : selectedTab === "휴게실" ? restPlaces : [];


    return (
        <div>
            <TabWrapper>
                <TabButton text={"학교"} isSelected={selectedTab === "학교"} onClick={() => handleTabClick("학교")}/>
                <TabButton text={"휴게실"} isSelected={selectedTab === "휴게실"} onClick={() => handleTabClick("휴게실")}/>
                <TabButton text={"카페"} isSelected={selectedTab === "카페"} onClick={() => handleTabClick("카페")}/>
                <TabButton text={"식당"} isSelected={selectedTab === "식당"} onClick={() => handleTabClick("식당")}/>
            </TabWrapper>

            <PlacesListWrapper>
                {placesToRender.map((place, index) => (
                    <div key={index}>
                        <PlaceWrapper>{place.location}{' '}{place.place_name}</PlaceWrapper>

                    </div>
                ))}
            </PlacesListWrapper>
        </div>
    );
};
export default PlaceListPanel;


//styled components
const TabButtonWrapper = styled.div<{ isSelected: boolean }>`
    width: fit-content;
    height: fit-content;
    padding: 4px 30px;
    box-sizing: border-box;
    border-bottom: 3px solid ${({isSelected}) => (isSelected ? "#a9b6e1" : "#B5B5B5")};
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 19px;
    text-align: center;
    color: ${({isSelected}) => (isSelected ? "#B5C8EA" : "#B5B5B5")}; /* 회색 계열로 변경 */
    cursor: pointer;
`;

const TabWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding-top: 15px;
`;


const PlacesListWrapper = styled.div`
    width: 100%;
    height: fit-content;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    margin-top: 20px;
    gap: 15px;
`

const PlaceWrapper = styled.div`
    width: 120px;
    height: 35px;
    left: 304px;
    top: 741px;

    background: #E1ECFF;
    border-radius: 5px;

    font-style: normal;
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    text-align: center;

    color: #000000;

    display: flex;
    align-items: center;
    justify-content: center;


`
