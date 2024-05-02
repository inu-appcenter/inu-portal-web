import React, { useState } from 'react';
import styled from 'styled-components';
import starEmpty from '../../resource/assets/starempty.svg';
import starFilled from '../../resource/assets/starfilled.svg'; 

const AiImgScore: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const handleStarClick = (index: number) => {
    const newRating = index + 1;
    setRating(newRating === rating ? 0 : newRating);
    setHoveredRating(0);
  };

  const handleStarHover = (index: number) => {
    setHoveredRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (rating === 0) {
      setHoveredRating(0);
    }
  };
  return (
    <AiImgScoreWrapper>
      <div className="score">
        {[...Array(5)].map((_, index) => (
          <StarImg
            key={index}
            src={(index < rating || index < hoveredRating) ? starFilled : starEmpty}
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
margin-top: 10px; 
position: absolute;
height:fit-content;
top: 80%;
`;

const StarImg = styled.img`
  margin: 0 5px; /* 이미지 사이의 공백을 조절합니다. */
`;
export default AiImgScore;
