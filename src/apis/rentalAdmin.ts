// import axiosInstance from "./axiosInstance";
import {ApiResponse, Pagination} from "types/common";
import tokenInstance from "./tokenInstance";

import {Items} from "apis/rental.ts";


export {getItemsList} from "apis/rental.ts";

// 예약 데이터 타입 정의
export interface Reservation {
    reservationId: number;
    memberId: string;
    startDateTime: string;
    endDateTime: string;
    reservationStatus: string;
    studentId: string;
    phoneNumber: number;

}

// 폼 데이터 타입 정의
export interface ItemFormValues {
    itemCategory: string;
    name: string;
    totalQuantity: number;
    deposit: number;
}


//물품 등록
export const addItem = async (
    data: ItemFormValues,
    images: File[], // 이미지 URL 리스트를 추가합니다.
): Promise<ApiResponse<number>> => {

    const {itemCategory, name, totalQuantity, deposit} = data;


    const jsonData = {
        itemCategory,
        name,
        totalQuantity,
        deposit
    };
    console.log(jsonData);
    const formData = new FormData();

    const jsonBlob = new Blob([JSON.stringify(jsonData)], {
        type: "application/json",
    });
    formData.append("itemRegister", jsonBlob);
    images.forEach((image) => formData.append("images", image));

    formData.forEach((value, key) => {
        console.log(`${key}:`, value);
    });


    const response = await tokenInstance.post<ApiResponse<number>>(
        `/api/items`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response.data;
};


export const updateItem = async (
    itemId: number,
    item: { itemCategory: string; name: string; totalQuantity: number; deposit: number },
    images: File[] | null
): Promise<ApiResponse<Pagination<Items[]>>> => {
    try {
        // JSON 데이터 준비
        const jsonData = {
            itemCategory: item.itemCategory,
            name: item.name,
            totalQuantity: item.totalQuantity,
            deposit: item.deposit,
        };

        const formData = new FormData();

        // JSON 데이터를 Blob으로 변환하여 FormData에 추가
        const jsonBlob = new Blob([JSON.stringify(jsonData)], {
            type: "application/json",
        });
        formData.append("itemUpdate", jsonBlob);

        // 이미지 배열이 있으면 FormData에 추가
        images?.forEach((image) => {
            formData.append("images", image)
        });


        // 디버깅: FormData 내용 출력
        formData.forEach((value, key) => {
            console.log(`${key}:`, value);
        });

        // PUT 요청으로 FormData 전송
        const response = await tokenInstance.put<ApiResponse<Pagination<Items[]>>>(
            `/api/items/${itemId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log(response);
        return response.data;
    } catch (error) {
        console.error("Error during item update:", error);
        throw error;
    }
};


export const deleteItem = async (itemId: number): Promise<ApiResponse<{}>> => {
    try {
        const response = await tokenInstance.delete<ApiResponse<{}>>(
            `/api/items/${itemId}`
        );
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("Error during item deletion:", error);
        throw error;
    }
};


// 아이템별 예약 목록 조회 함수
export const getItemReservations = async (itemId: number, page: number = 1): Promise<ApiResponse<Reservation[]>> => {
    const response = await tokenInstance.get<ApiResponse<Reservation[]>>(
        `/api/reservations/item/${itemId}?page=${page}`,
    );
    return response.data;
};


// 예약 상태 변경 함수
export const setConfirmReject = async (
    reservationId: number | null, // 예약 ID
    status: string // 상태 (CONFIRM 또는 REJECTED)
): Promise<ApiResponse<any>> => {
    try {
        // API 요청
        const response = await tokenInstance.post<ApiResponse<any>>(
            `/api/reservations/${reservationId}/confirm`,
            null, // 요청 본문은 없으므로 null
            {
                params: {status}, // query parameter로 status 값 전달
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error during reservation status update:", error);
        throw error;
    }
};
