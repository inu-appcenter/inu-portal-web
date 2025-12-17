import { useEffect, useState } from "react";
import { getMembersLikes } from "@/apis/members";
import styled from "styled-components";
import Card from "@/containers/mobile/mypage/Card";
import Empty from "@/components/mobile/mypage/Empty";
import { Post } from "@/types/posts";
import MobileHeader from "../../containers/mobile/common/MobileHeader.tsx";
import { useHeader } from "@/context/HeaderContext";

export default function MobileMyPageLike() {
  const [likePost, setLikePost] = useState<Post[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getMembersLikes("date");
      setLikePost(response.data);
    } catch (error) {
      console.error("회원이 좋아요한 모든 글 가져오기 실패", error);
    }
  };

  // 헤더 설정 주입
  useHeader({
    title: "좋아요한 글",
  });

  return (
    <MobileMyPageLikeWrapper>
      <MobileHeader />
      {likePost.length === 0 ? (
        <Empty />
      ) : (
        <Card post={likePost} onUpdate={fetchData} type="like" />
      )}
    </MobileMyPageLikeWrapper>
  );
}

const MobileMyPageLikeWrapper = styled.div`
  padding-top: 72px;
`;
