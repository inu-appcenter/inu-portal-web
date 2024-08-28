import PostTitle from "../../components/postdetail/post/posttitle";
import PostContent from "../../components/postdetail/post/postcontent";
import styled from "styled-components";

interface PostContentContainerProps {
  id: string;
  title: string;
  createDate: string;
  view: number;
  writer: string;
  content: string;
  imageCount: number;
  category: string;
  hasAuthority: boolean;
}

export default function PostContentContainer({
  id,
  title,
  createDate,
  view,
  writer,
  content,
  imageCount,
  /*category,*/ hasAuthority,
}: PostContentContainerProps) {
  return (
    <Wrapper>
      <PostTitle
        title={title}
        createDate={createDate}
        view={view}
        writer={writer}
        id={id}
        hasAuthority={hasAuthority}
      />
      <PostContent id={id} content={content} imageCount={imageCount} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 10px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: calc(100vh - 150px);
  overflow-y: auto;
`;
