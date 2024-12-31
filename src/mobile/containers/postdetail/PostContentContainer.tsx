import PostTitle from "mobile/components/postdetail/post/posttitle";
import PostContent from "mobile/components/postdetail/post/postcontent";
import styled from "styled-components";
import { PostDetail } from "types/posts";
import { CouncilNotice } from "types/councilNotices";

interface PostContentContainerProps {
  post?: PostDetail;
  councilNotice?: CouncilNotice;
}

export default function PostContentContainer({
  post,
  councilNotice,
}: PostContentContainerProps) {
  return (
    <Wrapper>
      {post && (
        <>
          <PostTitle
            id={post.id}
            title={post.title}
            createDate={post.createDate}
            view={post.view}
            writer={post.writer}
          />
          <PostContent
            id={post.id}
            content={post.content}
            imageCount={post.imageCount}
            type="TIPS"
          />
        </>
      )}
      {councilNotice && (
        <>
          <PostTitle
            id={councilNotice.id}
            title={councilNotice.title}
            createDate={councilNotice.createDate}
            view={councilNotice.view}
          />
          <PostContent
            id={councilNotice.id}
            content={councilNotice.content}
            imageCount={councilNotice.imageCount}
            type="COUNCILNOTICE"
          />
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 20px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 100px;
`;
