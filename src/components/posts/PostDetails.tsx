import { deletePost, getPostDetail } from "apis/posts";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { /* useLocation , */ useNavigate } from "react-router-dom";
import styled from "styled-components";
import { PostDetail } from "types/posts";
import pencil from "resources/assets/posts/pencil.svg";
import eye from "resources/assets/posts/eye.svg";
import LikeScrapButtons from "./LikeScrapButtons";
import PostReplies from "./PostReplies";

export default function PostDetails({ postId }: { postId: number }) {
  // const location = useLocation();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail>();

  const fetchData = async () => {
    try {
      if (postId) {
        const response = await getPostDetail(postId);
        setPost(response.data);
      }
    } catch (error) {
      console.error("게시글 가져오기 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 404:
            alert("존재하지 않는 게시글입니다.");
            navigate(-1);
            break;
          default:
            alert("게시글 가져오기 실패");
            navigate(-1);
            break;
        }
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  const handleClickBefore = () => {
    // 이전 페이지로
    navigate(-1);
    // id만 제거
    // const params = new URLSearchParams(location.search);
    // params.delete("id");
    // navigate(`/posts?${params.toString()}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await deletePost(postId);
      navigate(-1);
    } catch (error) {
      console.error("게시글 삭제 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 403:
            alert("이 게시글의 수정/삭제에 대한 권한이 없습니다.");
            break;
          case 404:
            alert("존재하지 않는 게시글입니다.");
            break;
          default:
            alert("게시글 삭제 실패");
            break;
        }
      }
    }
  };

  return (
    <>
      <PostDetailWrapper>
        <button className="back-button" onClick={handleClickBefore}>
          ⬅️ 이전
        </button>
        {post && (
          <PostCard>
            <div className="category-utils">
              <span className="category">{post.category}</span>
              <div className="utils">
                {post.hasAuthority && (
                  <>
                    <button
                      onClick={() => handleDelete()}
                      className="util-button"
                    >
                      삭제
                    </button>
                    <button
                      className="util-button"
                      onClick={() => navigate(`/write?id=${post.id}`)}
                    >
                      수정
                    </button>
                  </>
                )}
                <span className="createDate">
                  <img src={pencil} alt="" />
                  <span>{post.createDate}</span>
                </span>
                <span className="view">
                  <img src={eye} alt="" />
                  <span>{post.view}</span>
                </span>
                <span className="writer">
                  <span>{post.writer}</span>
                  <img
                    src={`https://portal.inuappcenter.kr/images/profile/${post.fireId}`}
                    alt=""
                  />
                </span>
              </div>
            </div>
            <h1 className="title">{post.title}</h1>
            <div className="images">
              {Array.from({ length: post.imageCount }, (_, index) => (
                <img
                  key={index}
                  src={`https://portal.inuappcenter.kr/api/posts/${
                    post.id
                  }/images/${index + 1}`}
                  alt={`이미지 ${index + 1}`}
                  onClick={() =>
                    window.open(
                      `https://portal.inuappcenter.kr/api/posts/${
                        post.id
                      }/images/${index + 1}`
                    )
                  }
                />
              ))}
            </div>
            <p className="content">{post.content}</p>
            <LikeScrapButtons
              id={post.id}
              like={post.like}
              isLiked={post.isLiked}
              scrap={post.scrap}
              isScraped={post.isScraped}
            />
          </PostCard>
        )}
      </PostDetailWrapper>
      {post && (
        <PostReplies
          postId={post.id}
          replies={post.replies}
          refreshReplies={fetchData}
        />
      )}
    </>
  );
}

const PostDetailWrapper = styled.div`
  border: 6px solid #eaeaea;
  border-width: 6px 0 0 6px;
  min-height: calc(683.5px - 6px); // PostsList와 맞추기 위해
  padding: 24px 24px;
  .back-button {
    background-color: transparent;
    padding: 6px 12px;
    color: #888888;
    border: 1px solid #888888;
    border-radius: 6px;
  }
`;

const PostCard = styled.div`
  height: calc(100% - 32px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  .category-utils {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .category {
      font-size: 24px;
      font-weight: 500;
      color: #0e4d9d;
      padding-bottom: 2px;
      border-bottom: 2px solid #7aa7e5;
    }
    .utils {
      display: flex;
      align-items: center;
      gap: 20px;
      .util-button {
        border: none;
        border-radius: 12px;
        background-color: rgba(239, 242, 249, 1);
        font-size: 16px;
        padding: 8px 12px;
      }
      .createDate {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(150, 150, 150, 1);
      }
      .view {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(150, 150, 150, 1);
      }
      .writer {
        display: flex;
        gap: 8px;
        height: 44px;
        padding-left: 16px;
        background: linear-gradient(270deg, #ffffff 24.49%, #aac9ee 100%);
        border-radius: 100px;
        span {
          min-width: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        img {
          border-radius: 100px;
        }
      }
    }
  }
  .title {
    font-size: 32px;
    font-weight: 600;
  }
  .images {
    width: 1054px;
    padding-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 16px;
    overflow-x: scroll;
    img {
      max-height: 400px;
    }
  }
  .content {
    flex: 1;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;
