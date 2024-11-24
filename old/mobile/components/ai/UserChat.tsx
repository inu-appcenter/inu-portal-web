import styled from 'styled-components';

interface UserChatProps {
  message: string;
  userImage: string;
}

export function UserChat({ message, userImage }: UserChatProps) {
  return (
    <ChatContainer>
      <ChatBubble>{message}</ChatBubble>
      {userImage && <img src={userImage} alt="User Profile" />}
    </ChatContainer>
  );
}

const ChatContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 16px;
  img {
    width: 32px;
    height: 32px;
    border-radius: 100%;
    border: 2px solid #ccc;
  }
`;

const ChatBubble = styled.div`
  border-radius: 9px;
  background: #FFFFFF33;
  padding: 8px;
  color: white;
  font-size: 12px;
  font-weight: 500;
`;
