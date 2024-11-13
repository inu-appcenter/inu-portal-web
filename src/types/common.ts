// types/common.ts
export interface ApiResponse<T = any> {
  data: T;
  msg: string;
}
