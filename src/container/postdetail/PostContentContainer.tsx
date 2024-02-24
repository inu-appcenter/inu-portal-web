import PostContent from '../../component/postdetail/post/postcontent';
import PostTitle from '../../component/postdetail/post/posttitle';


interface PostContentContainerProps {
    id: number;
    title: string;
    writer: string;
    content: string;
    imageCount: number;
}

export default function PostContentContainer({ id, title, writer, content, imageCount }: PostContentContainerProps) {
    return (
        <>
            <PostTitle title={title} /> {/* PostTitle 컴포넌트에 title prop 전달 */}
            <PostContent id={id} writer={writer} content={content} imageCount={imageCount}/>
        </>
    );
}