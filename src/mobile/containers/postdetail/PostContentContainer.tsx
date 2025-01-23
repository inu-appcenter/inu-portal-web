import PostTitle from "mobile/components/postdetail/post/posttitle";
import PostContent from "mobile/components/postdetail/post/postcontent";
import styled from "styled-components";
import { PostDetail } from "types/posts";
import { CouncilNotice } from "types/councilNotices";
import { Petition } from "types/petitions";

interface PostContentContainerProps {
  post?: PostDetail;
  councilNotice?: CouncilNotice;
  petition?: Petition;
}

export default function PostContentContainer({
  post,
  councilNotice,
  petition,
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
      {petition && (
        <>
          <PostTitle
            id={petition.id}
            title={petition.title}
            createDate={petition.createDate}
            view={petition.view}
          />
          <PostContent
            id={petition.id}
            content={petition.content}
            imageCount={petition.imageCount}
            type="PETITION"
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
