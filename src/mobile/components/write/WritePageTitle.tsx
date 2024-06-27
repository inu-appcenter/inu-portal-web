import styled from 'styled-components';

interface WritePageTitleProps {
  idProps?: string;
  value: string;
}

export default function WritePageTitle({ idProps, value }: WritePageTitleProps) {
  const id = idProps;
  return (
    <WritePageTitleWrapper>
      {value === 'create' ? 'TIP 글쓰기' : `TIP 수정하기 (${id})`}
    </WritePageTitleWrapper>
  );
}

const WritePageTitleWrapper = styled.div`
  font-size: 14px;
  font-weight: 600;
`