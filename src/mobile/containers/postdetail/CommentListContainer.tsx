import { useState } from "react";
import { useSelector } from "react-redux";
import CommentImg from "../../../resource/assets/comment-img2.svg";
import ReCommentInput from "../../../component/postdetail/comment/ReCommentInput";
import DeleteCommentButton from "../../../component/postdetail/comment/DeleteCommentButton";
import EditCommentButton from "../../../component/postdetail/comment/EditCommentButton";
import CommentLike from "../../../component/postdetail/comment/CommentLike";
import styled from "styled-components";
import ReCommentList from "../../components/postdetail/comment/m.recommentlist";

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

export default function CommentListMobile({
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

  const formatDate = (dateString: string): string => {
    // '2024.07.30' 형태를 Date 객체로 변환
    const [year, month, day] = dateString.split(".").map(Number);
    const commentDate = new Date(year, month - 1, day);
    const now = new Date();
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
      <CommentWrapper>
        <CommentHeader>
          <img src={CommentImg} alt="Comments" style={{ width: "14px" }} />
          <span className="comment">댓글</span>
        </CommentHeader>
        <CommentListWrapper>
          {allComments.map((comment, index) => (
            <CommentContainer key={comment.id}>
              <Comments>
                <ProfileWrapper>
                  <Profile
                    src={`https://portal.inuappcenter.kr/api/images/${comment.fireId}`}
                    alt="프로필"
                  />
                </ProfileWrapper>
                <CommentDetail>
                  <CommentDetailHeader>
                    <WriterText>{comment.writer}</WriterText>
                    {index === 0 && bestComment && <BestText>Best</BestText>}
                    <CommentUtil>
                      <CommentLike
                        id={comment.id}
                        like={comment.like}
                        isLikedProp={comment.isLiked}
                      />
                      <CommentDate>
                        {formatDate(comment.createDate)}
                      </CommentDate>
                    </CommentUtil>
                  </CommentDetailHeader>
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
                </CommentDetail>
              </Comments>
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
        </CommentListWrapper>
      </CommentWrapper>
    </div>
  );
}

// Styled Components
const CommentWrapper = styled.div``;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  font-size: 12px;
  background-color: #f6f9ff;
  padding-left: 30px;
`;

const CommentListWrapper = styled.div`
  width: 100%;
`;

const CommentContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 2px solid #dedede;
  padding: 5px 0;

  @media (max-width: 768px) {
    margin: 0 10px;
  }
`;

const Comments = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
`;

const ProfileWrapper = styled.div`
  border-radius: 50%;
  min-width: 53px;
  max-width: 60px;
  height: 53px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Profile = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  align-items: center;
`;

const CommentDetail = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-left: 15px;
`;

const CommentDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const WriterText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #4071b9;
  flex: 1;
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

const CommentUtil = styled.div`
  min-width: 70px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  top: 0;
  align-items: center;
  right: 0;
`;

const CommentDate = styled.span`
  font-size: 10px;
  color: #888888;
`;
