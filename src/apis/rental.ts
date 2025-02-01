// import axiosInstance from "./axiosInstance";
import {ApiResponse} from "types/common";
import tokenInstance from "./tokenInstance";
import {SetStateAction} from "react";

export interface Items {
    id?: number;
    itemCategory: string;
    name: string;
    totalQuantity: number;
    deposit: number;

}


//물품 리스트 조회
export const getItemsList = async (): Promise<ApiResponse<SetStateAction<Items[]>>> => {
    const response = await tokenInstance.get<ApiResponse<SetStateAction<Items[]>>>(
        "/api/items"
    );
    return response.data;
};


//아이템 세부 정보 조회
export const getItemDetail = async (itemId: number): Promise<ApiResponse<Items>> => {
    const response = await tokenInstance.get<ApiResponse<Items>>(
        `/api/items/${itemId}`
    );
    return response.data;
};


// 예약을 생성하는 API 호출 함수
export const createReservation = async (
    itemId: number,
    reservationData: { startDateTime: string, endDateTime: string }
): Promise<ApiResponse<any>> => {
    console.log(reservationData);
    try {
        const response = await tokenInstance.post<ApiResponse<any>>(
            `/api/reservations/${itemId}`,
            reservationData,
            {
                headers: {
                    "accept": "*/*",
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("예약 등록 실패");
    }
};


// 예약 목록 조회
export const getReservations = async (page: number = 1): Promise<ApiResponse<SetStateAction<any[]>>> => {
    const response = await tokenInstance.get<ApiResponse<SetStateAction<any[]>>>(
        `/api/reservations?page=${page}`,
    );
    return response.data;
};


// 예약 취소
export const deleteReservation = async (itemId: number): Promise<void> => {
    try {
        await tokenInstance.delete(`/api/reservations/item/${itemId}`, {
            headers: {
                "accept": "*/*",
                "Content-Type": "application/json",
            },
        });
        console.log("예약이 취소되었습니다.");
    } catch (error) {
        console.error("예약 취소 중 오류 발생:", error);
    }
};

