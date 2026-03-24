import { UserInfo, UserInfoInput } from "@/types/members";

export const DEFAULT_PROFILE_IMAGE_ID = 1;

export const normalizeOptionalText = (
  value: string | null | undefined,
): string => (typeof value === "string" ? value : "");

export const normalizeProfileImageId = (
  fireId: number | null | undefined,
  fallback: number = 0,
): number =>
  typeof fireId === "number" && Number.isInteger(fireId) && fireId > 0
    ? fireId
    : fallback;

export const normalizeUserInfo = (userInfo?: UserInfoInput | null): UserInfo => {
  const id =
    typeof userInfo?.id === "number" && Number.isFinite(userInfo.id)
      ? userInfo.id
      : 0;

  return {
    id,
    nickname: normalizeOptionalText(userInfo?.nickname),
    department: normalizeOptionalText(userInfo?.department),
    fireId: normalizeProfileImageId(
      userInfo?.fireId,
      id > 0 ? DEFAULT_PROFILE_IMAGE_ID : 0,
    ),
    role: normalizeOptionalText(userInfo?.role),
  };
};
