import useMobileNavigate from "hooks/useMobileNavigate";
import styled from "styled-components";

interface EditPostBtnProps {
  id: number;
}

export default function EditPostBtn({ id }: EditPostBtnProps) {
  const mobileNavigate = useMobileNavigate();

  const handleEditButtonClick = () => {
    if (window.AndroidBridge && window.AndroidBridge.navigateTo) {
      window.AndroidBridge.navigateTo("write", `/write?id=${id}`);
    } else {
      mobileNavigate(`/write?id=${id}`);
    }
  };

  return <EditBtn onClick={handleEditButtonClick}>수정하기</EditBtn>;
}

// Styled Component
const EditBtn = styled.span`
  width: 84px;
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
