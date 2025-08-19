import React from "react";
import styled from "styled-components";
import MobileHeader from "../containers/common/MobileHeader.tsx";

const MobileUnidormPage: React.FC = () => {
  return (
    <MobileUnidormPageWrapper>
      <MobileHeader title={"UNI Dorm"} />
      <Iframe src="https://unidorm.inuappcenter.kr" title="unidorm" />
    </MobileUnidormPageWrapper>
  );
};

const MobileUnidormPageWrapper = styled.div`
  flex: 1; // 핵심! 부모 flex 컨테이너에서 남은 공간 다 차지
  width: 100%;
  //padding: 16px;
  padding-top: 50px;
  box-sizing: border-box;
`;

const Iframe = styled.iframe`
  flex: 1;
  //height: 100%;
  width: 100%;
  border: none;
  height: calc(100vh - 56px);
`;

export default MobileUnidormPage;
