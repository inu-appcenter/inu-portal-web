import PostContent from '../../component/postdetail/post/postcontent';
import PostTitle from '../../component/postdetail/post/posttitle';


interface PostContentContainerProps {
    title: string;
    writer: string;
    content: string;
}

export default function PostContentContainer({ title, writer, content }: PostContentContainerProps) {
    return (
        <>
            <PostTitle title={title} /> {/* PostTitle 컴포넌트에 title prop 전달 */}
            <PostContent writer={writer} content={content}/>
        </>
    );
}