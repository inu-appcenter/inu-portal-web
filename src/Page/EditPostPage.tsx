import EditPostFormContainer from '../container/editpost/EditPostFormContainer';
import styled from 'styled-components';
import getPost from '../utils/getPost';


export default function EditPost() {
    return (
      <EditPostWrapper>
        <EditPostFormContainer onPostSubmit={() => console.log('Post submitted!')} />
      </EditPostWrapper>
    );
  }
  
  const EditPostWrapper = styled.div`
    display: flex;
    justify-content: center;
  `;
  