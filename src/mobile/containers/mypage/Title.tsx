import styled from "styled-components";
import BackButton from "mobile/components/mypage/BackButton";
import Title from "mobile/components/mypage/Title";

interface CommentTitleProps {
    title: string;
    onback: () => void;
}

export default function CommentTitle({title, onback}: CommentTitleProps) {
    return (
        <CommentTitleWrapper>
            <BackButtonWrapper onClick={onback}>
                <BackButton/>
            </BackButtonWrapper>
            <Title title={title}/>
        </CommentTitleWrapper>
    );
}

const CommentTitleWrapper = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid #d9d9d9;
    padding: 15px 0;
    gap: 8px;
    width: 100%;
`;

const BackButtonWrapper = styled.span`
    display: flex;
    align-items: center;
`;
