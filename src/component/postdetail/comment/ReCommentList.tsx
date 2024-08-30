import CommentLike from "./CommentLike";
import EditCommentButton from "./EditCommentButton";
import DeleteCommentButton from "./DeleteCommentButton";
import recommenticon from "../../../resource/assets/recommenticon.svg";
import styled from "styled-components";

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
            <CommentLike
              id={reply.id}
              like={reply.like}
              isLikedProp={reply.isLiked}
            />
          </ReCommentContainer2>
          {reply.hasAuthority && (
            <ReCommentUtility>
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
            </ReCommentUtility>
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
  padding-right: 40px;
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
  padding-left: 30px;
`;
