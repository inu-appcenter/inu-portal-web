import styled from "styled-components";
import checkedCheckbox from "../../../resource/assets/checked-checkbox.svg";
import uncheckedCheckbox from "../../../resource/assets/unchecked-checkbox.svg";

interface AnonymousCheckProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function AnonymousCheck({
  checked,
  onChange,
}: AnonymousCheckProps) {
  return (
    <AnonymousCheckWrapper
      onClick={() => {
        onChange(!checked);
      }}
    >
      <CheckboxImg
        className="checkbox"
        src={checked ? checkedCheckbox : uncheckedCheckbox}
        alt={checked ? "Checked" : "Unchecked"}
        role="checkbox"
        aria-checked={checked}
      />
      <CheckboxText>익명</CheckboxText>
    </AnonymousCheckWrapper>
  );
}

const AnonymousCheckWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 22px;
  gap: 8px;
`;

const CheckboxImg = styled.img`
  width: 22px;
  height: 22px;
`;

const CheckboxText = styled.div`
  font-size: 16px;
  font-weight: 400;
  text-align: center;
  color: #9fa3a6;
`;
