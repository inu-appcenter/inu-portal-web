import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import getTopPosts from '../../utils/getTopPosts';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  // Add more properties as needed
}

const TipsTopPostsWrapper = styled.div`
  height: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 25px;
  background: linear-gradient(to bottom right, #9CAFE2, #AAC9EE);
`;

const PostCard = styled.div`
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
`;

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
        <h3>{post.title}</h3>
        {/* Render other post properties as needed */}
      </PostCard>
    ))}
  </TipsTopPostsWrapper>
  );
};

export default TipsTopPosts;
