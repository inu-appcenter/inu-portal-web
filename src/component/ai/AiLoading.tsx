import React from 'react';
import loading from '../../resource/assets/loading.svg'
import styled from 'styled-components';
// import dot from '../../resource/assets/dot.svg';
import randomImg1 from '../../resource/assets/횃불-random1.svg';
import randomImg2 from '../../resource/assets/횃불-random2.svg';
import randomImg3 from '../../resource/assets/횃불-random3.svg';
// import greaterthan from '../../resource/assets/greaterthan.svg';

const AiLoading: React.FC = () => {
    return (
    <AiLoadingWrapper>
    {/* <AiPreViewer>
    <div className='preview-title'>
        <img src={dot} />
      <div>옆으로 넘기면 AI 횃불이 그림을 볼 수 있습니다.</div>
    </div>
    </AiPreViewer> */}
    <AiRandomImgWrapper>
        <div className='ai-random-img'>
            <img src={randomImg2} alt="횃불 randomImg2" />
            <img src={randomImg1} alt="횃불 randomImg1" />
            <img src={randomImg3} alt="횃불 randomImg3" />
        </div>
    {/* <img src={greaterthan} alt=">" className='greaterthan'/> */}
    </AiRandomImgWrapper>
    <LoadingSpinner>
    <img src={loading}/>
    </LoadingSpinner>
    <LoadingTitle>
        <div className='loading-title'>AI 그림 생성중 ···</div>
    </LoadingTitle>


    </AiLoadingWrapper>
  );
};

export default AiLoading;

const AiLoadingWrapper = styled.div`
`

// const AiPreViewer = styled.div`
//     display: flex;
//     position: absolute;
//     top: 200px;
//     padding: 10px 30px;
   
//     .preview-title{
//     display:flex;
//     font-size: 17px;
//     font-weight: 500;
//     line-height: 20px;
//     text-align: left;
//     gap: 10px;
    
//     }
// `
const AiRandomImgWrapper = styled.div`
    display: flex;
    position: relative;
    content-align:center;
    justify-content: center;
    top: 10%;
    .greaterthan{
        display: flex;
        position: absolute;
        left: 80%;
        top: 40%;
        margin: 20px;
    }

    .ai-random-img{
        gap: 50px;
        display: flex;
         img {
        width: auto; 
        height: auto; 
    }
`

const LoadingSpinner = styled.div`
    display: flex;
    position: relative;
    content-align:center;
    justify-content: center;
    margin-top: 100px;
`

const LoadingTitle = styled.div`
display:flex;
content-align: center;
justify-content: flex-end;
position: relative;
top: 10%;
.loading-title{
    width: 200px;
    height: 49px;
    border-radius: 15px;
    border: 1px solid #FFFFFF;
    font-size: 22px;
    font-weight: 500;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    margin-right: 30px;
}
`

