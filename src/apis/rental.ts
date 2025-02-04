// import axiosInstance from "./axiosInstance";
import {ApiResponse, Pagination} from "types/common";
import tokenInstance from "./tokenInstance";
import {SetStateAction} from "react";

export interface Items {
    id?: number;
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


// 예약 등록
export const createReservation = async (
    itemId: number,
    reservationData: { startDateTime: string, endDateTime: string }
): Promise<ApiResponse<Pagination>> => {
    try {
        console.log("에약일자", reservationData);
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

// export const createReservation = async (itemId, {startDateTime, endDateTime}) => {
//     try {
//         // 예약 요청
//         const response = await tokenInstance.post(`/api/reservations/${itemId}`, {
//             startDateTime,
//             endDateTime,
//         });
//
//         return response.data;
//     } catch (error) {
//         // @ts-ignore
//         if (error.response && error.response.status === 401) {
//             //@ts-ignore
//             throw new Error(error.response.data.msg || "만료된 토큰입니다.");
//         }
//         throw new Error("예약 등록 실패");
//     }
// };


// 예약 목록 조회
export const getReservations = async (page: number = 1): Promise<ApiResponse<Reservation>> => {
    const response = await tokenInstance.get<ApiResponse<Reservation>>(
        `/api/reservations?page=${page}`
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

