import tokenInstance from './tokenInstance';

// 채팅방 생성
export const createChatRoom = async (title: string, maxCapacity: number, isAnonymous: boolean) => {
  const response = await tokenInstance.post('/api/chat-rooms', {
    title,
    maxCapacity,
    isAnonymous,
  });
  return response.data;
};

// 채팅방 참여
export const joinChatRoom = async (roomId: string | number) => {
  const response = await tokenInstance.post(`/api/chat-rooms/${roomId}/join`);
  return response.data;
};

// 채팅방 초기 메시지 로드
export const getChatMessages = async (roomId: string | number) => {
  const response = await tokenInstance.get(`/api/chat-rooms/${roomId}/messages`);
  return response.data;
};
