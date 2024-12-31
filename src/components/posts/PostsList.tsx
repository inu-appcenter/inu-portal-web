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
import WriteButton from "components/posts/WriteButton";

export default function PostsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pages, setPages] = useState(1);

  const [type, setType] = useState(""); // 이전 상태와 동일한지 확인
  const [category, setCategory] = useState(""); // 이전 상태와 동일한지 확인
  const [page, setPage] = useState(""); // 이전 상태와 동일한지 확인
  const [sort, setSort] = useState(""); // 이전 상태와 동일한지 확인
  const [query, setQuery] = useState("");

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
          setNotices(response.data.contents);
          setPosts([]);
          setPages(response.data.pages);
        } else {
          if (params.get("search")) {
            const response = await getSearch(
              params.get("search") || "",
              params.get("sort") || "date",
              Number(params.get("page")) || 1
            );
            setPosts(response.data.contents);
            setPages(response.data.pages);
          } else {
            const response = await getPosts(
              params.get("category") || "전체",
              params.get("sort") || "date",
              Number(params.get("page")) || 1
            );
            setPosts(response.data.contents);
            setPages(response.data.pages);
          }
          setNotices([]);
        }
      } catch (error) {
        console.error("게시글/공지 가져오기 실패", error);
      }
    };

    const params = new URLSearchParams(location.search);
    const tmpType = params.get("type") ? params.get("type") : "tips";
    const tmpCategory = params.get("category")
      ? params.get("category")
      : "전체";
    const tmpPage = params.get("page") ? params.get("page") : "1";
    const tmpSort = params.get("sort") ? params.get("sort") : "date";
    const tmpQuery = params.get("search") ? params.get("search") : "";
    console.log(tmpQuery, query);
    if (
      tmpType === type &&
      tmpCategory === category &&
      tmpPage === page &&
      tmpSort === sort &&
      tmpQuery === query
    ) {
      return; // 이전 상태와 동일한지 확인
    }
    setType(tmpType || "tips");
    setCategory(tmpCategory || "전체");
    setPage(tmpPage || "1");
    setSort(tmpSort || "date");
    setQuery(tmpQuery || "");
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
      <div className="pagination-writebutton">
        <span />
        <Pagination pages={pages} />
        <WriteButton />
      </div>
    </PostsListWrapper>
  );
}

const PostsListWrapper = styled.div`
  border: 6px solid #eaeaea;
  border-width: 6px 0 0 6px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  .pagination-writebutton {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const CardsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  min-height: 560px;
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
