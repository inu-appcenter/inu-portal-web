import styled from "styled-components";


import ImageBox from "../ImageBox.tsx";
import DefaultImage from "../../../../../resources/assets/rental/DefaultImage.svg";
import ReservationList from "./ReservationListWrapper.tsx";
import {Items} from "apis/rental.ts";
import {Reservation} from "apis/rentalAdmin.ts";


interface ItemCardProps {
    index: number;
    item: Items;
    handleClickItem: (item: Items) => void;
    reservations: { [key: number]: Reservation[] };
    handleEditReservation: (reservationId: number) => void;
}


const ItemCard = ({index, item, handleClickItem, reservations, handleEditReservation}: ItemCardProps) => {

    return (
        <ItemCardWrapper key={index}>
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
            <div style={{width: "50%"}}>
                <ImageBox
                    key={`${item.id}-${item.modifiedDate}`} // key 추가로 강제 리렌더링
                    src={`https://portal.inuappcenter.kr/images/item/thumbnail/${item.id}?cache_bust=${item.modifiedDate}`}
                    alt={DefaultImage}
                />


            </div>


            {/* 예약 리스트 표시 */}
            {item.id !== undefined && reservations[item.id] && reservations[item.id].length > 0 && (
                <ReservationList reservations={reservations} item={item}
                                 handleEditReservation={handleEditReservation}/>
            )}
        </ItemCardWrapper>
    )
}


export default ItemCard;


const ItemCardWrapper = styled.div`
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    position: relative;
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