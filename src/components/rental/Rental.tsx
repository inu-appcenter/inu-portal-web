import {useEffect, useState} from "react";
import styled from "styled-components";
import ItemList from "../../mobile/components/util/rental/userMode/ItemList.tsx";
import RentalTab from "mobile/components/util/rental/RentalTab.tsx";
import NoticeBox from "../../mobile/components/util/rental/userMode/NoticeBox.tsx";

import ItemDetail from "../../mobile/components/util/rental/ItemDetail.tsx";
import RentalAdmin from "../../mobile/components/util/rental/adminMode/RentalAdmin.tsx";

import {Items, getItemsList} from "apis/rental.ts";
import ReservationList from "../../mobile/components/util/rental/userMode/ReservationList.tsx";


export default function RentalPage({isOpen: isOpenAdminPage}: { isOpen: any }) {
    const [selectedTab, setSelectedTab] = useState<string>("broadcast_equipment");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [items, setItems] = useState<Items[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpenedList, setIsOpenedList] = useState<boolean>(false);


    useEffect(() => {
        // 데이터 로드
        const fetchItems = async () => {
            try {
                const data = await getItemsList();
                setItems(data.data);
            } catch (error) {
                alert("물품 목록을 가져오는 중 오류가 발생하였습니다.");
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


    return (
        <Wrapper>
            {/* 평상시에는 렌탈 화면이 표시됨 */}
            {!isOpenAdminPage && (
                <>
                    <RentalTab handleTabClick={handleTabClick} selectedTab={selectedTab}/>

                    <ItemList selectedTab={selectedTab} setSelectedId={setSelectedId} items={items}/>

                    {/* 내 예약 목록 보기 버튼 추가 */}
                    <Button onClick={() => {
                        setIsOpenedList(!isOpenedList)
                    }}>내 예약 목록 보기</Button>

                    {isOpenedList && (
                        <>
                            <ReservationList/>
                        </>
                    )}


                    <NoticeBox/>
                </>
            )}

            {/* 관리자 모드 버튼이 눌린 경우 관리자 페이지 표시 */}
            {isOpenAdminPage && <RentalAdmin/>}


            {/* 선택된 아이템의 세부사항을 바텀시트로 보여줌 */}
            {selectedId && <ItemDetail itemId={selectedId} onClose={() => setSelectedId(null)}/>}
        </Wrapper>
    );
}

// styled components
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 0 12px;
    overflow-y: scroll;
    padding-bottom: 30px;
`;

const Button = styled.button`
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    margin-bottom: 15px;

    &:hover {
        background-color: #0056b3;
    }
`;


