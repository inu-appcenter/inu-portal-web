import styled from "styled-components";
import DeleteTitle from "@/containers/mobile/delete/Title";
import SubTitle from "@/components/mobile/delete/SubTitle";
import Detail from "@/containers/mobile/delete/Detail";
import DeleteButton from "@/components/mobile/delete/DeleteButton";

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
