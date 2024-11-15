import styled from "styled-components";
import PostsSort from "components/posts/PostsSort";
import { Post } from "types/posts";
import { Notice } from "types/notices";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getNotices } from "apis/notices";
import { getSearch } from "apis/search";
import { getPosts } from "apis/posts";
import heart from "resources/assets/posts/posts-heart.svg";
import Pagination from "components/posts/Pagination";

export default function PostsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pages, setPages] = useState(1);

  const handleClickPost = (postId: number) => {
    const params = new URLSearchParams(location.search);
    params.set("id", String(postId));
    navigate(`/posts?${params.toString()}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (params.get("type") === "notice") {
          const response = await getNotices(
            params.get("category") || "전체",
            params.get("sort") === "like" ? "view" : "date",
            Number(params.get("page")) || 1
          );
          setNotices(response.data.notices);
          setPosts([]);
          setPages(response.data.page);
        } else {
          if (params.get("search")) {
            const response = await getSearch(
              params.get("search") || "",
              params.get("sort") || "date",
              Number(params.get("page")) || 1
            );
            setPosts(response.data.posts);
            setPages(response.data.pages);
          } else {
            const response = await getPosts(
              params.get("category") || "전체",
              params.get("sort") || "date",
              Number(params.get("page")) || 1
            );
            setPosts(response.data.posts);
            setPages(response.data.pages);
          }
          setNotices([]);
        }
      } catch (error) {
        console.error("게시글/공지 가져오기 실패", error);
      }
    };

    const params = new URLSearchParams(location.search);
    fetchData();
  }, [location.search]);

  return (
    <PostsListWrapper>
      <PostsSort />
      <CardsWrapper>
        {posts.map((post) => (
          <PostCard key={post.id} onClick={() => handleClickPost(post.id)}>
            <div className="category-like-comment">
              <span className="category">{post.category}</span>
              <span className="like-comment">
                <img src={heart} alt="" />
                <span>{post.like}</span>
                <span></span>
                <span>댓글</span>
                <span>{post.replyCount}</span>
              </span>
            </div>
            <div className="title">{post.title}</div>
            <div className="content flex-1">{post.content}</div>
            <div className="createDate">{post.createDate}</div>
          </PostCard>
        ))}
        {notices.map((notice) => (
          <PostCard
            key={notice.id}
            onClick={() => window.open("https://" + notice.url)}
          >
            <div className="category-like-comment">
              <span className="category">{notice.category}</span>
              <span className="like-comment">
                <span>조회</span>
                <span>{notice.view}</span>
              </span>
            </div>
            <div className="content">{notice.writer}</div>
            <div className="title flex-1">{notice.title}</div>
            <div className="createDate">{notice.createDate}</div>
          </PostCard>
        ))}
      </CardsWrapper>
      <Pagination pages={pages} />
    </PostsListWrapper>
  );
}

const PostsListWrapper = styled.div`
  border: 6px solid #eaeaea;
  border-width: 6px 0 0 6px;
`;

const CardsWrapper = styled.div`
  padding-left: 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  min-height: 560px; // Pagination 위치를 위해
  margin-bottom: 32px; // Pagination 위치를 위해
`;

const PostCard = styled.button`
  width: 224px;
  height: 268px;
  border: 2px solid rgba(170, 201, 238, 1);
  background-color: transparent;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .category-like-comment {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .category {
      font-size: 16px;
      font-weight: 500;
      color: #0e4d9d;
      border-bottom: 1px solid #7aa7e5;
    }
    .like-comment {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
      img {
        height: 10px;
      }
    }
  }
  .title {
    width: 100%;
    font-size: 16px;
    font-weight: 600;
    text-align: start;
  }
  .content {
    width: 100%;
    font-size: 14px;
    font-weight: 500;
    color: #888888;
    overflow: hidden;
    text-align: start;
  }
  .createDate {
    width: 100%;
    font-size: 32px;
    font-weight: 700;
    color: #7aa7e5;
    text-align: center;
  }
  .flex-1 {
    flex: 1;
  }
`;
