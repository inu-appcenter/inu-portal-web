import styled from "styled-components";
import BackButton from "../../components/mypage/BackButton"
import Title from "../../components/mypage/Title";

interface CommentTitleProps {
    title:string;
}

export default function CommontTitle({title}:CommentTitleProps) {
    return (
        <CommentTitleWrapper>
            <BackButton/>
            <Title title={title}/>
        </CommentTitleWrapper>
    )
}

const CommentTitleWrapper = styled.div`
    display: flex;
    border-bottom: 1px solid #D9D9D9;
    padding:15px;
    gap:8px;
`