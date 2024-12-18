export interface ApiResponse<T = any> {
  data: T;
  msg: string;
}

export interface Pagination<T = any> {
  pages: number;
  total: number;
  posts: T;
}
export interface NoticesPagination<T = any> {
  pages: number;
  total: number;
  notices: T;
}
