import axiosInstance from "apis/axiosInstance";
import { ApiResponse, Pagination } from "types/common";
import { CouncilNotice } from "types/councilNotices";
import tokenInstance from "./tokenInstance";

// 총학생회 공지사항 리스트 가져오기
export const getCouncilNoticesList = async (
  sort: string,
  page: number
): Promise<ApiResponse<Pagination<CouncilNotice[]>>> => {
  const params: { [key: string]: string | number } = {
    sort,
    page,
  };
  const response = await axiosInstance.get<
    ApiResponse<Pagination<CouncilNotice[]>>
  >("/api/councilNotices", { params });
  return response.data;
};

// 총학생회 공지사항 가져오기
export const getCouncilNotices = async (
  councilNoticeId: number
): Promise<ApiResponse<CouncilNotice>> => {
  const response = await axiosInstance.get<ApiResponse<CouncilNotice>>(
    `/api/councilNotices/${councilNoticeId}`
  );
  return response.data;
};

// 총학생회 공지사항 등록
export const postCouncilNotices = async (
  title: string,
  content: string,
  images: File[]
): Promise<ApiResponse<number>> => {
  const jsonData = {
    title,
    content,
  };

  const formData = new FormData();

  const jsonBlob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  formData.append("councilNoticeRequestDto", jsonBlob);
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/councilNotices`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// 총학생회 공지사항 수정
export const putCouncilNotices = async (
  councilNoticeId: number,
  title: string,
  content: string,
  images: File[]
): Promise<ApiResponse<number>> => {
  const jsonData = {
    title,
    content,
  };

  const formData = new FormData();

  const jsonBlob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  formData.append("councilNoticeRequestDto", jsonBlob);
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/councilNotices/${councilNoticeId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// 총학생회 공지사항 삭제
export const deleteCouncilNotices = async (
  councilNoticeId: number
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/councilNotices/${councilNoticeId}`
  );
  return response.data;
};
