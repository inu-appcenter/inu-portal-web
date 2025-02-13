import useMobileNavigate from "hooks/useMobileNavigate";
import styled from "styled-components";
import { Post } from "types/posts";
import { Notice } from "types/notices";
import heart from "resources/assets/posts/posts-heart.svg";
import { CouncilNotice } from "types/councilNotices";

interface TipsCardContainerProps {
  post?: Post;
  notice?: Notice;
  councilNotice?: CouncilNotice;
  viewMode: "grid" | "list";
  docType: string;
  isEditing?: boolean;
}

export default function ({
  post,
  notice,
  councilNotice,
  viewMode,
  docType,
  isEditing,
}: TipsCardContainerProps) {
  const mobileNavigate = useMobileNavigate();

  const handleDocumentClick = () => {
    if (isEditing) return;
    if (docType === "NOTICE") {
      notice && window.open("https://" + notice.url, "_blank");
    } else if (docType === "COUNCILNOTICE") {
      councilNotice &&
        mobileNavigate(`/councilnoticedetail?id=${councilNotice.id}`);
    } else {
      post && mobileNavigate(`/postdetail?id=${post.id}`);
    }
  };

  return (
    <>
      {viewMode == "grid" ? (
        <>
          {post && (
            <TipsCardGridWrapper onClick={handleDocumentClick}>
              <GridTopWrapper>
                <GridTopTopWrapper>
                  <Category>{post.category}</Category>
                  <Date>{post.createDate}</Date>
                </GridTopTopWrapper>
                <Content>{post.content}</Content>
              </GridTopWrapper>
              <GridLine />
              <GridBottomWrapper>
                <Title>{post.title}</Title>
                <LikeCommentWriterWrapper>
                  <span className="like-comment">
                    <img src={heart} alt="" />
                    <span>{post.like}</span>
                    <span></span>
                    <span>댓글</span>
                    <span>{post.replyCount}</span>
                  </span>
                  <span className="writer">{post.writer}</span>
                </LikeCommentWriterWrapper>
              </GridBottomWrapper>
            </TipsCardGridWrapper>
          )}
          {notice && (
            <TipsCardGridWrapper onClick={handleDocumentClick}>
              <GridTopWrapper>
                <GridTopTopWrapper>
                  <Category>{notice.category}</Category>
                  <Date>{notice.createDate}</Date>
                </GridTopTopWrapper>
                <Content></Content>
              </GridTopWrapper>
              <GridLine />
              <GridBottomWrapper>
                <Title>{notice.title}</Title>
                <LikeCommentWriterWrapper>
                  <span className="writer">{notice.writer}</span>
                </LikeCommentWriterWrapper>
              </GridBottomWrapper>
            </TipsCardGridWrapper>
          )}
          {councilNotice && (
            <TipsCardGridWrapper onClick={handleDocumentClick}>
              <GridTopWrapper>
                <GridTopTopWrapper>
                  <Category>{"총학생회"}</Category>
                  <Date>{councilNotice.createDate}</Date>
                </GridTopTopWrapper>
                <Content>{councilNotice.content}</Content>
              </GridTopWrapper>
              <GridLine />
              <GridBottomWrapper>
                <Title>{councilNotice.title}</Title>
                <LikeCommentWriterWrapper>
                  <span className="like-comment">
                    <span>조회수</span>
                    <span>{councilNotice.view}</span>
                  </span>
                </LikeCommentWriterWrapper>
              </GridBottomWrapper>
            </TipsCardGridWrapper>
          )}
        </>
      ) : (
        <>
          {post && (
            <TipsCardListWrapper onClick={handleDocumentClick}>
              <ListLeftWrapper>
                <Category>{post.category}</Category>
                <Date>{post.createDate}</Date>
              </ListLeftWrapper>
              <ListLine />
              <ListRightWrapper>
                <Title>{post.title}</Title>
                <Content>{post.content}</Content>
                <LikeCommentWriterWrapper>
                  <span className="like-comment">
                    <img src={heart} alt="" />
                    <span>{post.like}</span>
                    <span></span>
                    <span>댓글</span>
                    <span>{post.replyCount}</span>
                  </span>
                  <span className="writer">{post.writer}</span>
                </LikeCommentWriterWrapper>
              </ListRightWrapper>
            </TipsCardListWrapper>
          )}
          {notice && (
            <TipsCardListWrapper onClick={handleDocumentClick}>
              <ListLeftWrapper>
                <Category>{notice.category}</Category>
                <Date>{notice.createDate}</Date>
              </ListLeftWrapper>
              <ListLine />
              <ListRightWrapper>
                <Title>{notice.title}</Title>
                <Content></Content>
                <LikeCommentWriterWrapper>
                  <span className="writer">{notice.writer}</span>
                </LikeCommentWriterWrapper>
              </ListRightWrapper>
            </TipsCardListWrapper>
          )}
          {councilNotice && (
            <TipsCardListWrapper onClick={handleDocumentClick}>
              <ListLeftWrapper>
                <Category>{"총학생회"}</Category>
                <Date>{councilNotice.createDate}</Date>
              </ListLeftWrapper>
              <ListLine />
              <ListRightWrapper>
                <Title>{councilNotice.title}</Title>
                <Content>{councilNotice.content}</Content>
                <LikeCommentWriterWrapper>
                  <span className="like-comment">
                    <span>조회수</span>
                    <span>{councilNotice.view}</span>
                  </span>
                </LikeCommentWriterWrapper>
              </ListRightWrapper>
            </TipsCardListWrapper>
          )}
        </>
      )}
    </>
  );
}

const Category = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #0e4d9d;
  width: fit-content;

  border-bottom: 2px solid #7aa7e5;
  padding-bottom: 2px;
`;

const Date = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #7aa7e5;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #221112;
`;

const Content = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: #888888;
`;

const LikeCommentWriterWrapper = styled.div`
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  .like-comment {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 500;
    img {
      height: 10px;
    }
  }
  .writer {
    font-size: 10px;
    font-weight: 500;
    color: #303030;
    padding: 2px 8px;
    background-color: #ecf4ff;
    border-radius: 8px;
  }
`;

const TipsCardGridWrapper = styled.div`
  height: 196px;
  width: 95%;
  border: 2px solid #7aa7e5;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
`;

const GridTopWrapper = styled.div`
  padding: 12px 8px 0 8px;
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GridTopTopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const GridLine = styled.div`
  width: 100%;
  border: 1px solid #7aa7e5;
`;

const GridBottomWrapper = styled.div`
  position: relative;
  padding: 8px 8px 0 12px;
  flex: 2;
  display: flex;
  flex-direction: row;
`;

const TipsCardListWrapper = styled.div`
  height: 96px;
  width: 95%;
  border: 2px solid #7aa7e5;
  border-radius: 10px;
  display: flex;
`;

const ListLeftWrapper = styled.div`
  padding-left: 12px;
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const ListLine = styled.div`
  height: 100%;
  border: 1px solid #7aa7e5;
`;

const ListRightWrapper = styled.div`
  position: relative;
  padding: 8px 8px 0 12px;
  flex: 7;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
