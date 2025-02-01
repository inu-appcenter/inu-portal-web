import {useState, useEffect} from "react";
import {getReservations, Reservation, ReservationContent} from "apis/rental";  // getReservations 함수 임포트
import ReservationItem from "./ReservationItem";  // ReservationItem 컴포넌트 임포트
import styled from "styled-components";

const ReservationList = () => {
    const [reservations, setReservations] = useState<ReservationContent[]>([]);  // ReservationContent 배열로 타입 설정
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                // @ts-ignore
                const data: ApiResponse<Reservation> = await getReservations(1);  // 첫 페이지 예약 목록 가져오기
                console.log(data);
                setReservations(data.contents);  // 유효한 배열이면 상태 업데이트

            } catch (error) {
                console.error("예약 목록을 가져오는 중 오류 발생:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    if (loading) {
        return <p>로딩 중...</p>;
    }

    return (
        <ReservationListWrapper>
            {reservations && (  // reservations 배열이 비어 있지 않은지 확인
                reservations.map((reservation) => (
                    <ReservationItem key={reservation.itemId} reservation={reservation}/>
                ))
            )}
        </ReservationListWrapper>
    );
};

const ReservationListWrapper = styled.div`
    width: 100%;
    height: 100%;
`;

export default ReservationList;
