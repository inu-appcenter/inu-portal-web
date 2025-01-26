import styled from "styled-components";

import {broadcasting, tents, athleticGoods, elses} from "../DB.tsx";


export default function ItemList({selectedTab}: { selectedTab: string }) {
    const goodsToRender = selectedTab === "방송장비" ? broadcasting : selectedTab === "천막" ? tents : selectedTab === "체육물품" ? athleticGoods : selectedTab === "기타" ? elses : [];

    return (
        <GoodsListWrapper>
            {goodsToRender.map((item, index) => (
                <div key={index}>
                    <GoodWrapper>
                        <ImageBox src={'public/defaultImages/신난횃불이.png'}/>
                        <DescriptionBox>
                            <span className={'name'}>{item.name}</span><br/>
                            대여료 : {item.deposit}<br/>
                            남은 수량 : {item.availableQuantity}
                        </DescriptionBox>


                    </GoodWrapper>

                </div>
            ))}
        </GoodsListWrapper>
    );

}


//styled components
const GoodsListWrapper = styled.div`
    width: 100%;
    height: fit-content;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* 화면 크기에 따라 150px 이상의 칸을 자동으로 채움 */
    margin-top: 20px;
    gap: 15px;
`

const GoodWrapper = styled.div`
    width: 200px;
    height: 220px; /* 고정된 높이 */
    background: #E1ECFF;
    border-radius: 5px;
    font-style: normal;
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    text-align: center;
    color: #000000;

    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    justify-content: flex-start; /* 내용물 위쪽 정렬 */
    padding: 10px;
    box-sizing: border-box;
`;

const ImageBox = styled.img`
    width: 100%;
    height: 140px; /* 고정된 크기로 이미지 강제 크기 맞춤 */
`;

const DescriptionBox = styled.div`
    width: 100%;
    height: fit-content; /* 내용에 맞는 높이 */
    text-align: center;

    .name {
        font-weight: bold;
        font-size: large;
    }
`;
