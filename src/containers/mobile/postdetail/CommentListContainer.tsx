import styled from "styled-components";
import { Reply } from "@/types/posts";
import { useNavigate } from "react-router-dom";
import ReplyLikeButton from "@/components/desktop/posts/ReplyLikeButton";
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { ROUTES } from "@/constants/routes";
import { deleteReply } from "@/apis/replies";
import useUserStore from "@/stores/useUserStore";
import { MoreVertical } from "lucide-react";
import { formatTimeAgo } from "@/utils/date";

interface CommentListProps {
  postId?: number;
  like?: number;
  isLiked?: boolean;
  scrap?: number;
  isScraped?: boolean;
  title?: string;
  bestReply?: Reply;
  replies: Reply[];
  setReplyToReply: (reply: Reply | null) => void;
  setReplyToEdit: (reply: Reply | null) => void;
  setReplyContent: (content: string) => void;
  onCommentUpdate: () => void;
  onWriterClick: (id: number) => void;
}

export default function CommentListMobile({
  postId,
  like,
  isLiked,
  scrap,
  isScraped,
  title,
  bestReply,
  replies,
  setReplyToReply,
  setReplyToEdit,
  setReplyContent,
  onCommentUpdate,
  onWriterClick,
}: CommentListProps) {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const allComments = bestReply
    ? [bestReply, ...replies.filter((reply) => reply.id !== bestReply.id)]
    : replies;

  const handleDeleteReply = async (replyId: number) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteReply(replyId);
        alert("댓글이 삭제되었습니다.");
        setActiveMenuId(null);
        onCommentUpdate();
      } catch (error) {
        console.error("댓글 삭제 실패", error);
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
          error.response
        ) {
          switch (error.response.status) {
            case 403:
              alert("이 댓글의 수정/삭제에 대한 권한이 없습니다.");
              break;
            case 404:
              alert("존재하지 않는 회원 또는 댓글입니다.");
              break;
            default:
              alert("댓글 삭제 실패");
              break;
          }
        }
      }
    }
  };

  const handleReplyTo = (reply: Reply) => {
    if (!isLoggedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }
    setReplyToReply(reply);
    setReplyToEdit(null);
    setReplyContent("");
  };

  const handleEditReply = (reply: Reply) => {
    setReplyToReply(null);
    setReplyToEdit(reply);
    setReplyContent(reply.content);
    setActiveMenuId(null);
  };

  return (
    <CommentSectionWrapper>
      {allComments.length > 0 ? (
        allComments.map((reply) => (
          <React.Fragment key={reply.id}>
            <CommentItemRow>
              <Avatar
                src={`https://portal.inuappcenter.kr/images/profile/${reply.isAnonymous ? 1 : (reply.fireId || 1)}`}
                alt={reply.writer || "프로필"}
                onClick={() => {
                  if (!reply.isAnonymous && reply.memberId) {
                    onWriterClick(reply.memberId);
                  }
                }}
                $isClickable={!reply.isAnonymous && Boolean(reply.memberId)}
              />
              <CommentContentBody>
                <CommentHeaderRow>
                  <UserIdGroup>
                    <WriterName
                      onClick={() => {
                        if (!reply.isAnonymous && reply.memberId) {
                          onWriterClick(reply.memberId);
                        }
                      }}
                      $isClickable={!reply.isAnonymous && Boolean(reply.memberId)}
                    >
                      {reply.writer}
                    </WriterName>
                    <TimeText>{formatTimeAgo(reply.createDate)}</TimeText>
                  </UserIdGroup>

                  {reply.hasAuthority && (
                    <MenuWrapper>
                      <MenuIconBtn onClick={() => setActiveMenuId(activeMenuId === reply.id ? null : reply.id)}>
                        <MoreVertical size={20} color="#8B95A1" />
                      </MenuIconBtn>
                      {activeMenuId === reply.id && (
                        <DropdownMenu>
                          <DropdownItem onClick={() => handleEditReply(reply)}>수정</DropdownItem>
                          <DropdownItem onClick={() => handleDeleteReply(reply.id)}>삭제</DropdownItem>
                        </DropdownMenu>
                      )}
                    </MenuWrapper>
                  )}
                </CommentHeaderRow>

                <CommentText>{reply.content}</CommentText>

                <CommentFooterRow>
                  <ReplyActionBtn onClick={() => handleReplyTo(reply)}>답글 달기</ReplyActionBtn>
                  <HeartGroup>
                    <ReplyLikeButton id={reply.id} like={reply.like} isLiked={reply.isLiked} />
                  </HeartGroup>
                </CommentFooterRow>
              </CommentContentBody>
            </CommentItemRow>

            {reply.reReplies?.map((reReply) => (
              <ReCommentItemRow key={reReply.id}>
                <SubAvatar
                  src={`https://portal.inuappcenter.kr/images/profile/${reReply.isAnonymous ? 1 : (reReply.fireId || 1)}`}
                  alt={reReply.writer || "프로필"}
                  onClick={() => {
                    if (!reReply.isAnonymous && reReply.memberId) {
                      onWriterClick(reReply.memberId);
                    }
                  }}
                  $isClickable={!reReply.isAnonymous && Boolean(reReply.memberId)}
                />
                <CommentContentBody>
                  <CommentHeaderRow>
                    <UserIdGroup>
                      <WriterName
                        onClick={() => {
                          if (!reReply.isAnonymous && reReply.memberId) {
                            onWriterClick(reReply.memberId);
                          }
                        }}
                        $isClickable={!reReply.isAnonymous && Boolean(reReply.memberId)}
                      >
                        {reReply.writer}
                      </WriterName>
                      <TimeText>{formatTimeAgo(reReply.createDate)}</TimeText>
                    </UserIdGroup>

                    {reReply.hasAuthority && (
                      <MenuWrapper>
                        <MenuIconBtn onClick={() => setActiveMenuId(activeMenuId === reReply.id ? null : reReply.id)}>
                          <MoreVertical size={20} color="#8B95A1" />
                        </MenuIconBtn>
                        {activeMenuId === reReply.id && (
                          <DropdownMenu>
                            <DropdownItem onClick={() => handleEditReply(reReply)}>수정</DropdownItem>
                            <DropdownItem onClick={() => handleDeleteReply(reReply.id)}>삭제</DropdownItem>
                          </DropdownMenu>
                        )}
                      </MenuWrapper>
                    )}
                  </CommentHeaderRow>

                  <CommentText>{reReply.content}</CommentText>

                  <CommentFooterRow>
                    <div />
                    <HeartGroup>
                      <ReplyLikeButton id={reReply.id} like={reReply.like} isLiked={reReply.isLiked} />
                    </HeartGroup>
                  </CommentFooterRow>
                </CommentContentBody>
              </ReCommentItemRow>
            ))}
          </React.Fragment>
        ))
      ) : (
        <EmptyCommentMsg>아직 댓글이 없어요 🤫</EmptyCommentMsg>
      )}
    </CommentSectionWrapper>
  );
}

