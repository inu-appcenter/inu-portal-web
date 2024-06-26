import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getPostsTop } from '../../utils/API/Posts';
import { useNavigate } from 'react-router-dom';
import Heart from '../../resource/assets/heart.svg';

interface Post {
  id: number;
  title: string;
  category: string;
  like: number;
}

interface CategoriesProps {
  selectedCategory: string;
}

const TipsTopPosts: React.FC<CategoriesProps> = ({ selectedCategory }) => {
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const response = await getPostsTop(selectedCategory);
        if (response.status === 200) {
          setTopPosts(response.body.data);
        }
      } catch (error) {
        console.error('Error fetching top posts:', error);
      }
    };

    fetchTopPosts();
  }, [selectedCategory]);

  const handlePostClick = (postId: number) => {
    navigate(`/tips/${postId}`);
  };

  return (
    <TipsTopPostsWrapper>
      {topPosts.map(post => (
        <PostCard key={post.id} onClick={() => handlePostClick(post.id)}>
          <PostLike>
            <img src={Heart} style={{ width: '15px', height: '15px' }} />
            <div className='like-num'>{post.like}</div>
          </PostLike>
          <TopPostsCat>
            <CategoryIcon src={`/categoryIcons/${post.category}_white.svg`} alt="카테고리 이모지" />
            <PostCat>{post.category}</PostCat>
          </TopPostsCat>
          <TopPostTitle>{post.title}</TopPostTitle>
        </PostCard>
      ))}
    </TipsTopPostsWrapper>
  );
};

export default TipsTopPosts;

const TipsTopPostsWrapper = styled.div`
  height: 240px;
  gap: 30px;
  overflow-x: scroll;
  display: -webkit-inline-box;
  align-items: center;
  margin-right: 25px;
  background: linear-gradient(to bottom, #DBEBFF 70%, #FFFFFF );
  flex-wrap: nowrap;
  padding-left: 40px;
  @media (max-width: 768px) { /* 모바일 */
    display: none;
  }
`;

const PostCard = styled.div`
  width: 210px;
  height: 155px;
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

const PostLike = styled.div`
  margin: 12px 0 0 15px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const TopPostTitle = styled.span`
  width: 210px;
  height: 40px;
  font-size: 17px;
  position: absolute;
  align-items: center;
  bottom: 0;
  font-weight: 600;
  display: flex;
  justify-content: space-around;
  border-radius: 0 0 20px 20px;
  background: linear-gradient(#E9F0FA 5%, #FFFFFF 100%);
  padding: 2px 0;
  overflow: hidden; /* 넘치는 텍스트 숨김 */
  white-space: nowrap; /* 텍스트 줄 바꿈 방지 */
  text-overflow: ellipsis; /* 넘치는 텍스트를 생략 부호(...)로 표시 */
`;

const PostCat = styled.span`
  display: flex;
  position: relative;
`;

const TopPostsCat = styled.span`
  display: grid;
  position: relative;
  align-items: center; 
  margin: 5px 0;
  height: 70px;
  left: 20px;
  color: #0E4D9D;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  text-align: left;
  border: 1px;
`;

const CategoryIcon = styled.img`
  width: 30px;
  padding-left: 10px;
`;
