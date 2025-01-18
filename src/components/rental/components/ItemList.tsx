import React, {useState} from "react";
import {Link} from "react-router-dom";


interface Item {
    id: number;
    name: string;
    itemCategory: string;
    availableQuantity: number;
}

const dummyItems: Item[] = [
    {
        id: 1,
        name: "노트북",
        itemCategory: "전자기기",
        availableQuantity: 5,
    },
    {
        id: 2,
        name: "프로젝터",
        itemCategory: "전자기기",
        availableQuantity: 2,
    },
];

const ItemList: React.FC = () => {
    const [items] = useState(dummyItems);

    return (
        <div>
            <h1>물품 리스트</h1>
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <Link to={`/items/${item.id}`}>
                            {`ID: ${item.id}, Name: ${item.name}, Category: ${item.itemCategory}`}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ItemList;
