import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import getTopPosts from '../../utils/getTopPosts';
import { useNavigate } from 'react-router-dom';
import image from '../../resource/assets/homepage-횃불-img.svg'

interface Post {
  id: number;
  title: string;
  // Add more properties as needed
}


const TipsTopPosts: React.FC = () => {
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const posts = await getTopPosts();
        setTopPosts(posts);
      } catch (error) {
        console.error('Error fetching top posts:', error);
      }
    };

    fetchTopPosts();
  }, []);

  const handlePostClick = (postId: number) => {
    navigate(`/tips/${postId}`);
  };

  return (
    <TipsTopPostsWrapper>
    {topPosts.map(post => (
      <PostCard key={post.id} onClick={() => handlePostClick(post.id)}>
        <TopPostTitle>{post.title}</TopPostTitle>
        {/* Render other post properties as needed */}
      </PostCard>
    ))}
    
  </TipsTopPostsWrapper>
  );
};

export default TipsTopPosts;

const TipsTopPostsWrapper = styled.div`
  height: 270px;
  gap: 30px;
  overflow-x: scroll;
  display: -webkit-inline-box;
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
  position: relative; 
  background: linear-gradient(90deg, #C7DCFA 21.17%, #7AA7E5 100%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  flex-direction: column;
  transition: transform 0.2s ease-in-out; /* 호버 효과를 위한 변형 트랜지션 */
  &:hover {
    transform: scale(1.05); /* 호버 시 확대 효과 */
  }
`;

const TopPostTitle =styled.div`
text-align: center;
width: 210px;
height: 33px;
font-size: 20px;
position: absolute;
bottom: 0;
font-weight: 600;
display: flex;
justify-content: center;
border-radius: 0 0 20px 20px;
background: #FFFFFF;
padding: 2px 0 ;
overflow: hidden; /* 넘치는 텍스트 숨김 */
white-space: nowrap; /* 텍스트 줄 바꿈 방지 */
text-overflow: ellipsis; /* 넘치는 텍스트를 생략 부호(...)로 표시 */

`;