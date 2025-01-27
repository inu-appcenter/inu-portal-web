import RestInfoBox from "./RestInfoBox.tsx";
import {Place} from "../../../components/map/DB.tsx";
import styled from "styled-components";
import ManRestIcon from "resources/assets/mapIcons/manRest.svg";
import WomanRestIcon from "resources/assets/mapIcons/womanRest.svg";
import PublicRestIcon from "resources/assets/mapIcons/publicRest.svg";
import OpenIcon from "resources/assets/mapIcons/OpenIcon.svg";


import {useState} from "react";


const RestroomList = ({placesToRender}: { placesToRender: Place[] }) => {
    const [openIndex, setOpenIndex] = useState(-1);

    const handleClick = ({index}: { index: number }) => {
        if (index === openIndex) {
            setOpenIndex(-1);
            return;
        }
        setOpenIndex(index);
    }

    
    return (
        <NewPlacesListWrapper>
            {placesToRender.map((place, index) => (
                <div key={index}>
                    <NewPlaceWrapper onClick={() => {
                        handleClick({index})
                    }}>
                        <FirstLine>
                            {place.category === "여자휴게실" ?
                                (<IconBox src={WomanRestIcon}/>) :
                                place.category === "남자휴게실" ? (
                                    <IconBox src={ManRestIcon}/>
                                ) : place.category === "남녀공용 휴게실" ? (
                                    <IconBox src={PublicRestIcon}/>
                                ) : (<></>)}

                            <TitleBox>{place.place_name}{' '}{place.location}{' '}{place.restareaInfo?.roomNumber}</TitleBox>
                            <OpenIconBox src={OpenIcon}/>
                        </FirstLine>
                        {openIndex === index ? (
                            <SecondLine>
                                <RestInfoBox title={"여성용품 배치"}
                                             isExist={place.restareaInfo?.hasFemaleProducts}></RestInfoBox>
                                <RestInfoBox title={"침대, 빈백(개)"} num={place.restareaInfo?.bedCount}></RestInfoBox>
                                <RestInfoBox title={"샤워실"} isExist={place.restareaInfo?.hasShowerRoom}></RestInfoBox>

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

    padding-right: 10px;
    box-sizing: border-box;
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

export default RestroomList;