import {useEffect, useState} from "react";
import styled from "styled-components";

import {Items} from "apis/rental.ts";
import {getItemsList, getItemReservations} from "apis/rentalAdmin.ts";
import EditItem from "./EditItem";

// 예약 데이터 타입 정의
interface Reservation {
    memberId: string;
    startDateTime: string;
    endDateTime: string;
    reservationStatus: string;
    phoneNumber: number;
}

interface ApiResponse<T> {
    contents: T;
}

const ItemListAdmin = () => {
    const [items, setItems] = useState<Items[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedItem, setSelectedItem] = useState<Items | null>(null);
    const [isChanged, setIsChanged] = useState<boolean>(true);
    const [reservations, setReservations] = useState<{ [key: number]: Reservation[] }>({});

    useEffect(() => {
        // 데이터 로드
        const fetchItems = async () => {
            try {
                const data = await getItemsList();
                setItems(data.data); // Pagination 형식일 경우 items 추출

                // 각 아이템의 예약 리스트 불러오기
                if (Array.isArray(data.data)) {
                    for (const item of data.data) {
                        try {
                            if (item.id !== undefined) {
                                // @ts-ignore
                                const reservationData: ApiResponse<Reservation[]> = await getItemReservations(item.id, 1);
                                if (reservationData && reservationData.contents) {
                                    // @ts-ignore
                                    setReservations((prev) => ({
                                        ...prev,
                                        // @ts-ignore
                                        [item.id]: reservationData.contents,
                                    }));
                                }
                            }
                        } catch (error) {
                            console.error("예약 리스트를 가져오는 중 오류 발생:", error);
                        }
                    }
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

    const handleEditReservation = (reservationId: string) => {
        console.log("수정 버튼 클릭:", reservationId);
        // 수정 로직 구현
    };

    const handleDeleteReservation = (reservationId: string) => {
        console.log("삭제 버튼 클릭:", reservationId);
        // 삭제 로직 구현
    };

    return (
        <ItemListWrapper>
            {items.map((item, index) => (
                <ItemCard key={index}>
                    {/* 관리 버튼 추가 */}
                    <ManageButton onClick={() => handleClickItem(item)}>관리</ManageButton>

                    <ItemInfo>
                        <ItemName>{item.name}</ItemName>
                        <ItemCategory>{item.itemCategory}</ItemCategory>
                    </ItemInfo>
                    <div>
                        <ItemQuantity>수량: {item.totalQuantity}</ItemQuantity>
                        {' '}
                        <ItemDeposit>보증금: {item.deposit.toLocaleString()}원</ItemDeposit>
                    </div>

                    {/* 예약 리스트 표시 */}
                    {item.id !== undefined && reservations[item.id] && reservations[item.id].length > 0 && (
                        <ReservationList>
                            <h4>예약 목록</h4>
                            <ul>
                                {reservations[item.id].map((reservation, idx) => (
                                    <li key={idx}>
                                        <div>예약자 ID: {reservation.memberId}</div>
                                        <div>
                                            대여 날짜: {new Date(reservation.startDateTime).toLocaleString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        </div>
                                        <div>
                                            반납 날짜: {new Date(reservation.endDateTime).toLocaleString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        </div>
                                        <div>예약자 전화번호: {reservation.phoneNumber}</div>
                                        <div>상태: {reservation.reservationStatus === "CONFIRM" ? "승인" :
                                            reservation.reservationStatus === "PENDING" ? "관리자 확인 중" :
                                                reservation.reservationStatus === "REJECTED" ? "거절됨" :
                                                    "알 수 없음"
                                        }</div>

                                        {/* 수정 및 삭제 버튼 추가 */}
                                        <ButtonWrapper>
                                            <StyledButton
                                                onClick={() => handleEditReservation(reservation.memberId)}>수정</StyledButton>
                                            <StyledButton
                                                onClick={() => handleDeleteReservation(reservation.memberId)}>예약 강제
                                                삭제</StyledButton>
                                        </ButtonWrapper>
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
    position: relative; /* 상대적 위치 설정 */
`;

const ManageButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #218838;
    }

    &:focus {
        outline: none;
    }
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
        display: flex;
        flex-direction: column;
    }
`;

const ButtonWrapper = styled.div`
    display: flex;
    gap: 8px;
`;

const StyledButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #0056b3;
    }

    &:focus {
        outline: none;
    }
`;

export default ItemListAdmin;
