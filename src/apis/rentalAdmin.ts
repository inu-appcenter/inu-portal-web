// import axiosInstance from "./axiosInstance";
import {ApiResponse, Pagination} from "types/common";
import tokenInstance from "./tokenInstance";

import {Items} from "apis/rental.ts";


export {getItemsList} from "apis/rental.ts";

// 예약 데이터 타입 정의
interface Reservation {
    memberId: string;
    startDateTime: string;
    endDateTime: string;
    reservationStatus: string;
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
    item: ItemFormValues,
    images: string[], // 이미지 URL 리스트를 추가합니다.
): Promise<ApiResponse<any>> => {
    try {
        const response = await tokenInstance.post<ApiResponse<any>>(
            "/api/items",
            {
                itemRegister: {
                    itemCategory: item.itemCategory,
                    name: item.name,
                    totalQuantity: item.totalQuantity,
                    deposit: item.deposit,
                },
                images: images, // 이미지 목록을 추가합니다.
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error during item registration:", error);
        throw error;
    }
};


export const updateItem = async (
    itemId: number,
    item: { itemCategory: string, name: string, totalQuantity: number, deposit: number },
    images: string[] | null // 이미지 배열을 추가
): Promise<ApiResponse<Pagination<Items[]>>> => {
    try {
        const response = await tokenInstance.put<ApiResponse<Pagination<Items[]>>>(
            `/api/items/${itemId}`, // itemId를 URL 파라미터로 보냄
            {
                itemUpdate: {
                    itemCategory: item.itemCategory,
                    name: item.name,
                    totalQuantity: item.totalQuantity,
                    deposit: item.deposit
                },
                images: images // 이미지 배열을 추가
            },
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
