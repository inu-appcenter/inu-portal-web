import styled from "styled-components";
import { Post } from "types/posts";
import { Notice } from "types/notices";
import { useEffect, useState } from "react";
import { getPostsTop } from "apis/posts";
import { getNoticesTop } from "apis/notices";
import heart from "resources/assets/posts/posts-heart.svg";
import { useLocation, useNavigate } from "react-router-dom";

export default function PostsTop() {
  const location = useLocation();
  const navigate = useNavigate();
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [topNotices, setTopNotices] = useState<Notice[]>([]);

  const [type, setType] = useState(""); // 이전 상태와 동일한지 확인
  const [category, setCategory] = useState(""); // 이전 상태와 동일한지 확인

  useEffect(() => {
    const fetchTops = async () => {
      try {
        if (params.get("type") === "notice") {
          const response = await getNoticesTop();
          setTopNotices(response.data);
          setTopPosts([]);
        } else {
          if (
            params.get("category") === "검색결과" ||
            params.get("category") === "전체"
          ) {
            const response = await getPostsTop("");
            setTopPosts(response.data);
          } else {
            const response = await getPostsTop(params.get("category") || "");
            setTopPosts(response.data);
          }
          setTopNotices([]);
        }
      } catch (error) {
        console.error("인기 게시글/공지 가져오기 실패", error);
      }
    };

    const params = new URLSearchParams(location.search);
    const tmpType = params.get("type") ? params.get("type") : "tips";
    const tmpCategory = params.get("category")
      ? params.get("category")
      : "전체";
    if (tmpType === type && tmpCategory === category) {
      return; // 이전 상태와 동일한지 확인
    }
    setType(tmpType || "tips");
    setCategory(tmpCategory || "전체");
    fetchTops();
  }, [location.search]);

  const handleClickPost = (postId: number) => {
    const params = new URLSearchParams(location.search);
    params.set("id", String(postId));
    navigate(`/posts?${params.toString()}`);
  };

  return (
    <PostsTopWrapper>
      {topPosts.map((post) => (
        <PostCard key={post.id} onClick={() => handleClickPost(post.id)}>
          <PostLike>
            <img src={heart} style={{ width: "16px", height: "16px" }} alt="" />
            <span>{post.like}</span>
          </PostLike>
          <PostCategory>
            <img
              src={`/categoryIcons/${post.category}_white.svg`}
              style={{ width: "32px", height: "32px" }}
              alt=""
            />
            <span>{post.category}</span>
          </PostCategory>
          <PostTitle>
            {post.title.length > 16
              ? `${post.title.slice(0, 16)}...`
              : post.title}
          </PostTitle>
        </PostCard>
      ))}

      {topNotices.map((notice) => (
        <PostCard
          key={notice.id}
          onClick={() => window.open("https://" + notice.url)}
        >
          <NoticeTitle>{notice.title}</NoticeTitle>
        </PostCard>
      ))}
    </PostsTopWrapper>
  );
}

const PostsTopWrapper = styled.div`
  height: 240px;
  width: 1108px;
  display: flex;
  align-items: center;
  background: linear-gradient(to bottom, #dbebff 70%, #ffffff);
  overflow-x: scroll;
`;

const PostCard = styled.button`
  border: none;
  margin: 0 40px;
  min-width: 210px;
  height: 140px;
  border-radius: 20px;
  padding: 16px 0 0 0;
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
  margin-left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600px;
`;

const PostCategory = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-self: center;
  align-items: center;
  gap: 4px;
  color: #0e4d9d;
  font-size: 16px;
  font-weight: 500;
`;

const PostTitle = styled.div`
  width: 100%;
  height: 40px;
  background: linear-gradient(#e9f0fa 5%, #ffffff 100%);
  border-radius: 0 0 20px 20px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
`;

const NoticeTitle = styled.div`
  text-align: start;
  font-size: 16px;
  font-weight: 600;
  padding-left: 16px;
  padding-bottom: 16px;
  display: flex;
  height: 100%;
  align-items: center;
`;
