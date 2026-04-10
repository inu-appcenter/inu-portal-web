import axios from "axios";
import { BoardListResponse } from "@/types/appcenter";

const api = axios.create({
  baseURL: "https://server.inuappcenter.kr/",
});

/**
 * 모든 게시글 콘텐츠 조회 (Axios)
 */
export const getAllBoardsContents = async (): Promise<BoardListResponse> => {
  const endpoint = "introduction-board/public/all-boards-contents";
  const response = await api.get<BoardListResponse>(endpoint);
  return response.data;
};
