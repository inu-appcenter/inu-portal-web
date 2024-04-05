import PostContent from '../../component/postdetail/post/postcontent';
import PostTitle from '../../component/postdetail/post/posttitle';


interface PostContentContainerProps {
    id: number;
    title: string;
    createDate: string;
    view: number;
    writer: string;
    content: string;
    imageCount: number;
}

export default function PostContentContainer({ id, title, createDate, view, writer, content, imageCount }: PostContentContainerProps) {
    return (
        <>
            <PostTitle title={title} createDate={createDate} view={view} writer={writer} /> {/* PostTitle 컴포넌트에 title prop 전달 */}
            <PostContent id={id} content={content} imageCount={imageCount}/>
        </>
    );
}