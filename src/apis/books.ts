import axiosInstance from "./axiosInstance";
import { ApiResponse, Pagination } from "@/types/common";
import tokenInstance from "./tokenInstance";
import { Book, BookSummary } from "@/types/books";

// 책 검색
export const getBooksSearch = async (
  query: string,
  page: number,
): Promise<ApiResponse<Pagination<BookSummary[]>>> => {
  const params: { [key: string]: string | number } = {
    query,
    page,
  };
  const resposne = await axiosInstance.get<
    ApiResponse<Pagination<BookSummary[]>>
  >("/api/books/search", { params });
  return resposne.data;
};

// 책 리스트 조회
export const getBooksList = async (
  page: number,
): Promise<ApiResponse<Pagination<BookSummary[]>>> => {
  const params: { [key: string]: string | number } = {
    page,
  };
  const response = await axiosInstance.get<
    ApiResponse<Pagination<BookSummary[]>>
  >("/api/books", { params });
  return response.data;
};

// 판매 가능한 책 리스트 조회
export const getBoksListAvailable = async (
  page: number,
): Promise<ApiResponse<Pagination<BookSummary[]>>> => {
  const params: { [key: string]: string | number } = {
    page,
  };
  const response = await axiosInstance.get<
    ApiResponse<Pagination<BookSummary[]>>
  >("/api/books/available", { params });
  return response.data;
};

// 책 상세 조회
export const getBooksDetail = async (
  bookId: number,
): Promise<ApiResponse<Book>> => {
  const response = await axiosInstance.get<ApiResponse<Book>>(
    `/api/books/${bookId}`,
  );
  return response.data;
};

// 책 등록
export const postBooks = async (
  name: string,
  author: string,
  content: string,
  price: number,
  images: File[],
): Promise<ApiResponse<number>> => {
  const jsonData = {
    name,
    author,
    content,
    price,
  };

  const formData = new FormData();

  const jsonBlob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  formData.append("request", jsonBlob);
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/books`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// 책 수정
export const putBooks = async (
  bookId: number,
  name: string,
  author: string,
  content: string,
  price: number,
  images: File[],
): Promise<ApiResponse<number>> => {
  const jsonData = {
    name,
    author,
    content,
    price,
  };

  const formData = new FormData();

  const jsonBlob = new Blob([JSON.stringify(jsonData)], {
    type: "application/json",
  });
  formData.append("request", jsonBlob);
  images.forEach((image) => formData.append("images", image));

  const response = await tokenInstance.put<ApiResponse<number>>(
    `/api/books/${bookId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// 책 판매 상태 변경
export const postBooksAvailable = async (
  bookId: number,
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.post<ApiResponse<number>>(
    `/api/books/${bookId}`,
  );
  return response.data;
};

// 책 삭제
export const deleteBooks = async (
  bookId: number,
): Promise<ApiResponse<number>> => {
  const response = await tokenInstance.delete<ApiResponse<number>>(
    `/api/books/${bookId}`,
  );
  return response.data;
};
