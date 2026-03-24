import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import {
  DEFAULT_PROFILE_IMAGE_ID,
  normalizeProfileImageId,
} from "@/utils/userInfo";

interface ProfileImageProps {
  fireId: number;
  clickable?: boolean;
}

export default function ProfileImage({
  fireId,
  clickable = true,
}: ProfileImageProps) {
  const navigate = useNavigate();
  const safeFireId = normalizeProfileImageId(fireId, DEFAULT_PROFILE_IMAGE_ID);

  const handleClick = () => {
    navigate(ROUTES.MYPAGE.ROOT);
  };

  return (
    <ProfileImg
      src={`https://portal.inuappcenter.kr/images/profile/${safeFireId}`}
      alt={`Profile Image`}
      onClick={clickable ? handleClick : undefined}
      $clickable={clickable}
    />
  );
}

const ProfileImg = styled.img<{ $clickable: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 100%;
  border: 2px solid #ccc;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
`;
