import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Post } from "types/posts";
import { Notice } from "types/notices";
import useAppStateStore from "stores/useAppStateStore";

interface TipsCardContainerProps {
  post?: Post;
  notice?: Notice;
  viewMode: "grid" | "list";
  docType: string;
  isEditing?: boolean;
}

export default function ({
  post,
  notice,
  viewMode,
  docType,
  isEditing,
}: TipsCardContainerProps) {
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();

  const handleDocumentClick = () => {
    if (isEditing) return;
    if (docType === "NOTICE") {
      notice && window.open("https://" + notice.url, "_blank");
    } else {
      post && navigate(`${isAppUrl}/postdetail?id=${post.id}`);
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
                <Writer>{post.writer}</Writer>
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
                <Writer>{notice.writer}</Writer>
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
                <Writer>{post.writer}</Writer>
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
                <Writer>{notice.writer}</Writer>
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
  font-weight: 600;
  color: #221112;
`;

const Content = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: #888888;
`;

const Writer = styled.div`
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 8px;
  font-weight: 500;
  color: #303030;
  padding: 0 8px 0 8px;
  height: 16px;
  background-color: #ecf4ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
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
