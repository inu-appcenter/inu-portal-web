import React, {useEffect, useState /*useState*/} from "react";
import {useLocation} from "react-router-dom";
import styled from "styled-components";

import {ThemeProvider} from "styled-components";
import {broadcasting, tents, athleticGoods, elses} from "./DB.tsx";


// TabButton을 함수형 컴포넌트로 정의
const TabButton = ({text, isSelected, onClick}: { text: string, isSelected: boolean, onClick: () => void }) => {
    return (
        <TabButtonWrapper isSelected={isSelected} onClick={onClick}>
            {text}
        </TabButtonWrapper>
    );
};


export default function RentalPage() {
    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState<string>("학교");

    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
    };

    const goodsToRender = selectedTab === "방송장비" ? broadcasting : selectedTab === "천막" ? tents : selectedTab === "체육물품" ? athleticGoods : selectedTab === "기타" ? elses : [];


    return (
        <Wrapper>
            총학생회에서 제공하는 물품 대여 서비스입니다.<br/>
            ※ 대여 신청 가능한 물품의 개수는 적혀있는 것과 다를 수 있습니다.<br/>
            ※ 물품 파손 시 보증금 반환 불가 및 손망실 금액이 발생할 수 있습니다.<br/>
            ※ 총학 행사 기간에는 대여 불가능합니다.<br/>
            ※ 당일 예약이 불가합니다.<br/>
            물품 수량 확인 날짜 2025.01.02<br/>
            <TabWrapper>
                <TabButton text={"방송장비"} isSelected={selectedTab === "방송장비"}
                           onClick={() => handleTabClick("방송장비")}/>
                <TabButton text={"천막"} isSelected={selectedTab === "천막"}
                           onClick={() => handleTabClick("천막")}/>
                <TabButton text={"체육물품"} isSelected={selectedTab === "체육물품"}
                           onClick={() => handleTabClick("체육물품")}/>
                <TabButton text={"기타"} isSelected={selectedTab === "기타"} onClick={() => handleTabClick("기타")}/>
            </TabWrapper>
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
            {/*<ItemList/>*/}
            {/*<ReservationList/>*/}

        </Wrapper>

    );
}


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


const Wrapper = styled.div`
    display: flex;
    flex-direction: column;

`

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