const CommentSectionWrapper = styled.div`
  background: var(--bg-base, #ffffff);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.04);
  padding: 12px 0 80px;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
`;

const CommentItemRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 16px;
  width: 100%;
  box-sizing: border-box;
`;

const ReCommentItemRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 16px 12px 52px;
  width: 100%;
  box-sizing: border-box;
`;

const Avatar = styled.img<{ $isClickable: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
`;

const SubAvatar = styled.img<{ $isClickable: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
`;

const CommentContentBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const CommentHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const UserIdGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WriterName = styled.span<{ $isClickable: boolean }>`
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
`;

const TimeText = styled.span`
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-tertiary, #8b95a1);
`;

const CommentText = styled.div`
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary, #333d4b);
  word-break: break-word;
  white-space: pre-wrap;
`;

const CommentFooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ReplyActionBtn = styled.button`
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-tertiary, #8b95a1);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: var(--text-secondary, #333d4b);
  }
`;

const HeartGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MenuWrapper = styled.div`
  position: relative;
`;

const MenuIconBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 24px;
  right: 0;
  background: white;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  z-index: 10;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 8px 16px;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  color: var(--text-secondary, #333d4b);
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: #f8f9fb;
  }
`;

const EmptyCommentMsg = styled.div`
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  color: var(--text-tertiary, #8b95a1);
  text-align: center;
  padding: 20px 16px;
`;
