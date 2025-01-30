import {useEffect, useState} from "react";
import {BottomSheet} from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";
import 신난횃불이 from "resources/assets/rental/신난횃불이.png";
import {Items, getItemDetail} from "apis/rental.ts";

interface ItemDetailProps {
    itemId: number;
    onClose: () => void;
}


export default function ItemDetail({itemId, onClose}: ItemDetailProps) {
    const [itemDetail, setItemDetail] = useState<Items | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchItemDetail = async () => {
            try {
                const data = await getItemDetail(itemId); // API 호출
                setItemDetail(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchItemDetail();
    }, [itemId]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <BottomSheet open={true} onDismiss={onClose}>
            <DetailWrapper>
                <h2>{itemDetail?.name}</h2>
                <p>대여료: {itemDetail?.deposit}</p>
                <p>남은 수량: {itemDetail?.totalQuantity}</p>
                <img src={신난횃불이} alt="물품 이미지"/>
                <ButtonWrapper>
                    <button>대여하기</button>
                </ButtonWrapper>
            </DetailWrapper>
        </BottomSheet>
    );
}

const DetailWrapper = styled.div`
    padding: 16px;
    margin-bottom: 80px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    h2 {
        margin: 0;
    }

    p {
        margin: 4px 0;
    }

    img {
        width: 80px;
    }
`;

const ButtonWrapper = styled.div`
    display: flex;
    gap: 8px;

    button {
        padding: 8px 16px;
        font-size: 14px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:first-child {
        background-color: #007bff;
        color: white;
    }

    button:nth-child(2) {
        background-color: #ffc107;
    }

    button:last-child {
        background-color: #dc3545;
        color: white;
    }
`;
