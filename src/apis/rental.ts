// import axiosInstance from "./axiosInstance";
import {ApiResponse, Pagination} from "types/common";
import tokenInstance from "./tokenInstance";
import {SetStateAction} from "react";

export interface Items {
    id: number;
    itemCategory: string;
    name: string;
    totalQuantity: number;
    deposit: number;

}


export interface Reservation {
    pages: number;
    total: number;
    contents: ReservationContent[];
}

export interface ReservationContent {
    itemId: number;
    memberId: number;
    startDateTime: string;
    endDateTime: string;
    createdAt: string;
    reservationStatus: string;
}


// 물품 리스트 조회
export const getItemsList = async (): Promise<ApiResponse<SetStateAction<Items[]>>> => {
    try {
        const response = await tokenInstance.get<ApiResponse<SetStateAction<Items[]>>>(
            "/api/items"
        );
        return response.data;
    } catch (error) {
        console.error("물품 리스트 조회 중 오류 발생:", error);
        throw error; // 예외를 다시 던져서 호출한 곳에서 감지할 수 있도록 처리
    }
};

// 아이템 세부 정보 조회
export const getItemDetail = async (itemId: number): Promise<ApiResponse<Items>> => {
    try {
        const response = await tokenInstance.get<ApiResponse<Items>>(
            `/api/items/${itemId}`
        );
        return response.data;
    } catch (error) {
        console.error(`아이템 세부 정보 조회 중 오류 발생 (itemId: ${itemId}):`, error);
        throw error; // 예외를 다시 던짐
    }
};


// 예약 등록
export const createReservation = async (
    itemId: number,
    reservationData: { startDateTime: string, endDateTime: string, quantity: number, phoneNumber: string }
): Promise<ApiResponse<Pagination>> => {
    try {
        console.log("예약일자", reservationData);
        const response = await tokenInstance.post(
            `/api/reservations/${itemId}`,
            reservationData
        );
        return response.data;
    } catch (error) {
        console.error("Error during reservation creation:", error);
        throw error;
    }
};


// 예약 목록 조회
export const getReservations = async (page: number = 1): Promise<ApiResponse<Reservation>> => {
    try {
        const response = await tokenInstance.get<ApiResponse<Reservation>>(
            `/api/reservations?page=${page}`
        );
        return response.data;
    } catch (error) {
        console.error(`예약 목록 조회 중 오류 발생 (page: ${page}):`, error);
        throw error; // 예외를 다시 던져 호출한 곳에서 감지할 수 있도록 처리
    }
};


// 예약 취소
export const deleteReservation = async (itemId: number): Promise<void> => {
    try {
        console.log("삭제할 id: ", itemId);
        await tokenInstance.delete(`/api/reservations/${itemId}`, {
            headers: {
                "accept": "*/*",
                "Content-Type": "application/json",
            },
        });
        console.log("예약이 취소되었습니다.");
    } catch (error) {
        console.error("예약 취소 중 오류 발생:", error);
        throw error;
    }
};

