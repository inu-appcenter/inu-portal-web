import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AiChat } from '../../components/ai/AiChat';
import { UserChat } from '../../components/ai/UserChat';
import { getFireImages } from '../../../utils/API/Images';

interface loginInfo {
  user: {
    token: string;
    nickname: string;
    fireId: number;
  };
}

export default function MobileAiInput() {
  const navigate = useNavigate();
  const user = useSelector((state: loginInfo) => state.user);
  const [userImage, setUserImage] = useState<string>('');

  useEffect(() => {
    if (!user.token) {
      alert('로그인이 필요합니다.');
      navigate('/m/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserImage = async () => {
      try {
        const response = await getFireImages('', user.fireId);
        if (response.status === 200) {
          setUserImage(response.body);
        } else {
          console.error('Failed to fetch user image:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user image:', error);
      }
    };

    if (user.fireId) {
      fetchUserImage();
    }
  }, [user.fireId]);

  // 날짜 포맷 함수
  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const description = `지금부터 사용방법을 설명해드릴게요!\n\n
                      1. 원하는 행동 또는 상황을 입력합니다. 예를 들어, "운동하는 횃불이", "공부하는 횃불이" 등을 입력하세요.\n
                      2. 앱은 입력된 내용을 바탕으로 AI로 캐릭터 이미지를 생성합니다.\n
                      3. 생성된 이미지를 즐겨보세요! 필요에 따라 저장하거나 공유할 수 있습니다.`

  return (
    <MobileAiInputWrapper>
      <DateWrapper>
        <DateLine /> 
        <DateDisplay>{getFormattedDate()}</DateDisplay> 
        <DateLine />
      </DateWrapper>
      <ChatWrapper>
        <AiChat message={`안녕하세요! 반가워요 ${user.nickname} 님 :)\n저는 AI 횃불이에요.`} />
        <UserChat message="안녕 반가워!" userImage={userImage} />
        <AiChat message={description} />
        <UserChat message="응 알겠어!" userImage={userImage} />
        <AiChat message={`원하시는 이미지를 설명해주세요!`} />
      </ChatWrapper>
      <ChatInputWrapper>
        <ChatInput placeholder='수박을 들고 있는 횃불이 생성해줘'/>
      </ChatInputWrapper>
      <SendButtonWrapper>
        <SendButton>보내기</SendButton>
      </SendButtonWrapper>
    </MobileAiInputWrapper>
  );
}

const MobileAiInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const DateWrapper = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
`;

const DateLine = styled.div`
  height: 1px;
  flex: 1;
  background-color: white;
`;

const DateDisplay = styled.div`
  width: 132px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid white;
  border-radius: 14px;
  color: white;
  font-size: 14px;
`;

const ChatWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 16px 16px 16px;
`;

const ChatInputWrapper = styled.div`
  margin: 0 32px 0 32px;
  border: 1px solid white;
  border-radius: 15px;
  display: flex;
  align-items: center;
  height: 28px;
`

const ChatInput = styled.input`
  border: none;
  border-left: 1px solid white;
  margin-left: 16px;
  padding-left: 8px;
  flex: 1;
  background-color: transparent;
  color: white;
  font-size: 12px;
  font-weight: 500;
`

const SendButtonWrapper = styled.div`
  margin: 16px 0 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const SendButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 28px;
  border-radius: 10px;
  background-color: #6D4DC7;
  color: white;
`