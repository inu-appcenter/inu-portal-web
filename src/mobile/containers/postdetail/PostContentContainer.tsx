import PostTitle from "mobile/components/postdetail/post/posttitle";
import PostContent from "mobile/components/postdetail/post/postcontent";
import styled from "styled-components";
import { PostDetail } from "types/posts";

interface PostContentContainerProps {
  post: PostDetail;
}

export default function PostContentContainer({
  post,
}: PostContentContainerProps) {
  return (
    <Wrapper>
      <PostTitle
        id={post.id}
        title={post.title}
        createDate={post.createDate}
        view={post.view}
        writer={post.writer}
        hasAuthority={post.hasAuthority}
      />
      <PostContent
        id={post.id}
        content={post.content}
        imageCount={post.imageCount}
      />
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
