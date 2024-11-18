import Categories from "components/posts/Categories";
import PostsDetails from "components/posts/PostDetails";
import PostsList from "components/posts/PostsList";
import PostsTitle from "components/posts/PostsTitle";
import PostsTop from "components/posts/PostsTop";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

export default function PostsPage() {
  const location = useLocation();
  const [id, setId] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setId(Number(params.get("id")) || 0);
  }, [location.search]);

  return (
    <PostsPageWrapper>
      <Categories />
      <ContentsWrapper>
        <PostsTitle />
        <PostsTop />
        {id ? <PostsDetails postId={id} /> : <PostsList />}
      </ContentsWrapper>
    </PostsPageWrapper>
  );
}

const PostsPageWrapper = styled.div`
  padding: 0 32px;
  display: flex;
  gap: 16px;
  position: relative;
`;

const ContentsWrapper = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
`;
