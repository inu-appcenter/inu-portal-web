// EditPostPage.tsx
import { useSelector } from 'react-redux';
import EditPostFormContainer from '../container/editpost/EditPostFormContainer';
import styled from 'styled-components';


  export default function EditPost(){
    const token = useSelector((state: any) => state.user.token);
    
  const EditPostPage = () => {
    const handleEditSubmit = () => {
      // 게시물 편집 후 실행되어야 할 작업을 여기에 정의
      console.log('게시물이 성공적으로 편집되었습니다.');
      // 다른 작업들...
    };
  return (
  <>
    <EditPostWrapper>
      <EditPostFormContainer onPostUpdate={handleEditSubmit}/>
    </EditPostWrapper>
    </>
  );
}

  }

const EditPostWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
