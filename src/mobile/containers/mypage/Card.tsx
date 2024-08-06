import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Define a base interface for shared properties
export interface BaseContent {
  id: string;
  title: string;
  category: string;
  writer: string;
  content: string;
  createDate: string;
  modifiedDate: string;
}

// Define types for the props accepted by the Card component
interface TipsCardContainerProps {
  post: BaseContent[]; // Using BaseContent ensures 'id' is always present
}

export default function Card({ post }: TipsCardContainerProps) {
  const navigate = useNavigate();

  // Function to handle document click and navigate to the post detail page
  const handleDocumentClick = (id: string) => {
    navigate(`/m/home/tips/postdetail?id=${id}`);
  };

  return (
    <CardWrapper>
      <p><span>All</span> {post.length}</p>
      {post.map((p) => (
        <TipsCardListWrapper key={p.id} onClick={() => handleDocumentClick(p.id)}>
          <ListLeftWrapper>
            <Category>{p.category}</Category>
            <Date>{p.createDate}</Date>
          </ListLeftWrapper>
          <ListLine />
          <ListRightWrapper>
            <Title>{p.title}</Title>
            <Content>{p.content}</Content>
            <Writer>{p.writer}</Writer>
          </ListRightWrapper>
        </TipsCardListWrapper>
      ))}
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  padding:0 8px 10px 28px;
    font-family: Inter;
font-size: 15px;
font-weight: 600;
color: #0E4D9D;
  span {
color: #969696;


  }
`
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
