import {useState, useEffect} from "react";
import {getReservations} from "apis/rental";  // getReservations 함수 임포트
import ReservationItem from "./ReservationItem";  // ReservationItem 컴포넌트 임포트
import styled from "styled-components";

const ReservationList = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const data = await getReservations(1);  // 첫 페이지 예약 목록 가져오기
                setReservations(data.contents);
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

    // @ts-ignore
    return (
        <ReservationListWrapper>
            {reservations.length > 0 ? (
                reservations.map((reservation) => (
                    <ReservationItem key={reservation.itemId} reservation={reservation}/>
                ))
            ) : (
                <p>예약 목록이 없습니다.</p>
            )}
        </ReservationListWrapper>
    );
};

const ReservationListWrapper = styled.div`
    width: 100%;
    height: 100%;
`

export default ReservationList;
