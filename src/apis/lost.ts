import axiosInstance from "./axiosInstance";
import { ApiResponse, Pagination } from "types/common";
import tokenInstance from "./tokenInstance";
import { Lost, LostSummary } from "types/lost";

// 분실물 리스트 조회
export const getLostList = async (
  page: number
): Promise<ApiResponse<Pagination<LostSummary[]>>> => {
  const params: { [key: string]: string | number } = {
    page,
  };
  const response = await axiosInstance.get<
    ApiResponse<Pagination<LostSummary[]>>
  >("/api/lost", { params });
  return response.data;
};

// 분실물 상세 조회
export const getLostDetail = async (
  lostId: number
): Promise<ApiResponse<Lost>> => {
  const response = await axiosInstance.get<ApiResponse<Lost>>(
    `/api/lost/${lostId}`
  );
  return response.data;
};

// 분실물 저장
export const postLost = async (
  name: string,
  content: string,
  images: File[]
): Promise<ApiResponse<number>> => {
  const jsonData = {
    name,
    content,
  };

  const formData = new FormData();

  const jsonBlob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  formData.append("request", jsonBlob);
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/lost`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// 분실물 수정
export const putLost = async (
  lostId: number,
  name: string,
  content: string,
  images: File[]
): Promise<ApiResponse<number>> => {
  const jsonData = {
    name,
    content,
  };

  const formData = new FormData();

  const jsonBlob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  formData.append("request", jsonBlob);
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/lost/${lostId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// 분실물 삭제
export const deleteLost = async (
  lostId: number
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/lost/${lostId}`
  );
  return response.data;
};
