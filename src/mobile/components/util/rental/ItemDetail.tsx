import {useEffect, useState} from "react";
import {BottomSheet} from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";
import 신난횃불이 from "resources/assets/rental/신난횃불이.png";
import {getItemDetail, createReservation, Items} from "apis/rental.ts"; // API 호출 함수 가져오기

interface ItemDetailProps {
    itemId: number;
    onClose: () => void;
}

export default function ItemDetail({itemId, onClose}: ItemDetailProps) {
    const [itemDetail, setItemDetail] = useState<Items | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [reservationLoading, setReservationLoading] = useState<boolean>(false);
    const [reservationError, setReservationError] = useState<string | null>(null);

    useEffect(() => {
        const fetchItemDetail = async () => {
            try {
                const data = await getItemDetail(itemId); // API 호출
                setItemDetail(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchItemDetail();
    }, [itemId]);

    const handleReservation = async () => {
        if (!startDate || !endDate) {
            alert("시작 날짜와 종료 날짜를 입력해주세요.");
            return;
        }

        try {
// 현재 시간에 9시간을 더하여 한국 시간으로 변환
            const koreaTimeOffset = 9 * 60; // 한국은 UTC보다 9시간 빠름
            const formattedStartDate = new Date(new Date(startDate).getTime() + koreaTimeOffset * 60 * 1000).toISOString();
            const formattedEndDate = new Date(new Date(endDate).getTime() + koreaTimeOffset * 60 * 1000).toISOString();

            setReservationLoading(true);
            setReservationError(null);

// 예약 요청
            await createReservation(itemId, {
                startDateTime: formattedStartDate,
                endDateTime: formattedEndDate
            });


            alert("예약이 성공적으로 등록되었습니다.");
            onClose(); // 바텀시트 닫기
        } catch (err) {
            setReservationError(err instanceof Error ? err.message : "예약 중 오류가 발생했습니다.");
        } finally {
            setReservationLoading(false);
        }
    };


    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <BottomSheet open={true} onDismiss={onClose}>
            <DetailWrapper>
                <h2>{itemDetail?.name}</h2>
                <p>대여료: {itemDetail?.deposit}</p>
                <p>남은 수량: {itemDetail?.totalQuantity}</p>
                <img src={신난횃불이} alt="물품 이미지"/>
                <InputWrapper>
                    <label>
                        시작 날짜:
                        <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </label>
                    <label>
                        종료 날짜:
                        <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </label>
                </InputWrapper>
                {reservationError && <ErrorText>{reservationError}</ErrorText>}
                <ButtonWrapper>
                    <button onClick={handleReservation} disabled={reservationLoading}>
                        {reservationLoading ? "처리 중..." : "대여하기"}
                    </button>
                </ButtonWrapper>
            </DetailWrapper>
        </BottomSheet>
    );
}

const DetailWrapper = styled.div`
    padding: 16px;
    margin-bottom: 80px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    h2 {
        margin: 0;
    }

    p {
        margin: 4px 0;
    }

    img {
        width: 80px;
    }
`;

const InputWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;

    label {
        font-size: 14px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    input {
        padding: 8px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
`;

const ButtonWrapper = styled.div`
    display: flex;
    gap: 8px;

    button {
        padding: 8px 16px;
        font-size: 14px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:first-child {
        background-color: #007bff;
        color: white;
    }
`;

const ErrorText = styled.div`
    color: red;
    font-size: 14px;
`;
