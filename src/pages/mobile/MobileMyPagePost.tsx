import { useEffect, useState } from "react";
import { getMembersPosts } from "@/apis/members";
import styled from "styled-components";
import Card from "@/containers/mobile/mypage/Card";
import Empty from "@/components/mobile/mypage/Empty";
import { Post } from "@/types/posts";
import MobileHeader from "../../containers/mobile/common/MobileHeader.tsx";

export default function MobileMyPagePost() {
  const [postPost, setPostPost] = useState<Post[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getMembersPosts("date");
      setPostPost(response.data);
    } catch (error) {
      console.error("회원이 작성한 모든 글 가져오기 실패", error);
    }
  };

  return (
    <MobileMyPagePostWrapper>
      <MobileHeader title={"내가 쓴 글"} />
      {postPost.length === 0 ? (
        <Empty />
      ) : (
        <Card post={postPost} onUpdate={fetchData} type="post" />
      )}
    </MobileMyPagePostWrapper>
  );
}

const MobileMyPagePostWrapper = styled.div`
  width: 100%;
  padding-top: 72px;
`;
