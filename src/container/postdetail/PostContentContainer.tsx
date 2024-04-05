import styled from 'styled-components';
import PostContent from '../../component/postdetail/post/postcontent';
import PostTitle from '../../component/postdetail/post/posttitle';
import PostCategory from '../../component/postdetail/post/postcategory';

interface PostContentContainerProps {
    id: number;
    title: string;
    createDate: string;
    view: number;
    writer: string;
    content: string;
    imageCount: number;
    category: string;
    hasAuthority: boolean;
}

export default function PostContentContainer({ id, title, createDate, view, writer, content, imageCount, category, hasAuthority }: PostContentContainerProps) {
    return (
        <> <PostCategory category={category}/>
            <PostTitle title={title} createDate={createDate} view={view} writer={writer} id={id} hasAuthority={hasAuthority} /> {/* PostTitle 컴포넌트에 title prop 전달 */}
           
            <PostContent id={id} content={content} imageCount={imageCount}/>
            </>
    );
}

