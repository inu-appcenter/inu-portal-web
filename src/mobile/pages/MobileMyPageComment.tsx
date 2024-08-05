import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getMembersReplies } from "../../utils/API/Members";
import CommontTitle from "../containers/mypage/Title";
import styled from "styled-components";
import Empty from "../components/mypage/Empty";
import CardComment from "../containers/mypage/CardComment";


interface Comment {
    id: string;
    title: string;
    category: string;
    writer: string;
    content: string;
    like: number;
    scrap: number;
    createDate: string;
    modifiedDate: string;

}

export default function MobileMyPageComment() {
  const token = useSelector((state: any) => state.user.token);
  const [comments, setComments] = useState<Comment[]>([]); // Renamed to `comments`
  const [sort, setSort] = useState("date");

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    console.log(token);
    console.log("comments", comments.length); // Updated to log `comments`
  }, [comments]); // Updated dependency

  const fetchComments = async () => {
    const response = await getMembersReplies(token, sort);
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
        <CardComment post={comments} /> // Pass the array to Card
      )}
    </MobileMyPageCommentWrapper>
  );
}

const MobileMyPageCommentWrapper = styled.div`
  /* Add styles here */
`;

