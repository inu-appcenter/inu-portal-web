import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Icon from "@/components/common/Icon";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <>
      <Img
        name="chevron-left"
        size={18}
        label="뒤로가기"
        onClick={() => navigate(-1)}
      />
    </>
  );
}

const Img = styled(Icon)`
  margin-top: 10px;
  margin-left: 35px;
`;
