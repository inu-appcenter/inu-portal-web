import {useEffect, useState} from "react";
import {getMembersReplies} from "apis/members";
import {MembersReplies} from "types/members";
import CommontTitle from "mobile/containers/mypage/Title";
import styled from "styled-components";
import Empty from "mobile/components/mypage/Empty";
import CardComment from "mobile/containers/mypage/CardComment";
import useMobileNavigate from "../../hooks/useMobileNavigate.ts";

export default function MobileMyPageComment() {
    const [replyPost, setReplyPost] = useState<MembersReplies[]>([]);

    const mobileNavigate = useMobileNavigate();


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await getMembersReplies("date");
            setReplyPost(response.data);
        } catch (error) {
            console.error("회원이 작성한 모든 댓글 가져오기 실패", error);
        }
    };

    return (
        <MobileMyPageCommentWrapper>
            <CommontTitle title={"작성한 댓글"} onback={() => mobileNavigate('/mypage')}/>
            {replyPost.length === 0 ? (
                <Empty/>
            ) : (
                <CardComment posts={replyPost} onCommentsUpdate={fetchData}/>
            )}
        </MobileMyPageCommentWrapper>
    );
}

const MobileMyPageCommentWrapper = styled.div`
    width: 100%;
`;
