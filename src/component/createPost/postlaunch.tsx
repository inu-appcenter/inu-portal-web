import React from 'react';
import { useNavigate } from 'react-router-dom';
import launchPost from '../../utils/launchPost';

interface LaunchProps {
  title: string;
  content: string;
  category: string;
}

const Launch: React.FC<LaunchProps> = ({ title, content, category }) => {
  const navigate = useNavigate();

  const handleLaunch = async () => {
    // 필수 항목 체크
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 작성해주세요.');
      return; // 필수 항목이 없으면 함수 종료
    }

    try {
      // 서버로 데이터 전송
      const data = {
        title: title,
        content: content,
        category: category,
      };

      const token  = await launchPost(data, token); // launchPost 함수 호출
      // 등록 완료 알림
      alert('정상적으로 게시되었습니다!');

      // '/tips'로 네비게이트
      navigate('/tips');
    } catch (error) {
      console.error('에러가 발생했습니다.', error);
      alert('게시에 실패하였습니다.'); // 에러 발생 시 알림 표시
    }
  };

  return (
    <div>
      <button className='LaunchBtn' onClick={handleLaunch}>Launch Post</button>
    </div>
  );
};

export default Launch;
