import styled from 'styled-components';
import { notices } from '../../resource/string/notice';
import logoImg from "../../resource/assets/logo.png"

  
export default function NoticeItems() {

    return (
        <Items>
            <NoticeLink >
                <NoticeLinkInu>인천대</NoticeLinkInu>
                <NoticeLinkImg src={logoImg} alt="inu logo" /><br/>
                <NoticeLinkInu className='noticeSpan'>공지사항 &gt; </NoticeLinkInu>
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
    background-color:#0E4D9D;
    padding:25px;
    width: 215px;
    height: 173px;
`

const NoticeLinkInu = styled.span`
    font-family: Inter;
    font-size: 30px;
    font-weight: 500;
    color:white;
    margin-bottom:10px;
    &.noticeSpan {
        font-weight: 800;
        margin-top: 20px;
    }

`
const NoticeLinkImg = styled.img`
    width: 34px;
    height: 36px;
    margin-left:7px;
`
const Notice = styled.div`
     background-color:#0E4D9D;
    padding:25px;
    width: 215px;
    font-size: 30px;
    font-weight: 500;
    height: 173px;
    color:white;
    .notice {
        display: flex;
        flex:0 0 auto;
        box-sizing: border-box;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
        border:3px solid black;
        width: 215px;
    }
    
    .visible {
        opacity: 1;
    }
  
`
const NoticeContainer = styled.div`
`

const NoticeTitle = styled.span`
    
`