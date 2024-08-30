import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function NoticeTitle() {
  const navigate = useNavigate();

  const handleNoticeClick = () => {
    navigate("/tips/notice");
  };

  return (
    <NoticeWrapper>
      <NoticeTitleText onClick={handleNoticeClick}>📌 NOTICE</NoticeTitleText>
    </NoticeWrapper>
  );
}

const NoticeWrapper = styled.div`
  font-size: 27px;
  font-weight: 700;
  line-height: 29px;
  letter-spacing: 0px;
  text-align: left;
  color: #0e4d9d;
  margin-bottom: 10px;
  padding: 5px;
`;
const NoticeTitleText = styled.span`
  cursor: url("/pointers/cursor-pointer.svg"), pointer;
`;
