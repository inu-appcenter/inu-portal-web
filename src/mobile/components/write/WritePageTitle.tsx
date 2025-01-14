import styled from "styled-components";

interface WritePageTitleProps {
  type: string;
  id: number;
  councilNoticeId: number;
}

export default function WritePageTitle({
  type,
  id,
  councilNoticeId,
}: WritePageTitleProps) {
  return (
    <WritePageTitleWrapper>
      {type === "" && (id === 0 ? "TIP 글쓰기" : `TIP 수정하기 (${id})`)}
      {type === "councilNotice" &&
        (councilNoticeId === 0
          ? "총학생회 공지사항 등록"
          : `총학생회 공지사항 수정 (${councilNoticeId})`)}
    </WritePageTitleWrapper>
  );
}

const WritePageTitleWrapper = styled.div`
  font-size: 14px;
  font-weight: 600;
`;
