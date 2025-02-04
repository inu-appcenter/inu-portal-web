import styled from "styled-components";
import LocationIcon from "resources/assets/mapIcons/LocationIcon.svg";
import OpenIcon from "resources/assets/mapIcons/OpenIcon.svg";


import {useState} from "react";
import SchoolInfoBox from "./SchoolInfoBox.tsx";
import {Place} from "../../../components/map/DB.tsx";


const List = ({placesToRender, setViewXY}: { placesToRender: Place[], setViewXY: any }) => {
    const [openIndex, setOpenIndex] = useState(-1);

    const handleClick = ({index}: { index: number }) => {
        if (index === openIndex) {
            setOpenIndex(-1);
            return;
        }
        setOpenIndex(index);

        // setViewXY({X: latitude, Y: longitude})
    }

    return (
        <NewPlacesListWrapper>
            {placesToRender.map((place, index) => (
                <div key={index}>
                    <NewPlaceWrapper onClick={() => {
                        handleClick({index})
                    }}>
                        <FirstLine>
                            <IconBox src={LocationIcon}/>
                            <TitleBox>{place.location}{' '}{place.place_name}{' '}{place.category}</TitleBox>
                            <OpenIconBox src={OpenIcon}/>
                        </FirstLine>
                        {openIndex === index ? (
                            <SecondLine>
                                <SchoolInfoBox place={place}/>
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
    height: fit-content;
    padding: 10px;
    box-sizing: border-box;

    display: flex;
    flex-direction: row;
    justify-content: space-between;

`

export default List;