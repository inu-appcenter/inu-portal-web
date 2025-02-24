import styled from "styled-components";
import LocationIcon from "resources/assets/mapIcons/LocationIcon.svg";
import OpenIcon from "resources/assets/mapIcons/OpenIcon.svg";
import CloseIcon from "resources/assets/mapIcons/CloseIcon.svg";


import {useState} from "react";
import SchoolInfoBox from "./SchoolInfoBox.tsx";
import {Place} from "../../../components/map/DB.tsx";
import {zoomLocation} from "../../../components/map/utils/mapUtils.ts";


const List = ({
                  placesToRender, map, markers
              }: {
    placesToRender: Place[];
    map: any;
    markers: any;

}) => {
    const [openIndex, setOpenIndex] = useState(-1);

    const handleClick = ({index}: { index: number }) => {
        if (index === openIndex) {
            setOpenIndex(-1);
            return;
        }
        setOpenIndex(index);

        // setViewXY({X: 10, Y: 20});
    };

    return (
        <NewPlacesListWrapper>
            {placesToRender.map((place, index) => (
                <div key={index}>
                    <NewPlaceWrapper
                        onClick={() => {
                            handleClick({index});
                            const moveLatLon = new window.kakao.maps.LatLng(place.latitude, place.longitude);

                            // 맵의 중심을 moveLatLon 위치로 설정
                            map.setCenter(moveLatLon);
                            zoomLocation(map);


                            //리스트에서 장소 클릭시 맵 화면에서 인포윈도우를 같이 띄우고 싶은데 안되네요..
                            // 이미 생성된 마커를 찾아 클릭 이벤트를 트리거
                            const marker = markers.find(marker => {
                                return marker.getPosition().equals(moveLatLon); // 위치가 일치하는 마커 찾기
                            });

                            if (marker) {
                                // 해당 마커를 클릭한 것처럼 이벤트를 트리거
                                window.kakao.maps.event.trigger(marker, "click");
                            }
                        }}
                    >


                        <FirstLine>
                            <IconBox src={LocationIcon}/>
                            <TitleBox>
                                <strong>{place.location}</strong> {place.place_name} {place.category}
                            </TitleBox>
                            {openIndex === index ? (
                                <OpenIconBox src={CloseIcon}/>

                            ) : <OpenIconBox src={OpenIcon}/>
                            }
                        </FirstLine>
                        {openIndex === index && (
                            <SecondLine>
                                <SchoolInfoBox place={place}/>
                            </SecondLine>
                        )}
                    </NewPlaceWrapper>
                </div>
            ))}
        </NewPlacesListWrapper>
    );
};

const NewPlacesListWrapper = styled.div`
    width: 100%;
    height: calc(100% - 50px);
    display: flex;
    flex-direction: column;
    margin-top: 20px;

    overflow-y: auto;

    padding-right: 10px;
    box-sizing: border-box;
`;

const NewPlaceWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    border-bottom: 0.5px solid #d6d6d6;
`;

const IconBox = styled.img`
    height: 32px;
    width: fit-content;
`;

const TitleBox = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    /* identical to box height */
    letter-spacing: 1px;

    color: #3b566e;
    flex: 1;
    padding-left: 15px;
`;

const OpenIconBox = styled.img`
    height: 11.78px;
    width: fit-content;
`;

const FirstLine = styled.div`
    height: 46px;

    align-items: center;

    justify-content: space-between;

    display: flex;
    flex-direction: row;
`;

const SecondLine = styled.div`
    width: 100%;
    height: fit-content;
    padding: 10px;
    box-sizing: border-box;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

export default List;
