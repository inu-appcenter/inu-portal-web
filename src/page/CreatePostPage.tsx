
import styled from 'styled-components';
import PostFormContainer from '../container/createpost/PostFormContainer';

export default function CreatePost() {
  return (
    <CreatePostWrapper>
      <PostFormContainer onPostSubmit={() => console.log('Post submitted!')} />
    </CreatePostWrapper>
  );
}

const CreatePostWrapper = styled.div`

  display: flex;
  justify-content: center;
`;