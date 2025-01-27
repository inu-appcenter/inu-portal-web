import {useState} from "react";
import styled from "styled-components";

import ItemList from "./components/ItemList";
import Tab from "mobile/components/util/rental/Tab.tsx";
import OpenBtn from "resources/assets/rental/OpenBtn.svg"
import CloseBtn from "resources/assets/rental/CloseBtn.svg"


export default function RentalPage() {
    const [selectedTab, setSelectedTab] = useState<string>("방송장비");

    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
    };


    return (
        <Wrapper>
            <Tab handleTabClick={handleTabClick} selectedTab={selectedTab}/>

            <ItemList selectedTab={selectedTab}/>

            <NoticeBox/>

        </Wrapper>

    );
}


//styled components
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

`


//공지 부분 컴포넌트
const NoticeBox = () => {

    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen(!isOpen);
    }
    return (
        <NoticeBoxWrapper>
            <TitleWrapper onClick={handleClick}>
                <Title>※ 물품 대여 방법 꼭 ! 확인하세요 </Title>
                {!isOpen && (
                    <img src={OpenBtn} style={{width: "15px"}}/>
                )}
                {isOpen && (
                    <img src={CloseBtn} style={{width: "15px"}}/>

                )}

            </TitleWrapper>
            {isOpen && (
                <Content>
                    총학생회에서 제공하는 물품 대여 서비스입니다.<br/>
                    ※ 대여 신청 가능한 물품의 개수는 적혀있는 것과 다를 수 있습니다.<br/>
                    ※ 물품 파손 시 보증금 반환 불가 및 손망실 금액이 발생할 수 있습니다.<br/>
                    ※ 총학 행사 기간에는 대여 불가능합니다.<br/>
                    ※ 당일 예약이 불가합니다.<br/>
                    물품 수량 확인 날짜 2025.01.02<br/>
                </Content>
            )}
        </NoticeBoxWrapper>
    )
}

const NoticeBoxWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;

    margin-bottom: 50px;

`

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    border-bottom: #dfdfdf 1px solid;

`
const Title = styled.div`

    height: 50px;
    width: 100%;
    display: flex;
    align-items: center;

    font-style: normal;
    font-weight: 700;
    font-size: 15px;
    line-height: 20px;
    /* identical to box height, or 133% */

    color: #000000;
`
const Content = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    /* or 154% */

    color: #656565;

    width: 100%;
`

