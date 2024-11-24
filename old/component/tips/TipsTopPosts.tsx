import { useState, useEffect } from "react";
import styled from "styled-components";
import { getPostsTop } from "../../utils/API/Posts";
import { useNavigate } from "react-router-dom";
import Heart from "../../resource/assets/heart.svg";

interface Post {
  id: number;
  title: string;
  category: string;
  like: number;
}

interface CategoriesProps {
  selectedCategory: string;
}

export default function TipsTopPosts({ selectedCategory }: CategoriesProps) {
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
        console.error("Error fetching top posts:", error);
      }
    };

    fetchTopPosts();
  }, [selectedCategory]);

  const handlePostClick = (postId: number) => {
    navigate(`/tips/${postId}`);
  };

  return (
    <TipsTopPostsWrapper>
      {topPosts.map((post) => (
        <PostCard key={post.id} onClick={() => handlePostClick(post.id)}>
          <PostLike>
            <img
              src={Heart}
              style={{ width: "15px", height: "15px" }}
              alt="Heart Icon"
            />
            <div className="like-num">{post.like}</div>
          </PostLike>
          <TopPostsCat>
            <CategoryIcon
              src={`/categoryIcons/${post.category}_white.svg`}
              alt=""
            />
            <PostCat>{post.category}</PostCat>
          </TopPostsCat>
          <TopPostTitle>{post.title}</TopPostTitle>
        </PostCard>
      ))}
    </TipsTopPostsWrapper>
  );
}

// Styled Components
const TipsTopPostsWrapper = styled.div`
  height: 240px;
  gap: 30px;
  overflow-x: scroll;
  display: -webkit-inline-box;
  align-items: center;
  margin-right: 25px;
  background: linear-gradient(to bottom, #dbebff 70%, #ffffff);
  flex-wrap: nowrap;
  padding-left: 40px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const PostCard = styled.div`
  width: 210px;
  height: 155px;
  border-radius: 20px;
  margin: 30px;
  position: relative;
  background: linear-gradient(90deg, #c7dcfa 21.17%, #7aa7e5 100%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(1.05);
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
  background: linear-gradient(#e9f0fa 5%, #ffffff 100%);
  padding: 2px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
  color: #0e4d9d;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  text-align: left;
`;

const CategoryIcon = styled.img`
  width: 30px;
  padding-left: 10px;
`;
