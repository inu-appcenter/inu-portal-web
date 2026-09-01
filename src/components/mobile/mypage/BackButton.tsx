import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <Img
      name="chevron-left"
      size={23}
      label="뒤로가기"
      onClick={() => navigate(`/mypage`)}
    />
  );
}

const Img = styled(Icon)``;
