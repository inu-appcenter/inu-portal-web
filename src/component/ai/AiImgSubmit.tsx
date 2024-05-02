import React from 'react'
import styled from 'styled-components'

interface AiImgViewerProps {
    imageUrl: string;
  }

  const AiImgSubmit: React.FC<AiImgViewerProps> =()=>{

    return (
    <AIImgSubmitWrapper>
        <div className='submit'>제출</div></AIImgSubmitWrapper>
  )
}
  
  

const AIImgSubmitWrapper = styled.div`
    display: flex;
    position: absolute;
    top: 90%;
    align-items:center;
    justify-content: center;
    margin-top: 20px;

    .submit{
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
    align-items:center;
    justify-content: center;
    }
`
export default AiImgSubmit;