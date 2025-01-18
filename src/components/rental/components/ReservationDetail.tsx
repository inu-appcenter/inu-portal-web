import React, {useState} from "react";
import styled from "styled-components";

interface Reservation {
    reservationId: number;
    itemId: number;
    startDateTime: string;
    endDateTime: string;
    memberId: number;
}

const dummyReservation: Reservation = {
    reservationId: 1,
    itemId: 101,
    startDateTime: "2025-01-18T09:00:00Z",
    endDateTime: "2025-01-18T11:00:00Z",
    memberId: 201,
};

const Container = styled.div`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: ${({theme}) => theme.colors.background};
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  color: ${({theme}) => theme.colors.primary};
`;

const Info = styled.p`
  margin: 10px 0;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: ${({theme}) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ReservationDetail: React.FC = () => {
    const [reservation] = useState(dummyReservation);

    return (
        <Container>
            <Title>예약 상세 정보</Title>
            <Info>예약 ID: {reservation.reservationId}</Info>
            <Info>물품 ID: {reservation.itemId}</Info>
            <Info>시작 시간: {reservation.startDateTime}</Info>
            <Info>종료 시간: {reservation.endDateTime}</Info>
            <Info>회원 ID: {reservation.memberId}</Info>
            <Button>예약 취소</Button>
        </Container>
    );
};

export default ReservationDetail;
