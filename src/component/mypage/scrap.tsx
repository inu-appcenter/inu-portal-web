import  { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import getScrapInfo from '../../utils/getScrap';

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
      {/* 받아온 스크랩 정보를 화면에 출력 */}
      {scrapInfo.map((item) => (
        <ScrapItem key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.category}</p>
        </ScrapItem>
      ))}
    </ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`

  /* 스타일 지정 */
`;

const ScrapItem = styled.div`
  /* 스타일 지정 */
`;
