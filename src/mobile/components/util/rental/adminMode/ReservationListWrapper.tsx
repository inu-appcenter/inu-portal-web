import styled from "styled-components";
import {Reservation} from "apis/rentalAdmin.ts";
import {Items} from "apis/rental.ts";


interface ReservationListProps {
    reservations: { [key: number]: Reservation[] };
    item: Items;
    handleEditReservation: (selectedReservationId: number) => void;
}

const ReservationList = ({reservations, item, handleEditReservation}: ReservationListProps) => {

    return (
        <ReservationListWrapper>
            <h4>예약 목록</h4>
            <ul>
                {reservations[item.id].map((reservation, idx) => (
                    <li key={idx}>
                        <div>
                            대여 날짜: {new Date(reservation.startDateTime).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        </div>
                        <div>
                            반납 날짜: {new Date(reservation.endDateTime).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        </div>
                        <div>예약자 학번: {reservation.studentId}</div>
                        <div>예약자 전화번호: {reservation.phoneNumber}</div>

                        <div>상태: {reservation.reservationStatus === "CONFIRM" ? "승인" :
                            reservation.reservationStatus === "PENDING" ? "관리자 확인 중" :
                                reservation.reservationStatus === "CANCELED" ? "거절됨" :
                                    "알 수 없음"
                        }</div>
                        <div>예약번호: {reservation.reservationId}</div>


                        {/* 수정 및 삭제 버튼 추가 */}
                        <ButtonWrapper>
                            <StyledButton
                                onClick={() => handleEditReservation(reservation.reservationId)}>
                                승인 관리
                            </StyledButton>
                        </ButtonWrapper>
                    </li>
                ))}
            </ul>
        </ReservationListWrapper>
    )
}

export default ReservationList;


const ReservationListWrapper = styled.div`
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

    &:hover {
        background-color: #0056b3;
    }

    &:focus {
        outline: none;
    }`
;
