import {useEffect, useState} from "react";
import styled from "styled-components";

import ItemList from "./components/ItemList";
import Tab from "mobile/components/util/rental/Tab.tsx";
import OpenBtn from "resources/assets/rental/OpenBtn.svg"
import CloseBtn from "resources/assets/rental/CloseBtn.svg"
import ItemDetail from "../../mobile/components/util/rental/ItemDetail.tsx";
import RentalAdmin from "./components/adminMode/RentalAdmin.tsx";

import {getItemsList} from "apis/rental.ts";
import {Items} from "../../apis/rental.ts";


export default function RentalPage() {
    const [selectedTab, setSelectedTab] = useState<string>("broadcast_equipment");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
    const [isAdminUser, setIsAdminUser] = useState<boolean>(true);
    const [items, setItems] = useState<Items[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    setIsAdminUser; //빨간줄 없애기용..

    useEffect(() => {
        // 데이터 로드
        const fetchItems = async () => {
            try {
                const data = await getItemsList();
                setItems(data.data);
            } catch (error) {
                console.error("데이터를 가져오는 중 오류 발생:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    if (loading) {
        return <p>로딩 중...</p>;
    }


    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
    };

    const handleAdminMode = () => {
        setIsAdminMode(!isAdminMode);
    }


    return (
        <Wrapper>

            {/*평상시에는 렌탈 화면이 표시됨*/}
            {!isAdminMode && (
                <>
                    <Tab handleTabClick={handleTabClick} selectedTab={selectedTab}/>

                    <ItemList selectedTab={selectedTab} setSelectedId={setSelectedId} items={items}/>

                    <NoticeBox/>
                </>
            )}

            {/*관리자 모드 버튼이 눌린 경우 관리자 페이지 표시*/}
            {isAdminMode && (
                <>
                    <RentalAdmin/>
                </>
            )}

            {/*관리자 계정이면 관리자 페이지 버튼을 노출*/}
            {isAdminUser && (
                <>
                    <button onClick={handleAdminMode}>관리자 페이지</button>
                </>

            )}

            {/*선택된 아이템의 세부사항을 바텀시트로 보여줌*/}
            {selectedId && (
                <ItemDetail itemId={selectedId} onClose={() => setSelectedId(null)}/>
            )}

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

