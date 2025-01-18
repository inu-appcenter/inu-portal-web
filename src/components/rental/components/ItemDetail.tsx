import React, {useState} from "react";

interface Item {
    id: number;
    name: string;
    itemCategory: string;
    totalQuantity: number;
    availableQuantity: number;
    deposit: number;
}

const dummyItem: Item = {
    id: 1,
    name: "노트북",
    itemCategory: "전자기기",
    totalQuantity: 10,
    availableQuantity: 5,
    deposit: 10000,
};

const ItemDetail: React.FC = () => {
    const [item] = useState(dummyItem);

    return (
        <div>
            <h1>물품 상세 정보</h1>
            <p>물품 ID: {item.id}</p>
            <p>물품 이름: {item.name}</p>
            <p>카테고리: {item.itemCategory}</p>
            <p>총 수량: {item.totalQuantity}</p>
            <p>남은 수량: {item.availableQuantity}</p>
            <p>보증금: {item.deposit}</p>
        </div>
    );
};

export default ItemDetail;
