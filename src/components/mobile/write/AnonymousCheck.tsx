import styled from "styled-components";
import checkedCheckbox from "@/resources/assets/posts/checked-checkbox.svg";
import uncheckedCheckbox from "@/resources/assets/posts/unchecked-checkbox.svg";

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
  height: 24px;
  gap: 6px;
  cursor: pointer;
`;

const CheckboxImg = styled.img`
  width: 20px;
  height: 20px;
`;

const CheckboxText = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #333d4b);
`;
