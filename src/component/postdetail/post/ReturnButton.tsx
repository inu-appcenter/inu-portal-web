import { useNavigate } from "react-router-dom";
import styled from 'styled-components';

export default function ReturnButton () {
  const navigate = useNavigate();
  return (
    <span>
      <BackBtn onClick={() => navigate(-1)}>← 이전</BackBtn>
    </span>
  );
};

const BackBtn = styled.div`
color: #888888;
border-radius: 5px;
width: 50px;
font-size: 15px;
padding: 3px 6px;
margin-left: 15px;
justify-content:center;
display:flex;
border : 1px solid #888888;
cursor: url('/pointers/cursor-pointer.svg'), pointer;
`