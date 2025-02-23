import styled from "styled-components";
import useMobileNavigate from "hooks/useMobileNavigate";

interface ProfileImageProps {
  fireId: number;
}

export default function ProfileImage({ fireId }: ProfileImageProps) {
  const mobileNavigate = useMobileNavigate();

  const handleClick = () => {
    mobileNavigate("/mypage");
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
  width: 32px;
  height: 32px;
  border-radius: 100%;
  border: 2px solid #ccc;
`;
