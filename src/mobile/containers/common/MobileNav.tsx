import styled from "styled-components";

export default function MobileNav() {
  return (
    <MobileNavWrapper>
      <h1>MobileNav</h1>
    </MobileNavWrapper>
  );
}

const MobileNavWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 72px;
  border-radius: 20px 20px 0px 0px;
  box-shadow: 0px -3px 6px 0px #3030301A;
`;
