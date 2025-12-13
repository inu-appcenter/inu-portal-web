import styled from "styled-components";
import { deleteMembers } from "@/apis/members";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Delete() {
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!isChecked) {
      alert("위 주의사항을 숙지하셨는지 체크해 주세요.");
      return;
    }

    const confirmDelete = window.confirm("정말로 탈퇴하시겠습니까?");
    if (!confirmDelete) {
      return;
    }

    try {
      await deleteMembers();
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/");
      return;
    } catch (error) {
      console.error("회원 탈퇴 실패");
    }
  };

  return (
    <DeleteWrapper>
      <h1>회원 탈퇴</h1>
      <Wrapper>
        <h2>📌 INTIP 회원탈퇴 시 유의사항</h2>
        <h3>작성한 게시물 및 댓글 등은 삭제되지 않아요 🙅🏻‍</h3>
        <h3>
          탈퇴 후 로그인을 원하시면 인천대학교 포탈 아이디와 비밀번호로 다시
          INTIP에 로그인 해주세요 🙅🏻‍
        </h3>
        <h3>
          INTIP을 탈퇴해도 인천대학교 포탈 아이디와 비밀번호는 삭제되지 않아요
          🙅🏻‍
        </h3>
        <div>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          ></input>
          <h4>위 주의사항을 숙지하였습니다.</h4>
        </div>
        <button onClick={handleDelete}>회원탈퇴</button>
      </Wrapper>
    </DeleteWrapper>
  );
}

const DeleteWrapper = styled.div`
  padding: 64px;
  background: linear-gradient(to bottom, #dbebff 70%, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 32px;
  h1 {
    color: #0e4d9d;
    font-size: 32px;
    font-weight: 600;
    margin: 0;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  h3 {
    width: 80%;
    padding: 16px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
  }
  div {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  button {
    background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
    border: none;
    color: white;
    width: 60%;
    padding: 16px;
    border-radius: 12px;
    font-size: 16px;
  }
`;
