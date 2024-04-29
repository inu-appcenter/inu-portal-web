import React from 'react';
import styled from 'styled-components';
import imgshare from '../../resource/assets/imgshare.svg'
import imgsave from '../../resource/assets/imgsave.svg'
import dot from '../../resource/assets/dot.svg'
interface AiImgViewerProps {
  imageUrl: string;
}

const AiImgViewer: React.FC<AiImgViewerProps> = ({ imageUrl }) => {
  return (
    <AiImgViewerWrapper >
      <div className='completed'>생성완료!</div>
      <AiImgViewUtility >
        <div className="image-save">
          <img src={imgsave} alt="이미지저장 이모지" />
        이미지 저장</div>
        <img src={dot}/>
        <div className="image-share">
          <img src={imgshare} alt="이미지공유 이모지" />
        공유</div>
      </AiImgViewUtility>
      <AiImg >
        <img src={imageUrl} alt="AI generated image" />
      </AiImg>
    </AiImgViewerWrapper>
  );
};


// AiImgViewer component
const AiImgViewerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 766px;
  height: 424px;
  gap: 0px;
  border-radius: 20px;
  position: absolute;
  left: 50%;
  transform: translate( -50%);
  border: 1px solid #fff;
  background-color: rgba(255, 255, 255, 0.5);

  .completed{
    position:absolute;
    display: flex;
    left: 30px;
    top:20px;
    background-color:#6D4DC7;
    width: 110px;
    font-family: Inter;
    font-size: 20px;
    font-weight: 800;
    line-height: 20px;
    text-align: left;
    border-radius: 15px;
    align-items: center;
    justify-content: center;
    height: 30px;
    padding:5px;
  }
`;

const AiImgViewUtility = styled.div`
  display: flex;
  gap: 10px;
  font-family: Inter;
  font-size: 15px;
  font-weight: 700;
  line-height: 20px;
  text-align: left;
  position: absolute;
  left: 535px;
  top: 20px;

  .image-save{
    width: fix-content;
    height: 30px;
    border-radius: 10px;
    background-color:#fff;
    color: #969696;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 5px;
    display: flex;
    gap:3px;
  }
  .image-share{
    width:fix-content;
    border-radius: 10px;
    background-color:#fff;
    color: #969696;
    padding: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap:3px;
  }
`;

const AiImg = styled.div`
  width: 350px;
  display: flex;
  potision: absolute;
  align-items: center;
  justify-content: center;
`;

export default AiImgViewer;