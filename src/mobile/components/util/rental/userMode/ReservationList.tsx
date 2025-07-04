import { useState, useEffect } from "react";
import {
  getReservations,
  Reservation,
  ReservationContent,
} from "apis/rental.ts";
import ReservationItem from "./ReservationItem.tsx";
import styled from "styled-components";

const ReservationList = () => {
  const [reservations, setReservations] = useState<ReservationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // @ts-ignore
        const data: ApiResponse<Reservation> = await getReservations(1);
        console.log(data);
        setReservations(data.contents);
      } catch (error) {
        console.error("예약 목록을 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isChanged]);

  if (loading) {
    return <p>로딩 중...</p>;
  }

  return (
    <ReservationListWrapper>
      {reservations.length === 0 ? (
        <EmptyMessage>예약된 항목이 없습니다.</EmptyMessage>
      ) : (
        reservations.map((reservation) => (
          <ReservationItem
            key={reservation.itemId}
            reservation={reservation}
            setIsChanged={setIsChanged}
          />
        ))
      )}
    </ReservationListWrapper>
  );
};

const ReservationListWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const EmptyMessage = styled.p`
  text-align: center;
  margin-top: 2rem;
  color: #777;
  font-size: 1.1rem;
`;

export default ReservationList;
