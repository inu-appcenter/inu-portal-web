import styled from "styled-components";

interface PostCategoryProps {
  category: string;
}

export default function PostCategory({ category }: PostCategoryProps) {
  return (
    <PostCategoryWrapper>
      <Category>{category}</Category>
      <Line />
    </PostCategoryWrapper>
  );
}

const PostCategoryWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px;
  color: #888888;
`;

const Category = styled.div`
  margin-right: 10px;
`;

const Line = styled.div`
  flex-grow: 0.1;
  height: 1px;
  background-color: #888888;
`;
