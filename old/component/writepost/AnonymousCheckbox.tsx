import checkedCheckbox from "../../resource/assets/checked-checkbox.svg";
import uncheckedCheckbox from "../../resource/assets/unchecked-checkbox.svg";
import styled from "styled-components";

interface AnonymousCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function AnonymousCheckbox({
  checked,
  onChange,
}: AnonymousCheckboxProps) {
  const handleCheckboxClick = () => {
    onChange(!checked);
  };

  return (
    <CheckboxContainer
      onClick={handleCheckboxClick}
      role="checkbox"
      aria-checked={checked}
    >
      <CheckboxImage
        src={checked ? checkedCheckbox : uncheckedCheckbox}
        alt={checked ? "Checked" : "Unchecked"}
      />
      <CheckboxText>익명</CheckboxText>
    </CheckboxContainer>
  );
}

// Styled Components
const CheckboxContainer = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: right;
  height: 22px;
  margin: 0 15px 0 15px;
  margin-left: auto;
  gap: 5px;
  cursor: pointer;
`;

const CheckboxImage = styled.img`
  width: 22px;
  height: 22px;
`;

const CheckboxText = styled.span`
  font-size: 15px;
  font-weight: 400;
  text-align: center;
  color: #9fa3a6;
`;
