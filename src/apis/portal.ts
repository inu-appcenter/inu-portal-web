import tokenInstance from "@/apis/tokenInstance";
import { StudentInfoResponse } from "@/types/portal";

// 내 기본 학적 정보 가져오기
export const getMyBasicInfo = async ({
  portalId,
  portalPassword,
}: {
  portalId: string;
  portalPassword: string;
}) => {
  const response = await tokenInstance.post<StudentInfoResponse>(
    `/api/portal/basic-info`,
    { portalId, portalPassword },
  );
  return response.data;
};
