import styled from "styled-components";

interface WritePageTitleProps {
  idProps: number;
}

export default function WritePageTitle({ idProps }: WritePageTitleProps) {
  const id = idProps;
  return (
    <WritePageTitleWrapper>
      {id === 0 ? "TIP 글쓰기" : `TIP 수정하기 (${id})`}
    </WritePageTitleWrapper>
  );
}

const WritePageTitleWrapper = styled.div`
  font-size: 14px;
  font-weight: 600;
`;
