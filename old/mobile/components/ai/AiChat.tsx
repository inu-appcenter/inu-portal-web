import styled from 'styled-components';
import AiProfile from '../../../resource/assets/횃불-random1.svg';

export function AiChat({ message }: { message: string }) {
  return (
    <ChatContainer>
      <img src={AiProfile} alt="AI Profile" />
      <ChatBubble>{message}</ChatBubble>
    </ChatContainer>
  );
}

const ChatContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  img {
    width: 32px;
  }
`;

const ChatBubble = styled.div`
  border-radius: 9px;
  background: #FFFFFF33;
  padding: 8px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  white-space: pre-line;
`;
