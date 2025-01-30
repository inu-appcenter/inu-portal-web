import {useState} from "react";
import styled from "styled-components";
import {updateItem, deleteItem} from "apis/rentalAdmin.ts";
import {Items} from "apis/rental.ts";

const EditItemModal = ({item, onClose, onSave}: {
    item: Items,
    onClose: () => void,
    onSave: () => void,
}) => {
    const [formData, setFormData] = useState({
        itemCategory: item.itemCategory,
        name: item.name,
        totalQuantity: item.totalQuantity,
        deposit: item.deposit,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSave = async () => {
        try {
            if (item.id != null) {
                await updateItem(item.id, formData);
            }
            onSave(); // 리스트 갱신
            onClose();
        } catch (error) {
            console.error("수정 중 오류 발생:", error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("정말로 삭제하시겠습니까?")) {
            try {
                if (item.id != null) {
                    await deleteItem(item.id);
                }
                onSave(); // 리스트 갱신
                onClose();
            } catch (error) {
                console.error("삭제 중 오류 발생:", error);
            }
        }
    };

    return (
        <ModalOverlay>
            <ModalContent>
                <h2>물품 수정</h2>
                <Form>
                    <label>
                        이름
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        카테고리
                        <select
                            name="itemCategory"
                            value={formData.itemCategory}
                            onChange={handleChange}
                        >
                            <option value="broadcast_equipment">방송 장비</option>
                            <option value="tent">천막</option>
                            <option value="sports_equipment">체육물품</option>
                            <option value="other">기타</option>
                        </select>
                    </label>

                    <label>
                        수량
                        <input
                            type="number"
                            name="totalQuantity"
                            value={formData.totalQuantity}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        보증금
                        <input
                            type="number"
                            name="deposit"
                            value={formData.deposit}
                            onChange={handleChange}
                        />
                    </label>
                </Form>
                <Buttons>
                    <button onClick={onClose}>취소</button>
                    <button onClick={handleSave}>저장</button>
                    <button onClick={handleDelete} style={{color: "red"}}>삭제</button>
                </Buttons>
            </ModalContent>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Buttons = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
`;

export default EditItemModal;
