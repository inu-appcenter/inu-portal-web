import styled from 'styled-components';
import ReturnButton from '../component/postdetail/post/returnButton';
import PostContentContainer from '../container/postdetail/PostContentContainer';
import PostUtility from '../container/postdetail/PostUtilityContainer';
import PostComment from '../container/postdetail/PostCommentContainer';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import getPost from '../utils/getPost';
import { useSelector } from 'react-redux';

interface post {
    id: number;
    title: string;
    category: string;
    writer: string;
    like: number;
    scrap: number;
    view: number;
    isLiked: boolean;
    isScraped: boolean;
    createDate: string;
    modifiedDate: string;
    replies: replies[];
}

interface replies {
    id: number;
    writer: string;
    content: string;
    like: number;
    isLiked: boolean;
    createDate: string;
    modifiedDate: string;
    reReplies: any;
}

export default function PostDetail(){
    const token = useSelector((state: any) => state.user.token);
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<post|null>();
    const [commentUpdated, setCommentUpdated] = useState(false);
    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
              const postDetail = await getPost(token, id);
              setPost(postDetail);
            };
            setCommentUpdated(false);
            fetchPost();
        }
    }, [id, commentUpdated]);
    return(
        <>
        {post ? (
            <PostWrapper>
                <ReturnButton />
                <PostContentContainer title={post.title} writer={post.writer} />
                <PostUtility like={post.like} isLiked={post.isLiked} scrap={post.scrap} isScraped={post.isScraped}/> {/*기능버튼(스크랩, 좋아요...)*/}
                <PostComment comments={post.replies} onCommentUpdate={() => setCommentUpdated(true)}/> {/*댓글*/}
            </PostWrapper>
        ) : (
            <div>Loading...</div>
        )}
        </>
    )
}

const PostWrapper = styled.div `
    padding: 100px; // (임시)
`
