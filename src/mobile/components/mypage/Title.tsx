import styled from "styled-components";

interface titleProps {
    title: string;
}

export default function Title({title}: titleProps) {
    return <TitleName>{title}</TitleName>;
}

const TitleName = styled.div`
    font-size: 18px;
    font-weight: 600;
`;
