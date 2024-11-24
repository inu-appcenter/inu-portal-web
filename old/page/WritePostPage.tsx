import styled from "styled-components";
import PostFormContainer from "../container/writepost/PostFormContainer";

export default function WritePost() {
  return (
    <WritePostWrapper>
      <PostFormContainer />
    </WritePostWrapper>
  );
}

const WritePostWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
