import styled from "styled-components";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "./responsive";
export const Section = styled.section`
  padding: 0 ${MOBILE_PAGE_GUTTER};
  box-sizing: border-box;
  width: 100%;

  @media ${DESKTOP_MEDIA} {
    padding: 0;
  }
`;

export const FeedLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px 0;
  width: 100%;
`;
