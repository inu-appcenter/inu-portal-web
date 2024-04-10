import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import getNoticesTop from '../../utils/getNoticesTop';

 
interface Notice {
    id: number;
    category: string;
    title: string;
    writer: string;
    date: string;
    view: number;
    url: string;
}


const NoticesTopPostsWrapper = styled.div`
  height: 240px;
  gap: 30px;
  overflow-x: scroll;
  display: flex;
  align-items: center;
  margin-right: 25px;
  background: linear-gradient(to bottom, #DBEBFF 70%, #FFFFFF );
  flex-wrap: nowrap;
  padding-left: 40px;

`;

const PostCard = styled.div`
  width: 210px;
  height: 140px;
  border-radius: 20px;
  margin: 30px;  
  padding: 0 15px;
  background: linear-gradient(90deg, #C7DCFA 21.17%, #7AA7E5 100%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex; 
  flex-direction: column;
  justify-content: center; 
  align-items: center; 
  cursor: url('/pointers/cursor-pointer.svg'), pointer;
  transition: transform 0.2s ease-in-out; /* 호버 효과를 위한 변형 트랜지션 */
  &:hover {
    transform: scale(1.05); /* 호버 시 확대 효과 */
  }
`;

const TopPostTitle = styled.div`
  text-align: center;
  width: 210px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;



const NoticesTop: React.FC = () => {
    const [topPosts, setTopPosts] = useState<Notice[]>([]);

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const posts = await getNoticesTop();
        setTopPosts(posts);
      } catch (error) {
        console.error('Error fetching top posts:', error);
      }
    };

    fetchTopPosts();
  }, []);

  const handlePostClick = (url: string) => { // 매개변수로 url을 추가하여 해당 URL을 사용할 수 있도록 함
    window.open('https://' + url, '_blank');
  };

  return (
    <NoticesTopPostsWrapper>
    {topPosts.map(post => (
       <PostCard key={post.id} onClick={() => handlePostClick(post.url)}>
        <TopPostTitle>{post.title}</TopPostTitle>
        {/* Render other post properties as needed */}
      </PostCard>
    ))}
    
  </NoticesTopPostsWrapper>
  );
};

export default NoticesTop;