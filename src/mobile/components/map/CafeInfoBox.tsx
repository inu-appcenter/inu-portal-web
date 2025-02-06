import styled from "styled-components";

import cafeing from "resources/assets/mapCafeImages/CAFE-ING.jpg";
import cafedream도서관 from "resources/assets/mapCafeImages/CafeDream도서관.jpg"
import cafedream복지회관 from "resources/assets/mapCafeImages/CafeDream복지회관.jpg"
import graziebakery from "resources/assets/mapCafeImages/GrazieBakery.jpg"
import 박종석커피 from "resources/assets/mapCafeImages/박종석커피.jpg"
import 팔공티 from "resources/assets/mapCafeImages/팔공티.jpg"


import {Place} from "components/map/DB.tsx";


// 이미지 객체를 생성
const imageMap: Record<string, string> = {
    "CAFÉ-ING": cafeing,
    "Café Dream 도서관": cafedream도서관,
    "Café Dream 복지회관": cafedream복지회관,
    "Grazie Bakery": graziebakery,
    "박종석커피": 박종석커피,
    "PALGONG TEA": 팔공티,

};


const CafeInfoBox = ({place}: { place: Place }) => {
    return (
        <CafeInfoBoxWrapper>
            {/* @ts-ignore */}
            <Image src={imageMap[place.cafePlaceInfo?.name]} alt={`${place.cafePlaceInfo?.name}`}/>
            <Content>
                <Title>{place.cafePlaceInfo?.name}</Title>
            </Content>
        </CafeInfoBoxWrapper>
    )
}


const CafeInfoBoxWrapper = styled.div`
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


export default CafeInfoBox;