import {useEffect, useState} from "react";
import styled from "styled-components";

import {Items} from "apis/rental.ts";
import {getItemsList} from "apis/rentalAdmin.ts";
import EditItem from "./EditItem";

// ItemList 컴포넌트
const ItemListAdmin = () => {
    const [items, setItems] = useState<Items[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedItem, setSelectedItem] = useState<Items | null>(null);
    const [isChanged, setIsChanged] = useState<boolean>(true);

    useEffect(() => {
        // 데이터 로드
        const fetchItems = async () => {
            try {
                const data = await getItemsList();
                setItems(data.data); // Pagination 형식일 경우 items 추출
            } catch (error) {
                console.error("데이터를 가져오는 중 오류 발생:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [isChanged]);

    if (loading) {
        return <p>로딩 중...</p>;
    }

    const handleClickItem = (item: Items) => {
        setSelectedItem(item);
    }

    return (
        <ItemListWrapper>
            {items.map((item, index) => (
                <ItemCard key={index} onClick={() => {
                    handleClickItem(item);
                }}>
                    <ItemInfo>
                        <ItemName>{item.name}</ItemName>
                        <ItemCategory>{item.itemCategory}</ItemCategory>
                    </ItemInfo>
                    <div>
                        <ItemQuantity>수량: {item.totalQuantity}</ItemQuantity>
                        <ItemDeposit>보증금: {item.deposit.toLocaleString()}원</ItemDeposit>
                    </div>
                </ItemCard>
            ))}
            {/*선택된 아이템의 세부사항을 바텀시트로 보여줌*/}
            {selectedItem && (
                <EditItem item={selectedItem} onClose={() => setSelectedItem(null)} onSave={() => {
                    setIsChanged(!isChanged)
                }}/>
            )}
        </ItemListWrapper>
    );
};

const ItemListWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ItemCard = styled.div`
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
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

export default ItemListAdmin;