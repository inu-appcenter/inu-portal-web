import styled from "styled-components";
import { typography } from "@/styles/typography";

// 온보딩 퍼널(Figma 08)의 제목·설명 블록. 포털 계정 등록 시트처럼 같은 말투의 화면에서도 쓴다.

export const TitleBlock = styled.div<{ $center?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  text-align: ${({ $center }) => ($center ? "center" : "left")};
`;

export const Title = styled.h1`
  margin: 0;
  ${typography.title1}
  color: var(--text-primary);
  white-space: pre-line;
  word-break: keep-all;
`;

export const Subtitle = styled.p`
  margin: 0;
  ${typography.body2}
  color: var(--text-tertiary);
  white-space: pre-line;
  word-break: keep-all;
`;
