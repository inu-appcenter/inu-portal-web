// import axiosInstance from "./axiosInstance";
import { ApiResponse, Pagination } from "types/common";
import tokenInstance from "./tokenInstance";
import { Petition, PetitionSummary } from "types/petitions";

// 총학생회 청원 리스트 가져오기
export const getPetitionsList = async (
  page: number
): Promise<ApiResponse<Pagination<PetitionSummary[]>>> => {
  const params: { [key: string]: string | number } = {
    page,
  };
  const response = await tokenInstance.get<
    ApiResponse<Pagination<PetitionSummary[]>>
  >("/api/petitions", { params });
  return response.data;
};

// 총학생회 청원 가져오기
export const getPetitionsDetail = async (
  petitionId: number
): Promise<ApiResponse<Petition>> => {
  const response = await tokenInstance.get<ApiResponse<Petition>>(
    `/api/petitions/${petitionId}`
  );
  return response.data;
};

// 총학생회 청원 등록
export const postPetitions = async (
  title: string,
  content: string,
  isPrivate: boolean,
  images: File[]
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
    }
  );
  return response.data;
};

// 총학생회 청원 수정
export const putPetitions = async (
  petitionId: number,
  title: string,
  content: string,
  isPrivate: boolean,
  images: File[]
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
    }
  );
  return response.data;
};

// 총학생회 청원 삭제
export const deletePetitions = async (
  petitionId: number
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/petitions/${petitionId}`
  );
  return response.data;
};
