import styled from "styled-components";
import { deleteInfo } from "../../../resource/string/delete";


export default function SubContent() {
    return (
        <SubContentWrapper>
            {deleteInfo.map((content, index) => (
                <div key={index}>
                    <h1>{content.title}</h1>
                    <h3>{content.subtitle}</h3>
                </div>
            ))}
        </SubContentWrapper>
    );
} 

const SubContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin:30px 33px;
    gap:16px;
    div {
        background-color: #F3F7FE;
        border-radius: 10px;
        padding:10px 5px;
        h1 {
        font-family: Roboto;
        font-size: 13px;
        font-weight: 700;
            }

            h3 {
                font-family: Roboto;
        font-size: 9px;
        font-weight: 500;
            }
    }

`;