import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import PostsSort from "@/components/desktop/posts/PostsSort";
import Pagination from "@/components/desktop/posts/Pagination";
import WriteButton from "@/components/desktop/posts/WriteButton";
import {
  ALL_NOTICE_CATEGORY,
  getNoticeListQueryKey,
  getNotices,
  getNoticeSortParam,
  NOTICE_LIST_STALE_TIME,
} from "@/apis/notices";
import { getSearch } from "@/apis/search";
import { getPosts } from "@/apis/posts";
import { Post } from "@/types/posts";
import heart from "@/resources/assets/posts/posts-heart.svg";

export default function PostsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState(1);

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const type = params.get("type") ?? "tips";
  const category = params.get("category") ?? ALL_NOTICE_CATEGORY;
  const page = Number(params.get("page")) || 1;
  const sort = params.get("sort") ?? "date";
  const query = params.get("search") ?? "";
  const isNoticeType = type === "notice";
  const noticeSort = getNoticeSortParam(sort);

  const { data: noticeResponse } = useQuery({
    queryKey: getNoticeListQueryKey(category, noticeSort, page),
    queryFn: () => getNotices(category, noticeSort, page),
    enabled: isNoticeType,
    staleTime: NOTICE_LIST_STALE_TIME,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isNoticeType) {
      return;
    }

    let isCancelled = false;

    const fetchPosts = async () => {
      try {
        const response = query
          ? await getSearch(query, sort, page)
          : await getPosts(category, sort, page);

        if (isCancelled) {
          return;
        }

        setPosts(response.data.contents);
        setPages(response.data.pages);
      } catch (error) {
        if (!isCancelled) {
          console.error("게시글/공지 가져오기 실패", error);
        }
      }
    };

    fetchPosts();

    return () => {
      isCancelled = true;
    };
  }, [category, isNoticeType, page, query, sort]);

  const notices = noticeResponse?.data.contents ?? [];
  const totalPages = isNoticeType ? noticeResponse?.data.pages ?? page : pages;

  const handleClickPost = (postId: number) => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set("id", String(postId));
    navigate(`/posts?${nextParams.toString()}`);
  };

  return (
    <PostsListWrapper>
      <PostsSort />
      <CardsWrapper>
        {!isNoticeType &&
          posts.map((post) => (
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

        {isNoticeType &&
          notices.map((notice) => (
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
        <Pagination pages={totalPages} />
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
