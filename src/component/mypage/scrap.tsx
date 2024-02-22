import  { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import getScrapInfo from '../../utils/getScrap';
import ScrapPost from './scrapdetail';
import ScrapTitle from './scaptitle';
import ScrapFolder from './scrapfolder';

interface loginInfo {
    user: {
      token: string;
    };
  }

interface ScrapInfo {
  // 스크랩 정보의 타입 정의
  id: number;
  title: string;
  category: string;
}

export default function ScrapInfo() {
    console.log("여기까지 왔니")
  const [scrapInfo, setScrapInfo] = useState<ScrapInfo[]>([]); 
  const token = useSelector((state: loginInfo) => state.user.token);

  useEffect(() => {
    const fetchScrapInfo = async () => {
      try {
        const info = await getScrapInfo(token);
        console.log(info);
        setScrapInfo(info.data); 
      } catch (error) {
        console.error('에러가 발생했습니다.', error);
        alert('게시에 실패하였습니다.');
      }
    };

    fetchScrapInfo(); 
  }, [token]); 

  return (
    <ScrapWrapper>
      <ScrapTitle/>
      <ScrapFolder/>
      <ChangeWrapper>
        <ScrapPost postScrapInfo={scrapInfo}/>
      </ChangeWrapper>
    </ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`
  background-color:  #EFF2F9;
  padding:2.5rem 5rem;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
  height: 100vh;
  
`

const ChangeWrapper = styled.div`
    font-family: Inter;
font-size: 20px;
font-weight: 700;
line-height: 20px;
margin-top: 30px;
width:100%;
`

