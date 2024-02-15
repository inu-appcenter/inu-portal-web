// import  { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import getUserPost from '../../utils/getUserPost';
import { useEffect, useState } from 'react';
import UserPost from './userPost';


interface loginInfo {
    user: {
      token: string;
    };
  }

interface PostInfo {
  // 스크랩 정보의 타입 정의
  id: number;
  title: string;
  category:string;
}

export default function ActiveInfo() {
    console.log("여기까지 왔니")
  const [PostInfo, setPostInfo] = useState<PostInfo[]>([]); 
  const token = useSelector((state: loginInfo) => state.user.token);
  console.log(PostInfo,"정보");
  useEffect(() => {
    const fetchPostInfo = async () => {
      try {
        const info = await getUserPost(token);
        setPostInfo(info.data); 
        console.log(info);
      } catch (error) {
        console.error('에러가 발생했습니다.', error);
        alert('게시에 실패하였습니다.');
      }
    };

    fetchPostInfo(); 
  }, [token]); 

  return (
    <ScrapWrapper>
      <UserPost postinfo={PostInfo}/>
</ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`

  /* 스타일 지정 */
`;

