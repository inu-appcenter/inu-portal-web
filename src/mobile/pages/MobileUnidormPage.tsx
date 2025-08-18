import React from "react";
import styled from "styled-components";

const Iframe = styled.iframe`
  width: 100%;
  height: 80vh;
  border: none;
`;

const MobileUnidormPage: React.FC = () => {
  return <Iframe src="https://unidorm.inuappcenter.kr" title="unidorm" />;
};

export default MobileUnidormPage;
