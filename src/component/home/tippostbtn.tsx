import { useNavigate } from "react-router-dom";
import styled from "styled-components"


export default function TipPostBtn() {
    const navigate = useNavigate();
    const handleClickPost =()=> {
        navigate('/write');
      }

    return (
        <TipWriteBtnWrapper>
                    <TipWriteBtn onClick={handleClickPost}>글쓰기</TipWriteBtn>
        </TipWriteBtnWrapper>
    )
}

const TipWriteBtnWrapper = styled.div`
    display: flex;
    justify-content: flex-end;
`
const TipWriteBtn = styled.div`
  margin-top: 5px;
  height: 46px;
  background-color: #0E4D9D;
  padding:5px 20px;
  box-sizing: border-box;
  color: white;
  border: none;
  font-weight: 800;
  font-size:12px;
  line-height : 36px;
  border-radius: 10px;
`
