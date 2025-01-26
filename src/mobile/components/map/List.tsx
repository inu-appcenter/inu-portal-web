import InfoBox from "./InfoBox.tsx";
import {places, restPlaces} from "../../../components/map/DB.tsx";
import styled from "styled-components";

import {useState} from "react";


const List = ({selectedTab}: { selectedTab: string }) => {
    const [openIndex, setOpenIndex] = useState(-1);

    const handleClick = ({index}: { index: number }) => {
        if (index === openIndex) {
            setOpenIndex(-1);
            return;
        }
        setOpenIndex(index);
    }

    const placesToRender = selectedTab === "학교" ? places : selectedTab === "휴게실" ? restPlaces : [];

    return (
        <NewPlacesListWrapper>
            {placesToRender.map((place, index) => (
                <div key={index}>
                    <NewPlaceWrapper onClick={() => {
                        handleClick({index})
                    }}>
                        <FirstLine>
                            <IconBox src="../../../public/mapIcons/LocationIcon.svg"/>
                            <TitleBox>{place.location}{' '}{place.place_name}</TitleBox>
                            <OpenIconBox src="../../../public/mapIcons/OpenIcon.svg"/>
                        </FirstLine>
                        {openIndex === index ? (
                            <SecondLine>
                                <InfoBox title={"여성용품 배치"} isExist={"O"} num={"3"}></InfoBox>
                                <InfoBox title={"침대, 빈백(개)"} isExist={"O"} num={"3"}></InfoBox>
                                <InfoBox title={"샤워실"} isExist={"O"} num={"3"}></InfoBox>

                            </SecondLine>
                        ) : <></>}


                    </NewPlaceWrapper>

                </div>
            ))}
        </NewPlacesListWrapper>
    );
}


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
    flex-direction: column;
    width: 100%;


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

const FirstLine = styled.div`
    height: 46px;

    align-items: center;

    justify-content: space-between;

    display: flex;
    flex-direction: row;
`

const SecondLine = styled.div`
    width: 100%;
    padding: 10px;
    box-sizing: border-box;

    display: flex;
    flex-direction: row;
    justify-content: space-between;

`

export default List;