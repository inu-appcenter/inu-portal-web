import PostContent from "../../component/postdetail/post/PostContent";
import PostTitle from "../../component/postdetail/post/PostTitle";
import PostCategory from "../../component/postdetail/post/PostCategory";

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
  category,
  hasAuthority,
}: PostContentContainerProps) {
  return (
    <>
      <PostCategory category={category} />
      <PostTitle
        title={title}
        createDate={createDate}
        view={view}
        writer={writer}
        id={id}
        hasAuthority={hasAuthority}
      />{" "}
      <PostContent id={id} content={content} imageCount={imageCount} />
    </>
  );
}
