import React, {useState} from "react";
import styled from "styled-components";
import {Link} from "react-router-dom";

interface Reservation {
    reservationId: number;
    itemId: number;
    startDateTime: string;
    endDateTime: string;
    memberId: number;
}

const dummyReservations: Reservation[] = [
    {
        reservationId: 1,
        itemId: 101,
        startDateTime: "2025-01-18T09:00:00Z",
        endDateTime: "2025-01-18T11:00:00Z",
        memberId: 201,
    },
    {
        reservationId: 2,
        itemId: 102,
        startDateTime: "2025-01-19T14:00:00Z",
        endDateTime: "2025-01-19T16:00:00Z",
        memberId: 202,
    },
];

const Container = styled.div`
    max-width: 800px;
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

const List = styled.ul`
    list-style: none;
    padding: 0;
`;

const ListItem = styled.li`
    padding: 10px;
    margin: 10px 0;
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: 4px;
    background-color: ${({theme}) => theme.colors.secondary};
    transition: background-color 0.3s;

    &:hover {
        background-color: ${({theme}) => theme.colors.primary};
        color: white;

        a {
            color: white;
        }
    }
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    color: ${({theme}) => theme.colors.text};
`;

const ReservationList: React.FC = () => {
    const [reservations] = useState(dummyReservations);

    return (
        <Container>
            <Title>예약 리스트</Title>
            <List>
                {reservations.map((reservation) => (
                    <ListItem key={reservation.reservationId}>
                        <StyledLink to={`/reservations/${reservation.reservationId}`}>
                            {`예약 ID: ${reservation.reservationId}, 물품 ID: ${reservation.itemId}`}
                        </StyledLink>
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default ReservationList;
