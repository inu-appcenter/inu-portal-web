import styled from "styled-components";
import { MembersReplies } from "types/members";
import { Post } from "types/posts";
import {
  getMembersLikes,
  getMembersReplies,
  getMembersPosts,
} from "apis/members";
import { useEffect, useState } from "react";
import sortDrop from "resources/assets/mypage/sort-drop.svg";
import likeImage from "resources/assets/mypage/like.svg";
import replyImage from "resources/assets/mypage/reply.svg";
import postImage from "resources/assets/mypage/post.svg";
import calendarImage from "resources/assets/mypage/calendar.svg";
import { useNavigate } from "react-router-dom";

export default function Activity() {
  const [likeSort, setLikeSort] = useState("date");
  const [replySort, setReplySort] = useState("date");
  const [postSort, setPostSort] = useState("date");
  const [likePost, setLikePost] = useState<Post[]>([]);
  const [replyPost, setReplyPost] = useState<MembersReplies[]>([]);
  const [postPost, setPostPost] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMembersLikes(likeSort);
        setLikePost(response.data);
      } catch (error) {
        console.error("회원이 좋아요한 모든 글 가져오기 실패", error);
      }
    };
    fetchData();
  }, [likeSort]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMembersReplies(replySort);
        setReplyPost(response.data);
      } catch (error) {
        console.error("회원이 작성한 모든 댓글 가져오기 실패", error);
      }
    };
    fetchData();
  }, [replySort]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMembersPosts(postSort, 1);
        setPostPost(response.data);
      } catch (error) {
        console.error("회원이 작성한 모든 글 가져오기 실패", error);
      }
    };
    fetchData();
  }, [postSort]);

  return (
    <ActivityWrapper>
      <h1>내 활동</h1>
      <div>
        <div className="activity-title">
          <div>
            <img src={likeImage} alt="" />
            <span>{likePost.length}</span>
          </div>
          <div className="sort-dropdown">
            <span className="sortby">Sort by</span>
            <span className="dropdown">
              <span>{likeSort}</span>
              <div className="dropdown-menu">
                <button onClick={() => setLikeSort("date")}>date</button>
                <button onClick={() => setLikeSort("like")}>like</button>
              </div>
            </span>
            <img src={sortDrop} alt="" />
          </div>
        </div>
        <div className="posts-wrapper">
          {likePost.map((post) => (
            <button
              key={post.id}
              onClick={() => navigate(`/posts?id=${post.id}`)}
            >
              <div className="category-title">
                <span className="category">{post.category}</span>
                <span className="title">{post.title}</span>
              </div>
              <div className="date-like">
                <img src={calendarImage} alt="" />
                <span className="date">{post.createDate}</span>
                <img src={likeImage} alt="" />
                <span>{post.like}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="activity-title">
          <div>
            <img src={replyImage} alt="" />
            <span>{replyPost.length}</span>
          </div>
          <div className="sort-dropdown">
            <span className="sortby">Sort by</span>
            <span className="dropdown">
              <span>{replySort}</span>
              <div className="dropdown-menu">
                <button onClick={() => setReplySort("date")}>date</button>
                <button onClick={() => setReplySort("like")}>like</button>
              </div>
            </span>
            <img src={sortDrop} alt="" />
          </div>
        </div>
        <div className="posts-wrapper">
          {replyPost.map((post) => (
            <button
              key={post.id}
              onClick={() => navigate(`/posts?id=${post.postId}`)}
            >
              <div className="category-title">
                <span className="category">{post.title}</span>
                <span className="title">{post.content}</span>
              </div>
              <div className="date-like">
                <img src={calendarImage} alt="" />
                <span className="date">{post.createDate}</span>
                <img src={likeImage} alt="" />
                <span>{post.like}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="activity-title">
          <div>
            <img src={postImage} alt="" />
            <span>{postPost.length}</span>
          </div>
          <div className="sort-dropdown">
            <span className="sortby">Sort by</span>
            <span className="dropdown">
              <span>{postSort}</span>
              <div className="dropdown-menu">
                <button onClick={() => setPostSort("date")}>date</button>
                <button onClick={() => setPostSort("like")}>like</button>
              </div>
            </span>
            <img src={sortDrop} alt="" />
          </div>
        </div>
        <div className="posts-wrapper">
          {postPost.map((post) => (
            <button
              key={post.id}
              onClick={() => navigate(`/posts?id=${post.id}`)}
            >
              <div className="category-title">
                <span className="category">{post.category}</span>
                <span className="title">{post.title}</span>
              </div>
              <div className="date-like">
                <img src={calendarImage} alt="" />
                <span className="date">{post.createDate}</span>
                <img src={likeImage} alt="" />
                <span>{post.like}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </ActivityWrapper>
  );
}

const ActivityWrapper = styled.div`
  padding: 64px;
  background: linear-gradient(to bottom, #dbebff 70%, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 32px;
  h1 {
    color: #0e4d9d;
    font-size: 32px;
    font-weight: 600;
    margin: 0;
  }
  .activity-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    font-weight: 600;
    color: #0e4d9d;
    margin-bottom: 16px;
    div {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sort-dropdown {
      position: relative;

      .sortby {
        color: rgba(150, 150, 150, 1);
      }
      .dropdown {
        display: inline-block;
        position: relative;

        &:hover .dropdown-menu {
          display: flex;
        }

        .dropdown-menu {
          display: none;
          flex-direction: column;
          position: absolute;
          top: 100%;
          left: 0;
          background: rgba(255, 255, 255, 0.5);
          z-index: 10;

          button {
            background: transparent;
            border: none;
            padding: 4px;
            font-size: 20px;
            color: #0e4d9d;

            &:hover {
              background: rgba(122, 167, 229, 0.1);
            }
          }
        }
      }
    }
  }
  .posts-wrapper {
    display: flex;
    flex-direction: column;
    height: 184px;
    overflow-x: scroll;
    gap: 16px;
    button {
      font-weight: 500;
      padding: 16px;
      margin-right: 8px;
      background: transparent;
      border: 1px solid rgba(122, 167, 229, 1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .category-title {
        display: flex;
        align-items: center;
        gap: 16px;
        .category {
          background-color: rgba(170, 201, 238, 1);
          color: white;
          font-size: 16px;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
        }
        .title {
          font-size: 16px;
        }
      }
      .date-like {
        img {
          height: 14px;
        }
        .date {
          color: rgba(150, 150, 150, 1);
        }
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
    }
  }
`;
