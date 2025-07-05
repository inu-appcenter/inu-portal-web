import { useEffect, useState } from "react";
import { getMembersReplies } from "apis/members";
import { MembersReplies } from "types/members";
import styled from "styled-components";
import Empty from "mobile/components/mypage/Empty";
import CardComment from "mobile/containers/mypage/CardComment";

export default function MobileMyPageComment() {
  const [replyPost, setReplyPost] = useState<MembersReplies[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getMembersReplies("date");
      setReplyPost(response.data);
    } catch (error) {
      console.error("회원이 작성한 모든 댓글 가져오기 실패", error);
    }
  };

  return (
    <MobileMyPageCommentWrapper>
      {replyPost.length === 0 ? (
        <Empty />
      ) : (
        <CardComment posts={replyPost} onCommentsUpdate={fetchData} />
      )}
    </MobileMyPageCommentWrapper>
  );
}

const MobileMyPageCommentWrapper = styled.div`
  width: 100%;
`;
