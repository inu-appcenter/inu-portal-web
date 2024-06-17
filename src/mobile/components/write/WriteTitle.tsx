import styled from 'styled-components';

interface WriteTitleProps {
  idProps?: string;
  value: string;
}

export default function WriteTitle({ idProps, value }: WriteTitleProps) {
  const id = idProps;
  return(
    <WriteTitleWrapper>
      {value === 'create' ? 'TIP 글쓰기' : `TIP 수정하기 (${id})`}
    </WriteTitleWrapper>
  );
}

const WriteTitleWrapper = styled.div`
  font-size: 14px;
  font-weight: 600;
`