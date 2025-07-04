import { useEffect, useState } from "react";
import { getMembersLikes } from "apis/members";
import CommontTitle from "mobile/containers/common/MobileTitleHeader.tsx";
import styled from "styled-components";
import Card from "mobile/containers/mypage/Card";
import Empty from "mobile/components/mypage/Empty";
import { Post } from "types/posts";
import useMobileNavigate from "../../hooks/useMobileNavigate.ts";

export default function MobileMyPageLike() {
  const [likePost, setLikePost] = useState<Post[]>([]);
  const mobileNavigate = useMobileNavigate();

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

  return (
    <MobileMyPageLikeWrapper>
      <CommontTitle
        title={"좋아요 한 글"}
        onback={() => mobileNavigate("/mypage")}
      />
      {likePost.length === 0 ? (
        <Empty />
      ) : (
        <Card post={likePost} onUpdate={fetchData} type="like" />
      )}
    </MobileMyPageLikeWrapper>
  );
}

const MobileMyPageLikeWrapper = styled.div``;
