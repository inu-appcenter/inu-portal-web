import { useState } from "react";
import { useSelector } from "react-redux";
import { postReplies} from "../../../../utils/API/Replies";
import checkedCheckbox from '../../../../resource/assets/checked-checkbox.svg';
import uncheckedCheckbox from '../../../../resource/assets/unchecked-checkbox.svg';
import enterImage from '../../../../resource/assets/enter-img.svg';

interface CommentInputProps {
  id:string;
  onCommentUpdate: () => void;
  
}
interface loginInfo {
  user: {
    token: string;
  };
}
export default function CommentInput({ id, onCommentUpdate }: CommentInputProps) {
  const token = useSelector((state: loginInfo) => state.user.token);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const toggleAnonymous = () => setIsAnonymous(!isAnonymous);

  const handleCommentSubmit = async () => {
    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    if (id === undefined) {
      console.error('ID is undefined');
      return;
    }
    try {
      const response = await postReplies(token, id, content, isAnonymous);
      console.log(id);
      if (response.status === 201) {
        onCommentUpdate();
        setContent("");
        setIsAnonymous(false);
      } else {
        alert('등록 실패');
      }
    } catch (error) {
      console.error('등록 에러', error);
      alert('등록 에러');
    }
  };

  return (
    <div className='comment-area-container'>
      <div className='comment-input-container'>
        <img
          src={isAnonymous ? checkedCheckbox : uncheckedCheckbox}
          alt="Anonymous"
          onClick={toggleAnonymous}
        />
        <span className='anonymous-text'>익명</span>
        <div className='vline'></div>
        <input className='comment-input' value={content} onChange={(e) => setContent(e.target.value)}  placeholder="댓글을 입력하세요."/>
        <img src={enterImage} alt='enter' onClick={handleCommentSubmit}/>
      </div>
    </div>
  );
}
