//본문-내용
//ToDo: 글쓰기(CreatePost)랑 연동해서 title 받아오기

interface PostContentProps {
  writer: string;
  content: string;
}
export default function PostContent({ writer, content }: PostContentProps) {
  return (
    <>
      <div className='post-contents'>
        <h3>{writer}</h3>
        <div className='contents'>{content}</div>
      </div>
    </>
  );
}
