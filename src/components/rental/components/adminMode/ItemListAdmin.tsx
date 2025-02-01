import {JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState} from "react";
import styled from "styled-components";

import {Items} from "apis/rental.ts";
import {getItemsList, getItemReservations} from "apis/rentalAdmin.ts";
import EditItem from "./EditItem";


// ItemList 컴포넌트
const ItemListAdmin = () => {
    const [items, setItems] = useState<Items[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedItem, setSelectedItem] = useState<Items | null>(null);
    const [isChanged, setIsChanged] = useState<boolean>(true);
    const [reservations, setReservations] = useState<{ [key: number]: any[] }>({});

    useEffect(() => {
        // 데이터 로드
        const fetchItems = async () => {
            try {
                const data = await getItemsList();
                setItems(data.data); // Pagination 형식일 경우 items 추출

                // 각 아이템의 예약 리스트 불러오기
                if (Array.isArray(data.data)) {
                    data.data.forEach(async (item) => {
                        try {
                            const reservationData = await getItemReservations(item.id, 1);
                            setReservations((prev) => ({
                                ...prev,
                                [item.id]: reservationData.contents,
                            }));
                        } catch (error) {
                            console.error("예약 리스트를 가져오는 중 오류 발생:", error);
                        }
                    });
                }

            } catch (error) {
                console.error("아이템 목록을 가져오는 중 오류 발생:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [isChanged]);

    if (loading) {
        return <p>로딩 중...</p>;
    }

    const handleClickItem = (item: Items) => {
        setSelectedItem(item);
    };

    // @ts-ignore
    return (
        <ItemListWrapper>
            {items.map((item, index) => (
                <ItemCard key={index} onClick={() => handleClickItem(item)}>
                    <ItemInfo>
                        <ItemName>{item.name}</ItemName>
                        <ItemCategory>{item.itemCategory}</ItemCategory>
                    </ItemInfo>
                    <div>
                        <ItemQuantity>수량: {item.totalQuantity}</ItemQuantity>
                        <ItemDeposit>보증금: {item.deposit.toLocaleString()}원</ItemDeposit>
                    </div>

                    {/* 예약 리스트 표시 */}
                    {reservations[item.id] && reservations[item.id].length > 0 && (
                        <ReservationList>
                            <h4>예약 목록</h4>
                            <ul>
                                {reservations[item.id].map((reservation: {
                                    memberId: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined;
                                    startDateTime: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined;
                                    endDateTime: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined;
                                    reservationStatus: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined;
                                }, idx: Key | null | undefined) => (
                                    <li key={idx}>
                                        <div>예약자 ID: {reservation.memberId}</div>
                                        <div>예약 시간: {reservation.startDateTime} - {reservation.endDateTime}</div>
                                        <div>상태: {reservation.reservationStatus}</div>
                                    </li>
                                ))}
                            </ul>
                        </ReservationList>
                    )}
                </ItemCard>
            ))}
            {/*선택된 아이템의 세부사항을 바텀시트로 보여줌*/}
            {selectedItem && (
                <EditItem
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onSave={() => {
                        setIsChanged(!isChanged);
                    }}
                />
            )}
        </ItemListWrapper>
    );
};

const ItemListWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ItemCard = styled.div`
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
`;

const ItemInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const ItemName = styled.h3`
    margin: 0;
    font-size: 18px;
`;

const ItemCategory = styled.span`
    font-size: 14px;
    color: #666;
`;

const ItemQuantity = styled.span`
    font-size: 16px;
`;

const ItemDeposit = styled.span`
    font-size: 16px;
    color: #007bff;
`;

const ReservationList = styled.div`
    margin-top: 16px;
    font-size: 14px;
    color: #333;

    h4 {
        font-size: 16px;
        margin-bottom: 8px;
    }

    ul {
        list-style-type: none;
        padding-left: 0;
    }

    li {
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
    }
`;

export default ItemListAdmin;
