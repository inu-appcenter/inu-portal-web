import React from 'react';
import Comment from './comment';

interface CommentListProps{
    comments: {author: string; content: string}[];
}

const CommentList: React.FC<CommentListProps> = ({comments}) => {
    return(
        <div className='CommentListContainer'>
            <h3>댓글 목록</h3>
            {comments.map((comment, index) => (
                <Comment key={index} {...comment} />
            ))}
        </div>
    );
};

export default CommentList;