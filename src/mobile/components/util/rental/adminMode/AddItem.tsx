import {SubmitHandler, useForm} from "react-hook-form";
import {addItem} from "apis/rentalAdmin.ts";
import styled from "styled-components";
import React, {useState} from "react";

import {ItemFormValues} from "apis/rentalAdmin.ts";


const AddItem = () => {
    const [images, setImages] = useState<File[]>([]); // 이미지 파일 상태 추가

    // useForm에 타입 지정
    const {register, handleSubmit, reset} = useForm<ItemFormValues>();

    // 이미지 파일 선택 함수
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setImages(Array.from(files));
        }
    };

    const onSubmit: SubmitHandler<ItemFormValues> = async (data) => {

        try {
            const response = await addItem(data, images);  // FormData 전송
            console.log("물품 등록 성공:", response);
            alert(response.msg); // 서버 응답 메시지
            // 등록 성공 시 폼 초기화
            reset();  // 폼 내용 초기화
            setImages([]);  // 이미지 상태 초기화
        } catch (error) {
            console.error("물품 등록 실패:", error);
            alert("물품 등록 실패");
        }
    };


    return (
        <AddItemWrapper>
            <h2>아이템 추가</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="itemCategory">카테고리</label>
                    <select
                        id="itemCategory"
                        {...register("itemCategory")}
                        defaultValue="broadcast_equipment"
                    >
                        <option value="BROADCAST_EQUIPMENT">방송 장비</option>
                        <option value="TENT">천막</option>
                        <option value="SPORTS_EQUIPMENT">체육물품</option>
                        <option value="OTHER">기타</option>

                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="name">이름</label>
                    <input
                        id="name"
                        type="text"
                        {...register("name")}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="totalQuantity">총 수량</label>
                    <input
                        id="totalQuantity"
                        type="number"
                        {...register("totalQuantity")}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="deposit">보증금</label>
                    <input
                        id="deposit"
                        type="number"
                        {...register("deposit")}
                        required
                    />
                </div>
                {/* 이미지 업로드 섹션 추가 */}
                <div className="form-group">
                    <label htmlFor="images">이미지 업로드</label>
                    <input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                    />
                </div>
                <button type="submit">추가하기</button>
            </form>
        </AddItemWrapper>
    );
};

// styled components
const AddItemWrapper = styled.div`
    width: 90%;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h2 {
        font-size: 1.5rem;
        margin-bottom: 20px;
        text-align: center;
    }

    .form-group {
        margin-bottom: 15px;

        label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
        }

        input,
        select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
    }

    button {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;

        &:hover {
            background-color: #0056b3;
        }
    }
`;

export default AddItem;
