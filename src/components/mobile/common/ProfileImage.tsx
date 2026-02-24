import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import styled from "styled-components";

interface ProfileImageProps {
  fireId: number;
}

export default function ProfileImage({ fireId }: ProfileImageProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.MYPAGE.ROOT);
  };

  return (
    <ProfileImg
      src={`https://portal.inuappcenter.kr/images/profile/${fireId}`}
      alt={`Profile Image`}
      onClick={handleClick}
    />
  );
}

const ProfileImg = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 100%;
  border: 2px solid #ccc;
`;
