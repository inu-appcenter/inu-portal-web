import styled from 'styled-components';
import DeleteTitle from '../containers/delete/Title';
import SubTitle from '../components/delete/SubTitle';
import Detail from '../containers/delete/Detail';
import DeleteButton from '../components/delete/DeleteButton';

export default function MobileDeletePage() {
  return (
    <MobileLoginPageWrapper>
        <DeleteTitle/>
        <SubTitle/>
        <Detail/>
        <DeleteButton/>
    </MobileLoginPageWrapper>
  );
}

const MobileLoginPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;