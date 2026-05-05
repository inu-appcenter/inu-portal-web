import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { joinChatRoom, getChatMessages } from '../apis/chat';
import { createStompClient, publishMessage as publish } from '../utils/stomp';

// 서버에서 받는 메시지 타입 정의
interface ChatMessage {
  messageId: number;
  roomId: number;
  senderNickname: string;
  content: string;
  createDate: string;
}

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const enterChatRoom = async () => {
      try {
        await joinChatRoom(roomId);
        const initialMessages = await getChatMessages(roomId);
        setMessages(initialMessages.data);
        connectStomp();
      } catch (err) {
        console.error("Failed to enter chat room:", err);
        setError("Failed to enter chat room. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const connectStomp = () => {
      const jwtToken = localStorage.getItem('accessToken'); // 예시: localStorage에서 토큰 가져오기
      if (!jwtToken) {
        setError("Authentication token not found.");
        return;
      }

      const client = createStompClient();
      client.connectHeaders = { 'Auth': `Bearer ${jwtToken}` };

      client.onConnect = () => {
        client.subscribe(`/sub/room/${roomId}`, (message) => {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      };

      client.onStompError = (frame) => {
        console.error('Broker reported error:', frame.headers['message']);
        console.error('Additional details:', frame.body);
        setError("Connection error. Please refresh the page.");
      };
      
      client.activate();
      clientRef.current = client;
    };

    enterChatRoom();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [roomId]);

  const sendMessage = (content: string, isAnonymous: boolean) => {
    publish(clientRef.current, roomId, content, isAnonymous);
  };

  return { messages, sendMessage, isLoading, error };
};
