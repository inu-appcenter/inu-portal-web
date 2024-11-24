import { useState, useEffect } from "react";
import styled from "styled-components";
import { getNoticesTop } from "../../utils/API/Notices";

interface Notice {
  id: number;
  category: string;
  title: string;
  writer: string;
  date: string;
  view: number;
  url: string;
}

export default function NoticesTop() {
  const [topPosts, setTopPosts] = useState<Notice[]>([]);

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const response = await getNoticesTop();
        if (response.status === 200) {
          setTopPosts(response.body.data);
        }
      } catch (error) {
        console.error("Error fetching top posts:", error);
      }
    };

    fetchTopPosts();
  }, []);

  const handlePostClick = (url: string) => {
    window.open("https://" + url, "_blank");
  };

  return (
    <NoticesTopPostsWrapper>
      {topPosts.map((post) => (
        <PostCard key={post.id} onClick={() => handlePostClick(post.url)}>
          <TopPostTitle>{post.title}</TopPostTitle>
        </PostCard>
      ))}
    </NoticesTopPostsWrapper>
  );
}

// Styled Components
const NoticesTopPostsWrapper = styled.div`
  height: 240px;
  gap: 30px;
  overflow-x: scroll;
  display: flex;
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
  height: 140px;
  border-radius: 20px;
  margin: 30px;
  padding: 0 15px;
  background: linear-gradient(90deg, #c7dcfa 21.17%, #7aa7e5 100%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: url("/pointers/cursor-pointer.svg"), pointer;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(1.05);
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
