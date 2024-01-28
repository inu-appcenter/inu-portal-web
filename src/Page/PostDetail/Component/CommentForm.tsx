import React, { useState } from 'react';

interface CommentFormProps {
    onAddComment: (author: string, content: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onAddComment})=> {
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddComment(author, content);
        setAuthor('');
        setContent('');
    };

    return(
        <form onSubmit={handleSubmit}>
            <label>
                작성자:
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </label>
            <br />
            <label>
                댓글 내용:
                <textarea value={content} onChange={(e) => setContent(e.target.value)}></textarea>
            </label>
            <br/>
            <button type = 'submit'>댓글 작성</button>
        </form>
    );
};

export default CommentForm;