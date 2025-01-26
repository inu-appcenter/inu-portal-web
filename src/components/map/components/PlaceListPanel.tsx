import React, {useState} from "react";
import styled from "styled-components";
import {places, restPlaces} from "../DB";


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

            {/*<PlacesListWrapper>*/}
            {/*    {placesToRender.map((place, index) => (*/}
            {/*        <div key={index}>*/}
            {/*            <PlaceWrapper>{place.location}<br/>{place.place_name}</PlaceWrapper>*/}

            {/*        </div>*/}
            {/*    ))}*/}
            {/*</PlacesListWrapper>*/}

            <NewPlacesListWrapper>
                {placesToRender.map((place, index) => (
                    <div key={index}>
                        <NewPlaceWrapper>
                            <IconBox src="../../../public/mapIcons/LocationIcon.svg"/>
                            <TitleBox>{place.location}{' '}{place.place_name}</TitleBox>
                            <OpenIconBox src="../../../public/mapIcons/OpenIcon.svg"/>

                        </NewPlaceWrapper>

                    </div>
                ))}
            </NewPlacesListWrapper>
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
    gap: 20px;


`


const PlaceWrapper = styled.div`
    width: 120px;
    height: 75px;
    left: 304px;
    top: 741px;

    background: #E1ECFF;
    border-radius: 5px;

    font-style: normal;
    font-weight: 500;
    font-size: 13px;
    line-height: 28px;
    /* identical to box height, or 212% */
    letter-spacing: 1.14801px;

    color: #3B566E;

    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;


`

const NewPlacesListWrapper = styled.div`
    width: 100%;
    height: calc(100% - 50px);
    display: flex;
    flex-direction: column;
    margin-top: 20px;

    overflow-y: auto;
`

const NewPlaceWrapper = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 46px;

    align-items: center;

    justify-content: space-between;

    border-bottom: 0.5px solid #d6d6d6;

`

const IconBox = styled.img`
    height: 32px;
    width: fit-content;
`

const TitleBox = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    /* identical to box height */
    letter-spacing: 1px;

    color: #3B566E;
    flex: 1;
    padding-left: 15px;
`

const OpenIconBox = styled.img`
    height: 11.78px;
    width: fit-content;
`