import recommenticon from "../../../../resource/assets/recommenticon.svg";
import styled from "styled-components";
import CommentLike from "../../../../component/postdetail/comment/CommentLike";
import EditCommentButton from "../../../../component/postdetail/comment/EditCommentButton";
import DeleteCommentButton from "../../../../component/postdetail/comment/DeleteCommentButton";

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

interface ReCommentListProps {
  token: string;
  reReplies: Replies[];
  onCommentUpdate: () => void;
}

export default function ReCommentList({
  reReplies,
  onCommentUpdate,
  token,
}: ReCommentListProps) {
  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split(".").map(Number);
    const commentDate = new Date(year, month - 1, day); // 시간은 기본적으로 00:00:00
    const now = new Date();
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return "잘못된 날짜";
    }

    // 현재 날짜와 댓글 날짜 비교
    const diffInDays = Math.floor(
      (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return "오늘";
    } else if (diffInDays < 30) {
      return `${diffInDays}일 전`;
    } else if (diffInDays < 365) {
      const diffInMonths = Math.floor(diffInDays / 30);
      return `${diffInMonths}개월 전`;
    } else {
      const diffInYears = Math.floor(diffInDays / 365);
      return `${diffInYears}년 전`;
    }
  };

  return (
    <div>
      {reReplies.map((reply) => (
        <ReCommentMainContainer key={reply.id}>
          <ReCommentContainer2>
            <ReCommentContainer3>
              <img src={recommenticon} alt="recomment icon" />
              <ReCommentWriterText>
                {reply.isAnonymous ? "횃불이" : reply.writer}
              </ReCommentWriterText>
              <ReCommentContentText>{reply.content}</ReCommentContentText>
            </ReCommentContainer3>
            <ReCommentUtility>
            <CommentLike
              id={reply.id}
              like={reply.like}
              isLikedProp={reply.isLiked}
            />
            <CommentDate>{formatDate(reply.createDate)}</CommentDate>
            </ReCommentUtility>
          </ReCommentContainer2>
          {reply.hasAuthority && (
            <MyReCommentUtility>
              <EditCommentButton
                token={token}
                id={reply.id}
                currentContent={reply.content}
                isAnonymous={reply.isAnonymous}
                onCommentUpdate={onCommentUpdate}
              />
              <DeleteCommentButton
                token={token}
                id={reply.id}
                onCommentUpdate={onCommentUpdate}
              />
            </MyReCommentUtility>
          )}
        </ReCommentMainContainer>
      ))}
    </div>
  );
}

// Styled Components
const ReCommentMainContainer = styled.div`
  padding-left: 50px;
  border-top: 2px solid #dedede;
  padding-top: 10px;
  padding-bottom: 10px;
`;

const ReCommentContainer2 = styled.div`
  gap: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 10px;
`;

const ReCommentContainer3 = styled.div`
  gap: 15px;
  display: flex;
  align-items: center;
`;

const ReCommentWriterText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #4071b9;
`;

const ReCommentContentText = styled.span`
  font-size: 15px;
  font-weight: 400;
  max-width: 50%;
  flex-grow: 1;
`;

const ReCommentUtility = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap:3px;
`;
const MyReCommentUtility = styled.div`

`
const CommentDate = styled.span`
  font-size: 10px;
  color: #888888;
`;
