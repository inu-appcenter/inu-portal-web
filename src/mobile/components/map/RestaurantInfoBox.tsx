import styled from "styled-components";

//아직 이미지 확보 못함
// import 학생식당 from "resources/assets/mapRestaurantImages/학생식당.jpg";
// import 제1기숙사식당 from "resources/assets/mapRestaurantImages/제1기숙사식당.jpg";
// import 제2기숙사식당 from "resources/assets/mapRestaurantImages/제2기숙사식당.jpg";
// import 교직원식당 from "resources/assets/mapRestaurantImages/교직원식당.jpg";
// import 제27호관식당 from "resources/assets/mapRestaurantImages/27호관식당.jpg";
// import 사범대식당 from "resources/assets/mapRestaurantImages/사범대식당.jpg";
import 공씨네주먹밥 from "resources/assets/mapRestaurantImages/공씨네주먹밥.jpg";
import 토마토도시락 from "resources/assets/mapRestaurantImages/토마토도시락.jpg";
import 고기굽는집 from "resources/assets/mapRestaurantImages/고기굽는집.jpg";
import Salady from "resources/assets/mapRestaurantImages/Salady.jpg";
import 쉐푸드 from "resources/assets/mapRestaurantImages/쉐푸드.jpg";
import 봉구스밥버거 from "resources/assets/mapRestaurantImages/봉구스밥버거.jpg";
import 법대생김밥꽈배기 from "resources/assets/mapRestaurantImages/법대생김밥꽈배기.jpg";
import coopsket자연대 from "resources/assets/mapRestaurantImages/coopsket자연대.jpg";
import coopsket복지회관 from "resources/assets/mapRestaurantImages/coopsket복지회관.jpg";
import coopsket생명대 from "resources/assets/mapRestaurantImages/coopsket생명대.jpg";
import coopsket공대 from "resources/assets/mapRestaurantImages/coopsket공대.jpg";
import emart24도서관 from "resources/assets/mapRestaurantImages/emart24도서관.jpg";


import {Place} from "components/map/DB.tsx";


// 이미지 객체를 생성
const imageMap: Record<string, string> = {
    // // "학생식당": 학생식당,
    // "제1기숙사식당": 제1기숙사식당,
    // "제2기숙사식당": 제2기숙사식당,
    // "교직원식당": 교직원식당,
    // "27호관식당": 제27호관식당,
    // "사범대식당": 사범대식당,
    "공씨네주먹밥": 공씨네주먹밥,
    "토마토도시락": 토마토도시락,
    "고기굽는 집(고집)": 고기굽는집,
    "Salady": Salady,
    "쉐푸드": 쉐푸드,
    "봉구스밥버거": 봉구스밥버거,
    "법대생김밥/꽈배기": 법대생김밥꽈배기,
    "coopsket자연대": coopsket자연대,
    "coopsket복지회관": coopsket복지회관,
    "coopsket생명대": coopsket생명대,
    "coopsket공대": coopsket공대,
    "emart24도서관": emart24도서관,
};


const RestaurantInfoBox = ({place}: { place: Place }) => {
    return (
        <RestaurantInfoBoxWrapper>
            {/* @ts-ignore */}
            <Image src={imageMap[place.restaurantInfo?.name]} alt={`${place.restaurantInfo?.name}`}/>
            <Content>
                <Title>{place.restaurantInfo?.name}</Title>
            </Content>
        </RestaurantInfoBoxWrapper>
    )
}


const RestaurantInfoBoxWrapper = styled.div`
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


export default RestaurantInfoBox;