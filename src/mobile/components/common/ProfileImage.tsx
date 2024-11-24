import styled from "styled-components";
import { useNavigate } from "react-router-dom";

interface ProfileImageProps {
  fireId: number;
}

export default function ProfileImage({ fireId }: ProfileImageProps) {
  const navvigate = useNavigate();

  return (
    <ProfileImg
      src={`https://portal.inuappcenter.kr/api/images/${fireId}`}
      alt={`Profile Image`}
      onClick={() => {
        navvigate("/m/mypage");
      }}
    />
  );
}

const ProfileImg = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 100%;
  border: 2px solid #ccc;
`;
