import styled from 'styled-components';
import PostContent from '../container/postdetail/PostContentContainer';
import PostUtility from '../container/postdetail/PostUtilityContainer';
import PostComment from '../container/postdetail/PostCommentContainer';

export default function PostDetail(){

    return(
        <PostWrapper>
            <PostContent/> {/*본문 */}
            <PostUtility/> {/*기능버튼(스크랩, 좋아요...)*/}
            <PostComment/> {/*댓글*/}
        </PostWrapper>
    )
}

const PostWrapper = styled.div `
`
