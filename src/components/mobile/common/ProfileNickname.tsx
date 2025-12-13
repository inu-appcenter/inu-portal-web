import styled from "styled-components";

interface ProfileNicknameProps {
  nickname: string;
}

export default function ProfileNickname({ nickname }: ProfileNicknameProps) {
  return <ProfileNicknameWrapper>{nickname}</ProfileNicknameWrapper>;
}

const ProfileNicknameWrapper = styled.div`
  box-sizing: border-box;
  min-width: fit-content;
  max-width: 200px;
  height: fit-content;
  border-radius: 8px;
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  font-size: 14px;
  color: black;
`;
