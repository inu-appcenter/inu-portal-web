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


export const getItemDetail = async (itemId: number): Promise<ApiResponse<Items>> => {
    const response = await tokenInstance.get<ApiResponse<Items>>(
        `/api/items/${itemId}`
    );
    return response.data;
};