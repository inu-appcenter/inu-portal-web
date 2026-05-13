export interface ApiResponse<T = any> {
  result: ((prevState: string[]) => string[]) | string[];
  data: T;
  msg: string;
}

export interface Pagination<T = any> {
  pages: number;
  total: number;
  contents: T;
}

export interface PageResponse<T = any> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
