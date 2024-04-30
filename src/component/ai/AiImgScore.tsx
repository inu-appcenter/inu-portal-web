import React, { useState } from 'react';
import styled from 'styled-components';
import starEmpty from '../../resource/assets/starempty.svg';
import starFilled from '../../resource/assets/starfilled.svg'; 

const AiImgScore: React.FC = () => {
  const [rating, setRating] = useState<number>(0);

  const handleStarClick = (index: number) => {
    setRating(index + 1);
  };

  const handleStarHover = (index: number) => {
    setRating(index + 1);
  };

  const handleMouseLeave = () => {
    setRating(0);
  };

  return (
    <AiImgScoreWrapper>
      <div className="score">
        {[...Array(5)].map((_, index) => (
          <img
            key={index}
            src={index < rating ?  starFilled: starEmpty}
            alt="별점"
            onClick={() => handleStarClick(index)}
            onMouseOver={() => handleStarHover(index)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
    </AiImgScoreWrapper>
  );
};

const AiImgScoreWrapper = styled.div`
display: flex;
justify-content: center;
align-items: center;
margin-top: 20px; 
position: absolute;
height:fit-content;
top: 75%;
`;

export default AiImgScore;
