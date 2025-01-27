import styled from "styled-components";

import 이미지1호관 from "resources/assets/mapBuildingImages/1호관.webp";
import 이미지2호관 from "resources/assets/mapBuildingImages/2호관.webp";
import 이미지3호관 from "resources/assets/mapBuildingImages/3호관.webp";
import 이미지4호관 from "resources/assets/mapBuildingImages/4호관.webp";
import 이미지5호관 from "resources/assets/mapBuildingImages/5호관.webp";
import 이미지6호관 from "resources/assets/mapBuildingImages/6호관.webp";
import 이미지7호관 from "resources/assets/mapBuildingImages/7호관.webp";
import 이미지8호관 from "resources/assets/mapBuildingImages/8호관.webp";
import 이미지9호관 from "resources/assets/mapBuildingImages/9호관.webp";
import 이미지10호관 from "resources/assets/mapBuildingImages/10호관.webp";
import 이미지11호관 from "resources/assets/mapBuildingImages/11호관.webp";
import 이미지12호관 from "resources/assets/mapBuildingImages/12호관.webp";
import 이미지13호관 from "resources/assets/mapBuildingImages/13호관.webp";
import 이미지14호관 from "resources/assets/mapBuildingImages/14호관.webp";
import 이미지15호관 from "resources/assets/mapBuildingImages/15호관.webp";
import 이미지16호관 from "resources/assets/mapBuildingImages/16호관.webp";
import 이미지17호관 from "resources/assets/mapBuildingImages/17호관.webp";
import 이미지18_1호관 from "resources/assets/mapBuildingImages/18-1호관.webp";
import 이미지18_2호관 from "resources/assets/mapBuildingImages/18-2호관.webp";
import 이미지18_3호관 from "resources/assets/mapBuildingImages/18-3호관.webp";
import 이미지19호관 from "resources/assets/mapBuildingImages/19호관.webp";
import 이미지20호관 from "resources/assets/mapBuildingImages/20호관.webp";
import 이미지21호관 from "resources/assets/mapBuildingImages/21호관.webp";
import 이미지22호관 from "resources/assets/mapBuildingImages/22호관.webp";
import 이미지23호관 from "resources/assets/mapBuildingImages/23호관.webp";
import 이미지24호관 from "resources/assets/mapBuildingImages/24호관.webp";
import 이미지25호관 from "resources/assets/mapBuildingImages/25호관.webp";
import 이미지26호관 from "resources/assets/mapBuildingImages/26호관.webp";
import 이미지27호관 from "resources/assets/mapBuildingImages/27호관.webp";
import 이미지28호관 from "resources/assets/mapBuildingImages/28호관.webp";
import 이미지29호관 from "resources/assets/mapBuildingImages/29호관.webp";
import 이미지미추홀A동 from "resources/assets/mapBuildingImages/미추홀A동.webp"
import 이미지미추홀B동 from "resources/assets/mapBuildingImages/미추홀B동.webp"


import {Place} from "components/map/DB.tsx";


// 이미지 객체를 생성
const imageMap: Record<string, string> = {
    "1호관": 이미지1호관,
    "2호관": 이미지2호관,
    "3호관": 이미지3호관,
    "4호관": 이미지4호관,
    "5호관": 이미지5호관,
    "6호관": 이미지6호관,
    "7호관": 이미지7호관,
    "8호관": 이미지8호관,
    "9호관": 이미지9호관,
    "10호관": 이미지10호관,
    "11호관": 이미지11호관,
    "12호관": 이미지12호관,
    "13호관": 이미지13호관,
    "14호관": 이미지14호관,
    "15호관": 이미지15호관,
    "16호관": 이미지16호관,
    "17호관": 이미지17호관,
    "18-1호관": 이미지18_1호관,
    "18-2호관": 이미지18_2호관,
    "18-3호관": 이미지18_3호관,
    "19호관": 이미지19호관,
    "20호관": 이미지20호관,
    "21호관": 이미지21호관,
    "22호관": 이미지22호관,
    "23호관": 이미지23호관,
    "24호관": 이미지24호관,
    "25호관": 이미지25호관,
    "26호관": 이미지26호관,
    "27호관": 이미지27호관,
    "28호관": 이미지28호관,
    "29호관": 이미지29호관,
    "미추홀별관A동": 이미지미추홀A동,
    "미추홀별관B동": 이미지미추홀B동,
};


const SchoolInfoBox = ({place}: { place: Place }) => {
    return (
        <SchoolInfoBoxWrapper>
            <Image src={imageMap[place.location]} alt={`${place.location}호관`}/>
            <Content>
                <Title>{place.location}{' '}{place.place_name}</Title>
                <DepartmentWrapper>
                    {place.schoolPlaceInfo && place.schoolPlaceInfo.map((item, index) => {
                        return (
                            <Department key={index}>{item.name}</Department>
                        );
                    })}


                </DepartmentWrapper>

            </Content>

        </SchoolInfoBoxWrapper>
    )
}


const SchoolInfoBoxWrapper = styled.div`
    background: #FFFFFF;
    border: 1px solid #C0C0C2;
    border-radius: 10px;

    display: flex;
    flex-direction: row;

    padding: 10px;
    box-sizing: border-box;

    width: 100%;
    height: 100%;

    gap: 20px;

`

const Image = styled.img`
    width: 30%;
    aspect-ratio: 1 / 1; /* 정사각형 비율 유지 */
    border-radius: 10px;
    object-fit: cover; /* 컨테이너에 맞게 이미지 자르기 */

`

const Content = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* 위아래로 요소를 나누어 배치 */
    height: 100%;
    width: 100%;
`

const Title = styled.div`
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 30px;
    text-align: start;

    color: #324D97;
    width: 100%;
    height: fit-content;

    display: flex;
    flex-direction: row;
    gap: 5px;

`

const DepartmentWrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 한 줄에 두 개씩 */

    width: 100%;
    height: 100%;

    justify-content: end;
`

const Department = styled.div`
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 22px;

    color: #6B87C4;

    display: flex;
    flex-direction: row;
    gap: 5px;

`


export default SchoolInfoBox;