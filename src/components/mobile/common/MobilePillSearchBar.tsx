import styled from "styled-components";

import searchImg from "@/resources/assets/mobile-home/category-form/input.svg";

interface MobilePillSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  submitAriaLabel?: string;
  className?: string;
}

export default function MobilePillSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "검색어를 입력해주세요",
  submitAriaLabel = "검색하기",
  className,
}: MobilePillSearchBarProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <SearchFormWrapper className={className} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="submit" aria-label={submitAriaLabel}>
        <img src={searchImg} alt="" />
      </button>
    </SearchFormWrapper>
  );
}

const SearchFormWrapper = styled.form`
  box-sizing: border-box;
  border-radius: 999px;
  box-shadow: 0 2px 8px 0 #0000001a;
  width: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  gap: 10px;
  height: 60px;

  input {
    border: none;
    background: transparent;
    font-size: 16px;
    color: #666;
    font-weight: 500;
    flex-grow: 1;
    outline: none;
  }

  input::placeholder {
    color: #9aa3af;
  }

  button {
    border: none;
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    flex-shrink: 0;
    border-radius: 999px;
    overflow: hidden;
    height: 100%;
    aspect-ratio: 1 / 1;
  }

  img {
    height: 100%;
    display: block;
  }
`;
