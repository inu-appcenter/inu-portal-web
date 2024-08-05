import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getMembersLikes } from "../../utils/API/Members";
import CommontTitle from "../containers/mypage/Title";
import styled from "styled-components";
import Card from "../containers/mypage/Card";
import Empty from "../components/mypage/Empty";

interface BaseContent {
  id: string;
  title: string;
  category: string;
  writer: string;
  content: string;
  createDate: string;
  modifiedDate: string;
}

interface Like extends BaseContent {
  like: number;
  scrap: number;
  imageCount: number;
}

export default function MobileMyPageComment() {
  const token = useSelector((state: any) => state.user.token);
  const [likes, setLikes] = useState<Like[]>([]); 

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    console.log(token);
    console.log("likes", likes.length); 
  }, [likes]); 

  const fetchComments = async () => {
    const response = await getMembersLikes(token, "date");
    if (response.status === 200) {
      console.log(response.body.data, "ㅎ역");
      setLikes(response.body.data);
    }
  };

  return (
    <MobileMyPageCommentWrapper>
      <CommontTitle title={"좋아요한 글"} />
      {likes.length === 0 ? (
        <Empty/>
      ) : (
        <Card post={likes} /> 
      )}
    </MobileMyPageCommentWrapper>
  );
}

const MobileMyPageCommentWrapper = styled.div`
`;

