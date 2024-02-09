import PostContent from '../../component/postdetail/post/postcontent';
import PostTitle from '../../component/postdetail/post/posttitle';


interface PostContentContainerProps {
    title: string;
    writer: string;
}

export default function PostContentContainer({ title, writer }: PostContentContainerProps) {
    return (
        <>
            <PostTitle title={title} /> {/* PostTitle 컴포넌트에 title prop 전달 */}
            <PostContent writer={writer}/>
        </>
    );
}