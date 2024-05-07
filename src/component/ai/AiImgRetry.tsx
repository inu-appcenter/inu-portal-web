import styled from 'styled-components';
import retry from '../../resource/assets/retry.svg'
import { useNavigate } from 'react-router-dom';
import postFiresRating from '../../utils/postFiresRating';
import { useSelector } from 'react-redux';

interface AiImgRetryProps {
  rating: number;
  id:string;
}

interface loginInfo {
  user: {
    token: string;
  };
}
const AiImgRetry: React.FC<AiImgRetryProps> = ({rating,id}) => {
  const user = useSelector((state: loginInfo) => state.user);
  const navigate = useNavigate();
  const handleRetryClick = async () =>{
    if (rating===0){
      alert("별점 평가 후 다시 그리기가 가능합니다!")
    }else{
      try{
        const data = await postFiresRating(user.token, rating, id);
        console.log(data);
      } catch (error) {
        console.error('평점 추가 실패:', error); // 실패한 경우 오류를 처리합니다.
      }
      navigate(`/ai`);
    }
  }

    return (
      <AiImgRetryWrapper>
        <div className="retry-button" onClick={handleRetryClick}>
          <img src={retry} alt="Retry Icon" />다시 그리기</div>
      </AiImgRetryWrapper>
    );
  };
  
  const AiImgRetryWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute; 
  line-height: 40px; 
  text-align: center; 
  top: 70%;
  margin-top: 20px;
  
  .retry-button{
    width: 190px;
    height: 40px;
    border: 1px solid #FFFFFF;
    font-family: Inter;
    font-size: 20px;
    font-weight: 900;
    line-height: 20px;
    text-align: left;
    align-items: center;
    justify-content: center;
    display: flex;
    gap: 10px;
    border-radius: 15px;
  }
`;


export default AiImgRetry;