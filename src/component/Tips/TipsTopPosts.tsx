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

const TipsTopPostsWrapper = styled.div`
  height: 270px;
  gap: 30px;
  overflow-x: auto;
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
  background: linear-gradient(90deg, #C7DCFA 21.17%, #7AA7E5 100%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const TopPostTitle =styled.div`
text-align: center;
width: 210px;
height: 33px;
font-size: 20px;
font-weight: 600;
align-items: center;
display: flex;
justify-content: center;
border-radius: 0 0 20px 20px;
background: #FFFFFF;
position: bottom;
padding: 2px 0 ;
`

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
        {/*임시 이미지 */}
        <img src={image} alt="햇불이" style={{ width: '110px', height: '110px', margin: '0 auto', display: 'flex' }} />
        <TopPostTitle>{post.title}</TopPostTitle>
        {/* Render other post properties as needed */}
      </PostCard>
    ))}
    
  </TipsTopPostsWrapper>
  );
};

export default TipsTopPosts;
