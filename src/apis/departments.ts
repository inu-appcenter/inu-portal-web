import tokenInstance from "@/apis/tokenInstance";
import { ApiResponse } from "@/types/common";

export interface SchoolDepartment {
  code: string;
  name: string;
  noticeAvailable: boolean;
}

export const getSchoolDepartments = async (): Promise<
  ApiResponse<SchoolDepartment[]>
> => {
  const response = await tokenInstance.get<ApiResponse<SchoolDepartment[]>>(
    "/api/departments",
  );
  return response.data;
};
