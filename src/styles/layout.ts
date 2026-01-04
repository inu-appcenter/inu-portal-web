import styled from "styled-components";

// 역할: 컨텐츠가 안전 영역(Safe Area) 내에 배치되도록 함
export const Section = styled.section`
  padding: 0 16px; // theme.padding.base 등으로 관리하면 더 좋음
  box-sizing: border-box;
  width: 100%;
`;

// 역할: 수직 리듬(Vertical Rhythm) 관리
export const FeedLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px 0;
  width: 100%;
`;
