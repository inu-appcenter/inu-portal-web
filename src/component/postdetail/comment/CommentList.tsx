import { useState } from "react";
import { useSelector } from "react-redux";
import CommentLike from "./CommentLike";
import EditCommentButton from "./EditCommentButton";
import DeleteCommentButton from "./DeleteCommentButton";
import ReCommentInput from "./ReCommentInput";
import ReCommentList from "./ReCommentList";
import CommentsImg from "../../../resource/assets/comments-img.svg";
import styled from "styled-components";

interface Replies {
  id: number;
  writer: string;
  fireId: number;
  content: string;
  like: number;
  isLiked: boolean;
  isAnonymous: boolean;
  hasAuthority: boolean;
  createDate: string;
  modifiedDate: string;
  reReplies: Replies[];
}

interface CommentListProps {
  bestComment: Replies;
  comments: Replies[];
  onCommentUpdate: () => void;
}

interface loginInfo {
  user: {
    token: string;
  };
}

export default function CommentList({
  bestComment,
  comments,
  onCommentUpdate,
}: CommentListProps) {
  const token = useSelector((state: loginInfo) => state.user?.token);
  const [showReCommentInputId, setShowReCommentInputId] = useState<
    number | null
  >(null);

  const allComments = bestComment
    ? [
        bestComment,
        ...comments.filter((comment) => comment.id !== bestComment.id),
      ]
    : comments;

  return (
    <div style={{ marginLeft: 20 }}>
      <img src={CommentsImg} alt="Comments" />
      <CommentListContainer>
        {allComments.map((comment, index) => (
          <CommentContainer key={comment.id}>
            <CommentMainContainer>
              <ProfileImageBackground>
                <img
                  src={`https://portal.inuappcenter.kr/api/images/${comment.fireId}`}
                  alt="프로필"
                />
              </ProfileImageBackground>
              <CommentContainerMid>
                <div>
                  <WriterText>{comment.writer}</WriterText>
                  {index === 0 && bestComment && <BestText>Best</BestText>}
                </div>
                <ContentText>{comment.content}</ContentText>
                <CommentUtilityContainer>
                  <CommentUtility
                    onClick={() => setShowReCommentInputId(comment.id)}
                  >
                    답장
                  </CommentUtility>
                  {comment.hasAuthority && (
                    <>
                      <EditCommentButton
                        token={token}
                        id={comment.id}
                        currentContent={comment.content}
                        isAnonymous={comment.isAnonymous}
                        onCommentUpdate={onCommentUpdate}
                      />
                      <DeleteCommentButton
                        token={token}
                        id={comment.id}
                        onCommentUpdate={onCommentUpdate}
                      />
                    </>
                  )}
                </CommentUtilityContainer>
              </CommentContainerMid>
              <CommentContainerRight>
                <CommentUtility>{comment.createDate}</CommentUtility>
                <CommentLike
                  id={comment.id}
                  like={comment.like}
                  isLikedProp={comment.isLiked}
                />
              </CommentContainerRight>
            </CommentMainContainer>
            {showReCommentInputId === comment.id && (
              <ReCommentInput
                parentId={comment.id}
                onCommentUpdate={onCommentUpdate}
              />
            )}
            {comment.reReplies && (
              <ReCommentList
                token={token}
                reReplies={comment.reReplies}
                onCommentUpdate={onCommentUpdate}
              />
            )}
          </CommentContainer>
        ))}
      </CommentListContainer>
    </div>
  );
}

// Styled Components
const CommentListContainer = styled.div`
  width: 100%;
  border-radius: 20px;
  background-color: #eff2f9;
  gap: 5px;
`;

const CommentContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 2px solid #dedede;

  @media (max-width: 768px) {
    margin: 0 10px;
  }
`;

const CommentMainContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px;
  gap: 10px;
`;

const ProfileImageBackground = styled.div`
  border-radius: 50%;
  min-width: 53px;
  height: 53px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`;

const CommentContainerMid = styled.div`
  flex-grow: 1;
`;

const CommentContainerRight = styled.div`
  min-width: 70px;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const WriterText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #4071b9;
`;

const BestText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #fcaf15;
`;

const ContentText = styled.span`
  font-size: 15px;
  font-weight: 400;
`;

const CommentUtilityContainer = styled.div`
  display: flex;
  align-items: center;
`;

const CommentUtility = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: #888888;
  padding-right: 5px;
  cursor: pointer;
`;
