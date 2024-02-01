import styled from 'styled-components';
import { notices } from '../../resource/string/notice';
import logoImg from "../../resource/assets/logo.png"

  
export default function NoticeItems() {

    return (
        <Items>
            <NoticeLink >
                <NoticeLinkInu>인천대</NoticeLinkInu>
                <NoticeLinkImg src={logoImg} alt="inu logo" />
                <NoticeLinkInu>공지사항 &gt; </NoticeLinkInu>
            </NoticeLink>
            {notices.map((notice, index) => (
                <Notice key={index} className={`notice visible`}>
                    <NoticeContainer >
                        <NoticeTitle >{notice.title}</NoticeTitle>
                    </NoticeContainer>
                </Notice>
        ))}
        </Items>
    );
}

const Items = styled.div`
    display: flex;
    align-items: center;
    flex-grow: 1;
    gap: 20px;
`;

const NoticeLink = styled.div`
    
`

const NoticeLinkInu = styled.span`
    
`
const NoticeLinkImg = styled.img`
    
`
const Notice = styled.div`
    .notice {
        display: flex;
        flex:0 0 auto;
        box-sizing: border-box;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
        border:3px solid black;
        width: 200px;
    }
    
    .visible {
        opacity: 1;
    }
  
`
const NoticeContainer = styled.div`
`

const NoticeTitle = styled.span`
    
`