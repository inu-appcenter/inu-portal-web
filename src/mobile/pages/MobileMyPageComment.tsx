import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getMembersReplies } from "../../utils/API/Members";
import CommontTitle from "../containers/mypage/Title";
import styled from "styled-components";
import Empty from "../components/mypage/Empty";
import CardComment from "../containers/mypage/CardComment";

interface Comment {
  id: number;
  title: string;
  replyCount: number;
  content: string;
  like: number;
  postId: number;
  createDate: string;
  modifiedDate: string;
}

export default function MobileMyPageComment() {
  const token = useSelector((state: any) => state.user.token);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    console.log(token);
    console.log("comments", comments.length); // Updated to log `comments`
  }, [comments]); // Updated dependency

  const fetchComments = async () => {
    const response = await getMembersReplies(token, "date");
    if (response.status === 200) {
      console.log(response.body.data, "durldurl여기");
      setComments(response.body.data);
    }
  };

  return (
    <MobileMyPageCommentWrapper>
      <CommontTitle title={"작성한 댓글"} />
      {comments.length === 0 ? (
        <Empty/>
      ) : (
        <CardComment posts={comments} /> 
      )}
    </MobileMyPageCommentWrapper>
  );
}

const MobileMyPageCommentWrapper = styled.div`

`;

