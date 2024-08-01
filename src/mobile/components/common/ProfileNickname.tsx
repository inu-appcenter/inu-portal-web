import styled from 'styled-components';

interface ProfileNicknameProps {
  nickname: string;
}

export default function ProfileNickname({ nickname }: ProfileNicknameProps) {
  return (
    <>
      <ProfileNicknameWrapper>{nickname}</ProfileNicknameWrapper>
    </>
  );
}

const ProfileNicknameWrapper = styled.div`
  color: white;
`;
