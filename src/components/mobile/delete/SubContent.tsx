import styled from "styled-components";
import { deleteInfo } from "@/resources/strings/delete";

export default function SubContent() {
  return (
    <SubContentWrapper>
      {deleteInfo.map((content, index) => (
        <div key={index}>
          <h1>{content.title}</h1>
        </div>
      ))}
    </SubContentWrapper>
  );
}

const SubContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 35px;
  gap: 16px;
  box-sizing: border-box;
  div {
    width: 100%;
    background-color: #f3f7fe;
    border-radius: 10px;
    padding: 10px 5px;
    text-align: left;
    padding: 10px;
    h1 {
      font-size: 13px;
      font-weight: 700;
    }

    h3 {
      font-size: 9px;
      font-weight: 500;
    }
  }
`;
