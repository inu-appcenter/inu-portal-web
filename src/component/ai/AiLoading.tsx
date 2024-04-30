import React from 'react';
import loading from '../../resource/assets/loading.svg'
import styled from 'styled-components';
import dot from '../../resource/assets/dot.svg';
const AiLoading: React.FC = () => {
  return (
    <AiLoadingWrapper>
    <AiPreViewer>
        <img src={dot} />
      <div>옆으로 넘기면 AI 횃불이 그림을 볼 수 있습니다.</div>
      {/*이미지 예시 추가 */}
    </AiPreViewer>
    <LoadingSpinner>
    <img src={loading}/>
    </LoadingSpinner>
    <LoadingCancel>
        <div className='cancel-btn' >취소</div>
    </LoadingCancel>
    <LoadingTitle>
        <div className='loading-title'>AI 그림 생성중 ···</div>
    </LoadingTitle>


    </AiLoadingWrapper>
  );
};

export default AiLoading;

const AiLoadingWrapper = styled.div`

`

const AiPreViewer = styled.div`
    display: flex;
    position: absolute;
    top: 120px;
    padding: 10px 30px;
    gap: 10px;
    font-family: Inter;
    font-size: 17px;
    font-weight: 500;
    line-height: 20px;
    text-align: left;

`

const LoadingSpinner = styled.div`
    display: flex;
    position: relative;
    content-align:center;
    justify-content: center;
    top: 30%;
`

const LoadingTitle = styled.div`
display:flex;
content-align: center;
justify-content: flex-end;

position: relative;
.loading-title{
    width: 200px;
    height: 49px;
    border-radius: 15px;
    border: 1px solid #FFFFFF;
    font-family: Inter;
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

const LoadingCancel = styled.div`
    display:flex;
    content-align: center;
    justify-content: center;
    top: 30%;
    position: relative;

.cancel-btn{
    display:flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #FFFFFF;
    width: 60px;
    height: 30px;
    border-radius: 15px;
    font-family: Inter;
    font-size: 20px;
    font-weight: 800;
    line-height: 20px;
    text-align: left;
    padding: 5px;
}
`