import EditPostFormContainer from '../container/editpost/EditPostFormContainer';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

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
