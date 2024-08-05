import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Define a base interface for shared properties

interface Comment {
    id: string;
    title: string;
    category: string;
    writer: string;
    content: string;
    like: number;
    scrap: number;
    imageCount:number;
    createDate: string;
    modifiedDate: string;

}

// Define types for the props accepted by the Card component
interface TipsCardContainerProps {
  post: Comment[]; // Using BaseContent ensures 'id' is always present
}

export default function CardComment({ post }: TipsCardContainerProps) {
  const navigate = useNavigate();

  // Function to handle document click and navigate to the post detail page
  const handleDocumentClick = (id: string) => {
    navigate(`/m/home/tips/postdetail?id=${id}`);
  };

  useEffect(()=> {
    console.log("comment",post);
  },[])
  return (
    <CardWrapper>
      <p><span>All</span> {post.length}</p>
      {post.map((p) => (
        <TipsCardListWrapper key={p.id} onClick={() => handleDocumentClick(p.id)}>
            <Date>{p.createDate}</Date>
            <Content>{p.content}</Content>
            <Like>{p.like}</Like>
            <Category>{p.writer}</Category>
          {/* <ListLeftWrapper>
            <Date>{p.createDate}</Date>
            <Category>{p.content}</Category>
          </ListLeftWrapper>
          <ListRightWrapper>
            <Title>{p.title}</Title>
            <Content>{p.content}</Content>
            <Writer>{p.writer}</Writer>
          </ListRightWrapper> */}
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

const Like = styled.div`
    
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



const Content = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: #888888;
`;


const TipsCardListWrapper = styled.div`
  height: 96px;
  width: 95%;
  border: 2px solid #7aa7e5;
  border-radius: 10px;
  display: flex;
`;

