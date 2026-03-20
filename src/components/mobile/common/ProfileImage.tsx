import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import styled from "styled-components";

interface ProfileImageProps {
  fireId: number;
  clickable?: boolean;
}

export default function ProfileImage({
  fireId,
  clickable = true,
}: ProfileImageProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.MYPAGE.ROOT);
  };

  return (
    <ProfileImg
      src={`https://portal.inuappcenter.kr/images/profile/${fireId}`}
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
