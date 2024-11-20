import styled from "styled-components";
import DeleteTitle from "mobile/containers/delete/Title";
import SubTitle from "mobile/components/delete/SubTitle";
import Detail from "mobile/containers/delete/Detail";
import DeleteButton from "mobile/components/delete/DeleteButton";

export default function MobileDeletePage() {
  return (
    <MobileLoginPageWrapper>
      <DeleteTitle />
      <SubTitle />
      <Detail />
      <DeleteButton />
    </MobileLoginPageWrapper>
  );
}

const MobileLoginPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;
