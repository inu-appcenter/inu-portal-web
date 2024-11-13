import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getPostsMain } from "apis/posts";
import { Post } from "types/posts";
import { useEffect, useState } from "react";

export default function Tips() {
  const [mainPosts, setMainPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMainPosts = async () => {
      try {
        const response = await getPostsMain();
        setMainPosts(response.data);
      } catch (error) {
        console.error("메인 페이지 게시글 7개 가져오기 실패", error);
      }
    };
    fetchMainPosts();
  }, []);

  return (
    <StyledTips>
      <TipsTitle>
        <Title onClick={() => navigate("/tips")}>🍯 TIPS</Title>
      </TipsTitle>
      <MainTips>
        {mainPosts.map((mainPost) => (
          <button
            className="article"
            key={mainPost.id}
            onClick={() => navigate(`tips?id=${mainPost.id}`)}
          >
            {mainPost.title}
          </button>
        ))}
        <button className="total" onClick={() => navigate("/tips")}>
          전체보기 +
        </button>
      </MainTips>
    </StyledTips>
  );
}

const StyledTips = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const TipsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const Title = styled.button`
  padding: 0;
  background-color: transparent;
  border: none;
  font-size: 28px;
  font-weight: 700;
  color: #0e4d9d;
`;

const MainTips = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .article {
    padding: 0;
    border: none;
    border-radius: 10px;
    background: linear-gradient(
      90deg,
      rgba(156, 175, 226, 0.7) 0%,
      rgba(181, 197, 242, 0.7) 50%,
      rgba(156, 175, 226, 0.7) 100%
    );
    height: 46px;
    font-size: 14px;
    font-weight: 700;
  }

  .total {
    font-size: 12px;
    font-weight: 400;
    height: 28px;
    width: 80px;
    border-radius: 4px;
    border: 1px solid #656565;
    margin-left: auto;
    background-color: transparent;
  }
`;
