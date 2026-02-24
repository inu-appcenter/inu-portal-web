import axiosInstance from "./axiosInstance";
import { ApiResponse, Pagination } from "@/types/common";
import tokenInstance from "./tokenInstance";
import { Petition, PetitionSummary } from "@/types/petitions";
import { AxiosError } from "axios";

// 총학생회 청원 리스트 가져오기
export const getPetitionsList = async (
  page: number,
): Promise<ApiResponse<Pagination<PetitionSummary[]>>> => {
  const params: { [key: string]: string | number } = {
    page,
  };

  try {
    // 1) 우선 tokenInstance로 시도
    const response = await tokenInstance.get<
      ApiResponse<Pagination<PetitionSummary[]>>
    >("/api/petitions", { params });
    return response.data;
  } catch (error) {
    // 2) refreshError라면 axiosInstance로 재시도
    const typedError = error as AxiosError & { isRefreshError?: boolean };
    if (typedError.isRefreshError) {
      // 인증이 완전히 만료된 상태이므로, 비로그인(axiosInstance) 요청
      const response = await axiosInstance.get<
        ApiResponse<Pagination<PetitionSummary[]>>
      >("/api/petitions", { params });
      return response.data;
    }
    throw error; // 그 외 에러는 그대로 상위로 던짐
  }
};

// 총학생회 청원 가져오기
export const getPetitionsDetail = async (
  petitionId: number,
): Promise<ApiResponse<Petition>> => {
  try {
    // 1) 우선 tokenInstance로 시도
    const response = await tokenInstance.get<ApiResponse<Petition>>(
      `/api/petitions/${petitionId}`,
    );
    return response.data;
  } catch (error) {
    // 2) refreshError라면 axiosInstance로 재시도
    const typedError = error as AxiosError & { isRefreshError?: boolean };
    if (typedError.isRefreshError) {
      // 인증이 완전히 만료된 상태이므로, 비로그인(axiosInstance) 요청
      const response = await axiosInstance.get<ApiResponse<Petition>>(
        `/api/petitions/${petitionId}`,
      );
      return response.data;
    }
    throw error; // 그 외 에러는 그대로 상위로 던짐
  }
};

// 총학생회 청원 등록
export const postPetitions = async (
  title: string,
  content: string,
  isPrivate: boolean,
  images: File[],
): Promise<ApiResponse<number>> => {
  const jsonData = {
    title,
    content,
    isPrivate,
  };

  const formData = new FormData();
  images.forEach((image) => formData.append("images", image));

  const jsonBlob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  formData.append("petitionRequestDto", jsonBlob);

  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/petitions`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// 총학생회 청원 수정
export const putPetitions = async (
  petitionId: number,
  title: string,
  content: string,
  isPrivate: boolean,
  images: File[],
): Promise<ApiResponse<number>> => {
  const jsonData = {
    title,
    content,
    isPrivate,
  };

  const formData = new FormData();

  const jsonBlob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  formData.append("petitionRequestDto", jsonBlob);
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/petitions/${petitionId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// 총학생회 청원 삭제
export const deletePetitions = async (
  petitionId: number,
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/petitions/${petitionId}`,
  );
  return response.data;
};

// 총학생회 청원 여부 변경
export const putLike = async (
  petitionId: number,
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/petitions/${petitionId}/like`,
  );
  return response.data;
};
