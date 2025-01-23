import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

interface ProfileImageProps {
  fireId: number;
}

export default function ProfileImage({ fireId }: ProfileImageProps) {
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();

  return (
    <ProfileImg
      src={`https://portal.inuappcenter.kr/api/images/${fireId}`}
      alt={`Profile Image`}
      onClick={() => {
        navigate(`${isAppUrl}/mypage`);
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
