import styled from "styled-components";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

import {
  getMembersReplies,
  getMembersPosts,
  getMembersLikes,
} from "old/utils/API/Members";

import UserComment from "./usercomment";
import ActiveTitle from "./activetitle";
import LikePost from "./likepost";
import UserPost from "./userpost";

interface loginInfo {
  user: {
    token: string;
  };
}

interface PostInfo {
  id: number;
  title: string;
  category: string;
  writer: string;
  content: string;
  like: number;
  scrap: number;
  createDate: string;
  modifiedDate: string;
}

interface CommentInfo {
  id: number;
  content: string;
  like: number;
  postId: string;
  createDate: string;
  modifiedDate: string;
}

interface ActiveDocumentsProps {
  likesort: string;
  commentsort: string;
  postsort: string;

  setLikeSort: (sort: string) => void;
  setCommentSort: (sort: string) => void;
  setPostSort: (sort: string) => void;
}

export default function ActiveInfo({
  likesort,
  commentsort,
  postsort,
  setLikeSort,
  setCommentSort,
  setPostSort,
}: ActiveDocumentsProps) {
  const [PostInfo, setPostInfo] = useState<PostInfo[]>([]);
  const [PostLikeInfo, setPostLikeInfo] = useState<PostInfo[]>([]);
  const [PostCommentInfo, setPostCommentInfo] = useState<CommentInfo[]>([]);
  const token = useSelector((state: loginInfo) => state.user.token);

  useEffect(() => {
    const fetchPostInfo = async () => {
      try {
        const response = await getMembersPosts(token, postsort);
        if (response.status === 200) {
          setPostInfo(response.body.data);
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error("에러가 발생했습니다.", error);
        alert("게시글을 가져오는데 실패하였습니다.");
      }
    };

    fetchPostInfo();
  }, [token, postsort]);

  useEffect(() => {
    const likePostInfo = async () => {
      try {
        const response = await getMembersLikes(token, likesort);
        if (response.status === 200) {
          setPostLikeInfo(response.body.data);
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error("에러가 발생했습니다.", error);
        alert("좋아요한 게시글을 가져오는데 실패하였습니다.");
      }
    };

    likePostInfo();
  }, [token, likesort]);

  useEffect(() => {
    const CommentPostInfo = async () => {
      try {
        const response = await getMembersReplies(token, commentsort);
        if (response.status === 200) {
          setPostCommentInfo(response.body.data);
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error("에러가 발생했습니다.", error);
        alert("댓글을 가져오는데 실패하였습니다.");
      }
    };

    CommentPostInfo();
  }, [token, commentsort]);

  return (
    <ActiveWrapper>
      <ActiveTitle />
      <ActiveDetailWrapper>
        <LikePost
          postLikeInfo={PostLikeInfo}
          likesort={likesort}
          setLikeSort={setLikeSort}
        />
        <UserComment
          postCommentInfo={PostCommentInfo}
          commentsort={commentsort}
          setCommentSort={setCommentSort}
        />
        <UserPost
          postinfo={PostInfo}
          postsort={postsort}
          setPostSort={setPostSort}
        />
      </ActiveDetailWrapper>
    </ActiveWrapper>
  );
}

const ActiveWrapper = styled.div`
  padding: 20px 76px;
`;

const ActiveDetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
