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
                await updateItem(item.id, formData, null);
                alert("수정되었습니다.");
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
                        alert("삭제되었습니다.");
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
                    <Label>
                        이름
                        <Input type="text" name="name" value={formData.name} onChange={handleChange}/>
                    </Label>
                    <Label>
                        카테고리
                        <Select name="itemCategory" value={formData.itemCategory} onChange={handleChange}>
                            <option value="broadcast_equipment">방송 장비</option>
                            <option value="tent">천막</option>
                            <option value="sports_equipment">체육물품</option>
                            <option value="other">기타</option>
                        </Select>
                    </Label>
                    <Label>
                        수량
                        <Input type="number" name="totalQuantity" value={formData.totalQuantity}
                               onChange={handleChange}/>
                    </Label>
                    <Label>
                        보증금
                        <Input type="number" name="deposit" value={formData.deposit} onChange={handleChange}/>
                    </Label>
                </Form>
                <Buttons>
                    <CancelButton onClick={onClose}>취소</CancelButton>
                    <SaveButton onClick={handleSave}>저장</SaveButton>
                    <DeleteButton onClick={handleDelete}>삭제</DeleteButton>
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
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    width: 420px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Label = styled.label`
    font-weight: 500;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Input = styled.input`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
    width: 100%;
`;

const Select = styled.select`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
    width: 100%;
`;

const Buttons = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
`;

const Button = styled.button`
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
        opacity: 0.8;
    }
`;

const CancelButton = styled(Button)`
    background: #ccc;
`;

const SaveButton = styled(Button)`
    background: #007bff;
    color: white;
`;

const DeleteButton = styled(Button)`
    background: #dc3545;
    color: white;
`;

export default EditItemModal;