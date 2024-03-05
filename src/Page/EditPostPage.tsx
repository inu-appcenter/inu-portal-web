import { useSelector } from 'react-redux';
import EditPostFormContainer from '../container/editpost/EditPostFormContainer';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

export default function EditPost() {
  const token = useSelector((state: any) => state.user.token);
  const { id } = useParams<{ id: string }>(); 
 

  return (
    <>
      <EditPostWrapper>
        <EditPostFormContainer onPostUpdate={() => console.log('Post submitted!')} id={Number(id)} />
      </EditPostWrapper>
    </>
  );
}

const EditPostWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
