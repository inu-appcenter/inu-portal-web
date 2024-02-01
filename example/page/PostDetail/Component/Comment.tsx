import React from 'react'

interface CommnetProps{
    author: string;
    content: string;
}

const Comment: React.FC<CommnetProps>= ({ author, content }) => {
    return(
        <div>
            <strong>{author}</strong>: {content}
        </div>
    );
};

export default Comment;
