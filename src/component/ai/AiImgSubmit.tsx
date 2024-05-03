import React from 'react';
import styled from 'styled-components';
import postFiresRating from '../../utils/postFiresRating';
import { useSelector } from 'react-redux';

interface AiSubmitProps {
  rating: number;
  id: string;
}

interface loginInfo {
  user: {
    token: string;
  };
}

const AiImgSubmit: React.FC<AiSubmitProps> = ({ rating, id }) => {
  const user = useSelector((state: loginInfo) => state.user);

  const handleSubmitClick = async () => {
    try {
      // postFiresRating 함수를 호출할 때 필요한 fireId를 전달합니다.
      const data = await postFiresRating(user.token, rating, id);
      console.log(data); // 성공한 경우 서버 응답을 확인합니다.
    } catch (error) {
      console.error('평점 추가 실패:', error); // 실패한 경우 오류를 처리합니다.
    }
  };

  return (
    <AIImgSubmitWrapper>
      {/* 제출 버튼 클릭 시 onSubmit 함수 실행 */}
      <div className='submit' onClick={handleSubmitClick}>제출</div>
    </AIImgSubmitWrapper>
  );
};
const AIImgSubmitWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 90%;
  align-items: center;
  justify-content: center;
  margin-top: 20px;

  .submit {
    margin: 50px;
    position: absolute;
    width: 93px;
    height: 33px;
    background: #6D4DC7;
    border-radius: 10px;
    font-family: Inter;
    font-size: 18px;
    font-weight: 800;
    line-height: 20px;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer; /* 마우스 커서 변경 */
  }
`;

export default AiImgSubmit;
