import { useEffect, useState } from "react";
import { getMembersPosts } from "apis/members";
import CommontTitle from "mobile/containers/common/MobileTitleHeader.tsx";
import styled from "styled-components";
import Card from "mobile/containers/mypage/Card";
import Empty from "mobile/components/mypage/Empty";
import { Post } from "types/posts";
import useMobileNavigate from "../../hooks/useMobileNavigate.ts";

export default function MobileMyPagePost() {
  const [postPost, setPostPost] = useState<Post[]>([]);
  const mobileNavigate = useMobileNavigate();

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
      <CommontTitle
        title={"내가 쓴 글"}
        onback={() => mobileNavigate("/mypage")}
      />
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
`;
