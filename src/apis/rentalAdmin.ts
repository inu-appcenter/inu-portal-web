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


//물품 등록
export const addItem = async (
    item: Items,
): Promise<ApiResponse<Pagination<Items[]>>> => {
    try {
        const response = await tokenInstance.post<ApiResponse<Pagination<Items[]>>>(
            "/api/items",
            {
                itemCategory: item.itemCategory,
                name: item.name,
                totalQuantity: item.totalQuantity,
                deposit: item.deposit,
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
    item: Items
): Promise<ApiResponse<Pagination<Items[]>>> => {
    try {
        const response = await tokenInstance.put<ApiResponse<Pagination<Items[]>>>(
            `/api/items/${itemId}`,
            {
                itemCategory: item.itemCategory,
                name: item.name,
                totalQuantity: item.totalQuantity,
                deposit: item.deposit,
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