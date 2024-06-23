import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface TipsCardContainerProps {
  post: Post;
  viewMode: 'grid' | 'list';
  docType: string;
}

export default function({ post, viewMode, docType }: TipsCardContainerProps) {
  const navigate = useNavigate();
  
  const handleDocumentClick = () => {
    if (docType === 'NOTICE') {
      window.open('https://' + post.url, '_blank');
    } else {
      navigate(`/tips/${post.id}`);
    }
  };

  return (
    <>
      {viewMode == "grid" ? (
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
      ) : (
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
    </>
  );
}

const Category = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #0E4D9D;
  width: fit-content;

  border-bottom: 2px solid #7AA7E5;
`;

const Date = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #7AA7E5;
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
  width: 64px;
  height: 16px;
  background-color: #ECF4FF;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TipsCardGridWrapper = styled.div`
  height: 196px;
  width: 95%;
  border: 2px solid #7AA7E5;
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
  border: 1px solid #7AA7E5;
`

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
  border: 2px solid #7AA7E5;
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
  border: 1px solid #7AA7E5;
`;

const ListRightWrapper = styled.div`
  position: relative;
  padding: 8px 8px 0 12px;
  flex: 7;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;