export interface ApiResponse<T = any> {
  data: T;
  msg: string;
}

export interface Pagination<T = any> {
  pages: number;
  total: number;
  contents: T;
}
