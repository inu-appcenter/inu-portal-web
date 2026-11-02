import { ApiResponse } from "@/types/common";
import tokenInstance from "./tokenInstance";
import type {
  SuggestionPage,
  SuggestionRequest,
  SuggestionResponse,
  SuggestionStatus,
} from "@/types/suggestions";
import { isMockApiEnabled, mockDelay } from "@/mocks/mockFlag";
import {
  mockCreateSuggestion,
  mockDeleteSuggestion,
  mockGetSuggestion,
  mockGetSuggestionImage,
  mockGetSuggestions,
  mockUpdateSuggestionStatus,
} from "@/mocks/mockSuggestionStore";

// 건의사항 등록. 이미지가 없으면 images 파트를 아예 보내지 않는다.
export const postSuggestion = async (
  request: SuggestionRequest,
  images: File[],
): Promise<number> => {
  if (isMockApiEnabled()) {
    await mockDelay(400);
    return mockCreateSuggestion(request, images);
  }

  const formData = new FormData();
  formData.append(
    "suggestionRequest",
    new Blob([JSON.stringify(request)], { type: "application/json" }),
  );
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.post<ApiResponse<number>>(
    "/api/suggestions",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.data;
};

// 일반 사용자는 본인 것만, 관리자는 전체. 페이지당 8개.
export const getSuggestions = async (
  page: number,
): Promise<SuggestionPage> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetSuggestions(page);
  }
  const response = await tokenInstance.get<ApiResponse<SuggestionPage>>(
    "/api/suggestions",
    { params: { page } },
  );
  return response.data.data;
};

export const getSuggestion = async (
  id: number,
): Promise<SuggestionResponse> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetSuggestion(id);
  }
  const response = await tokenInstance.get<ApiResponse<SuggestionResponse>>(
    `/api/suggestions/${id}`,
  );
  return response.data.data;
};

// 인증이 필요한 바이너리라 <img src>로 직접 못 쓴다. blob으로 받아 object URL을 만든다.
export const getSuggestionImage = async (
  id: number,
  n: number,
): Promise<Blob> => {
  if (isMockApiEnabled()) {
    await mockDelay(150);
    return mockGetSuggestionImage(id, n);
  }
  const response = await tokenInstance.get<Blob>(
    `/api/suggestions/${id}/images/${n}`,
    { responseType: "blob" },
  );
  return response.data;
};

export const deleteSuggestion = async (id: number): Promise<void> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    mockDeleteSuggestion(id);
    return;
  }
  await tokenInstance.delete(`/api/suggestions/${id}`);
};

// 관리자 전용
export const patchSuggestionStatus = async (
  id: number,
  status: SuggestionStatus,
): Promise<void> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    mockUpdateSuggestionStatus(id, status);
    return;
  }
  await tokenInstance.patch(`/api/suggestions/${id}/status`, { status });
};
