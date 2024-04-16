import styled from 'styled-components';
import PostContentContainer from '../container/postdetail/PostContentContainer';
import PostUtility from '../container/postdetail/PostUtilityContainer';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import getPost from '../utils/getPost';

import ReturnButton from '../component/postdetail/post/ReturnButton';
import CommentList from '../component/postdetail/comment/commentlist';
import CommentInput from '../component/postdetail/comment/commentinput';
import { useSelector } from 'react-redux';


interface Post {
    id: string;
    title: string;
    category: string;
    writer: string;
    content: string;
    like: number;
    scrap: number;
    view: number;
    isLiked: boolean;
    isScraped: boolean;
    hasAuthority: boolean;
    createDate: string;
    modifiedDate: string;
    imageCount: number;
    bestReplies: Replies[];
    replies: Replies[];
}

interface Replies {
    id: number;
    writer: string;
    content: string;
    like: number;
    isLiked: boolean;
    isAnonymous: boolean;
    hasAuthority: boolean;
    createDate: string;
    modifiedDate: string;
    reReplies: Replies[];
}

export default function PostDetail(){
    const token = useSelector((state: any) => state.user.token);
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post|null>();
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
        <>
        <PostWrapper>
            <ReturnButton />
            <PostContentContainer id={post.id} title={post.title} createDate={post.createDate} view={post.view} writer={post.writer} content={post.content} imageCount={post.imageCount} category={post.category} hasAuthority={post.hasAuthority}/>
            <PostUtility like={post.like} isLiked={post.isLiked} scrap={post.scrap} isScraped={post.isScraped} hasAuthority={post.hasAuthority}/> {/*기능버튼(스크랩, 좋아요...)*/}
        </PostWrapper>
        <CommentWrapper>
            <CommentList bestComment={post.bestReplies[0]} comments={post.replies} onCommentUpdate={() => setCommentUpdated(true)}/>
            <CommentInput onCommentUpdate={() => setCommentUpdated(true)}></CommentInput>
        </CommentWrapper>
        </>
    ) : (
            <div>Loading...</div>
        )}
    </>
    )
}

const PostWrapper = styled.div `
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
`

const CommentWrapper = styled.div `
    border-top: solid #EAEAEA 5px;
    padding-top: 20px;
    padding-bottom: 80px;
`
