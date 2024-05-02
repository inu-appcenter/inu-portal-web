import styled from 'styled-components';
import retry from '../../resource/assets/retry.svg'
import { useNavigate } from 'react-router-dom';

const AiImgRetry: React.FC = () => {
  const navigate = useNavigate();
  const handleRetryClick = () =>{
    navigate(`/ai`);
  }

    return (
      <AiImgRetryWrapper>
        <div className="retry-button" onClick={handleRetryClick}>
          <img src={retry}/>다시 그리기</div>
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