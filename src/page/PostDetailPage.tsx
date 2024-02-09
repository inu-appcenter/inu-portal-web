import styled from 'styled-components';
import ReturnButton from '../component/postdetail/post/returnButton';
import PostContentContainer from '../container/postdetail/PostContentContainer';
import PostUtility from '../container/postdetail/PostUtilityContainer';
import PostComment from '../container/postdetail/PostCommentContainer';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import getPost from '../utils/getPost';

interface post {
    id: number;
    title: string;
    category: string;
    writer: string;
    good: number;
    bad: number;
    scrap: number;
    createDate: string;
    modifiedDate: string;
  }

export default function PostDetail(){
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<post|null>();
    useEffect(() => {
        const fetchPost = async () => {
          const postDetail = await getPost(id);
          setPost(postDetail);
        };
        fetchPost();
    }, [id]);
    return(
        <>
        {post &&
            <PostWrapper>
                <ReturnButton />
                <PostContentContainer title={post.title} writer={post.writer} />
                <PostUtility good={post.good} scrap={post.scrap}/> {/*기능버튼(스크랩, 좋아요...)*/}
                <PostComment/> {/*댓글*/}
            </PostWrapper>
        }
        </>
    )
}

const PostWrapper = styled.div `
    padding: 100px; // (임시)
`
