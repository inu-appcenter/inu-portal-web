import styled from "styled-components";

interface ProfileNicknameProps {
  nickname: string;
}

export default function ProfileNickname({ nickname }: ProfileNicknameProps) {
  return <ProfileNicknameWrapper>{nickname}</ProfileNicknameWrapper>;
}

const ProfileNicknameWrapper = styled.div`
  min-width: 56px;
  max-width: 100px;
  height: 24px;
  border-radius: 8px;
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
  overflow: hidden; /* 컨테이너 크기를 벗어나는 텍스트 숨김 */
  padding: 0 4px;
  font-size: 14px;
  color: black;
`;
