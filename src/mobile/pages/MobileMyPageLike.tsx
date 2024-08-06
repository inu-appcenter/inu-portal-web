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

export default function MobileMyPageLike() {
  const token = useSelector((state: any) => state.user.token);
  const [likes, setLikes] = useState<Like[]>([]); 

  useEffect(() => {
    fetchLikes();
  }, []);

  useEffect(() => {
    console.log(token);
    console.log("likes", likes.length); 
  }, [likes]); 

  const fetchLikes = async () => {
    try {
      const response = await getMembersLikes(token, "date");
      if (response.status === 200) {
        console.log(response.body.data, "ㅎ역");
        setLikes(response.body.data);
      }
    } catch (error) {
      console.error("좋아요 가져오기 오류:", error);
      alert("좋아요를 가져오는 중 오류가 발생했습니다.");
    }
  };

  return (
    <MobileMyPageLikeWrapper>
      <CommontTitle title={"좋아요한 글"} />
      {likes.length === 0 ? (
        <Empty/>
      ) : (
        <Card post={likes} onUpdate={fetchLikes} type="like" /> 
      )}
    </MobileMyPageLikeWrapper>
  );
}

const MobileMyPageLikeWrapper = styled.div`
`;

