import {useState} from "react";
import styled from "styled-components";

import ItemList from "./components/ItemList";

// TabButton을 함수형 컴포넌트로 정의
const TabButton = ({text, isSelected, onClick}: { text: string, isSelected: boolean, onClick: () => void }) => {
    return (
        <TabButtonWrapper isSelected={isSelected} onClick={onClick}>
            {text}
        </TabButtonWrapper>
    );
};


export default function RentalPage() {
    const [selectedTab, setSelectedTab] = useState<string>("학교");

    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
    };


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

            <ItemList selectedTab={selectedTab}/>
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

