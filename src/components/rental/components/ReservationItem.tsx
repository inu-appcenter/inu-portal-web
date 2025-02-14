import {useEffect, useState} from "react";
import {deleteReservation, getItemDetail} from "apis/rental";
import styled from "styled-components";

const ReservationItem = ({reservation}: { reservation: any }) => {
    const [loading, setLoading] = useState(false);
    const [itemName, setItemName] = useState("불러오는 중...");

    useEffect(() => {
        const fetchItemName = async () => {
            try {
                const response = await getItemDetail(reservation.itemId);
                setItemName(response.data.name);
            } catch (error) {
                console.error("물품 정보를 불러오는 데 실패했습니다.", error);
                setItemName("정보 없음");
            }
        };

        fetchItemName();
    }, [reservation.itemId]);

    const handleCancel = async (itemId: number) => {
        console.log(itemId);
        setLoading(true);
        try {
            await deleteReservation(itemId);
            alert("예약이 취소되었습니다.");
        } catch (error) {
            alert("예약 취소에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ReservationItemWrapper>
            <InfoContainer>
                <Info><strong>물품 이름:</strong> {itemName}</Info>
                <Info><strong>시작 시간:</strong> {new Date(reservation.startDateTime).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</Info>
                <Info><strong>종료 시간:</strong> {new Date(reservation.endDateTime).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</Info>
                <Info><strong>예약
                    상태:</strong> {reservation.reservationStatus === "CONFIRM" ? "승인" :
                    reservation.reservationStatus === "PENDING" ? "관리자 확인 중" :
                        reservation.reservationStatus === "REJECTED" ? "거절됨" :
                            "알 수 없음"
                }
                </Info>
            </InfoContainer>
            <CancelButton onClick={() => handleCancel(reservation.itemId)} disabled={loading}>
                {loading ? "취소 중..." : "예약 취소"}
            </CancelButton>
        </ReservationItemWrapper>
    );
};


//styled components

const ReservationItemWrapper = styled.div`
    width: 90%;
    max-width: 400px;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
`;

const InfoContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Info = styled.div`
    font-size: 14px;
    color: #333;
`;

const CancelButton = styled.button`
    background: #ff4d4f;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
    width: 100%;
    max-width: 120px;

    &:hover {
        background: #d9363e;
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
`;

export default ReservationItem;
