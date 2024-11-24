import styled from "styled-components";

interface ProfileNicknameProps {
  nickname: string;
}

export default function ProfileNickname({ nickname }: ProfileNicknameProps) {
  return <ProfileNicknameWrapper>{nickname}</ProfileNicknameWrapper>;
}

const ProfileNicknameWrapper = styled.button`
  width: 56px;
  height: 24px;
  border-radius: 8px;
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;
