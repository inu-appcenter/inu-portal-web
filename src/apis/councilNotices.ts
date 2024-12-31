import axiosInstance from "apis/axiosInstance";
import { ApiResponse, Pagination } from "types/common";
import { CouncilNotice } from "types/councilNotices";

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
