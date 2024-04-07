import EditPostFormContainer from '../container/editpost/EditPostFormContainer';
import styled from 'styled-components';

export default function EditPost() {
 

  return (
    <>
      <EditPostWrapper>
        <EditPostFormContainer onPostUpdate={() => console.log('Post submitted!')} />
      </EditPostWrapper>
    </>
  );
}

const EditPostWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
