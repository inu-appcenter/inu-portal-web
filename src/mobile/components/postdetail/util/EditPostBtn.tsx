import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import useAppStateStore from "stores/useAppStateStore";

interface EditPostBtnProps {
  id: number;
}

export default function EditPostBtn({ id }: EditPostBtnProps) {
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();
  const handleEditButtonClick = () => {
    navigate(`${isAppUrl}/write?id=${id}`);
  };

  return <EditBtn onClick={handleEditButtonClick}>수정하기</EditBtn>;
}

// Styled Component
const EditBtn = styled.span`
  width: 76px;
  height: 30px;
  border-radius: 10px;
  background: #eff2f9;
  font-size: 15px;
  font-weight: 500;
  color: #757575;
  display: flex;
  justify-content: center; /* 수평 가운데 정렬 */
  align-items: center; /* 수직 가운데 정렬 */
`;
