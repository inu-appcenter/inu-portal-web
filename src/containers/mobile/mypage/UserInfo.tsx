import ProfileImage from "@/components/mobile/common/ProfileImage";
import styled from "styled-components";
import useUserStore from "@/stores/useUserStore";
import { FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { DESKTOP_MEDIA } from "@/styles/responsive";

export default function UserInfo() {
  const { userInfo } = useUserStore();
  const navigate = useNavigate();

  return (
    <UserInfoWrapper onClick={() => navigate("/mypage/profile")}>
      <ProfileSection>
        <ImageWrapper>
          <ProfileImage fireId={userInfo.fireId} />
        </ImageWrapper>
        <TextSection>
          <Nickname>{userInfo.nickname}</Nickname>
          <Department>{userInfo.department || "학과 정보 없음"}</Department>
        </TextSection>
      </ProfileSection>
      <FiChevronRight size={24} color="#adb5bd" />
    </UserInfoWrapper>
  );
}

const UserInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 320px;
  background: white;
  padding: 20px;
  border-radius: 20px;
  /* 그림자를 조금 더 선명하게 조정 */
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.02),
    0 12px 28px rgba(0, 0, 0, 0.06);
  /* 아주 연한 테두리 추가로 구분감 부여 */
  border: 1px solid rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  }

  @media ${DESKTOP_MEDIA} {
    max-width: none;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ImageWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f1f3f5;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: none;
  }
`;

const TextSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Nickname = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #212529;
`;

const Department = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #868e96;
`;

