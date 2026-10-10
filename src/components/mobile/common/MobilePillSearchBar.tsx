import styled from "styled-components";
import { IoSearch } from "react-icons/io5";

interface MobilePillSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  submitAriaLabel?: string;
  className?: string;
  autoFocus?: boolean;
  variant?: "default" | "clean";
}

export default function MobilePillSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "검색어를 입력해주세요",
  submitAriaLabel = "검색하기",
  className,
  autoFocus,
  variant = "default",
}: MobilePillSearchBarProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <SearchFormWrapper
      className={className}
      onSubmit={handleSubmit}
      $variant={variant}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoFocus={autoFocus}
      />
      <button type="submit" aria-label={submitAriaLabel}>
        <IoSearch size={variant === "clean" ? 18 : 20} />
      </button>
    </SearchFormWrapper>
  );
}

const SearchFormWrapper = styled.form<{ $variant?: "default" | "clean" }>`
  box-sizing: border-box;
  border-radius: 999px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background-color 0.2s;

  ${({ $variant }) =>
    $variant === "clean"
      ? `
    height: 40px;
    background-color: var(--bg-base);
    border: 1px solid var(--border-default);
    padding: 2px 2px 2px 16px;
    gap: 8px;

    &:focus-within {
      background-color: var(--bg-base);
      border-color: var(--interactive-primary);
    }

    input {
      border: none;
      background: transparent;
      font-family: Pretendard;
      font-size: 14px;
      line-height: 1.6;
      font-weight: 400;
      color: var(--text-primary);
      flex-grow: 1;
      outline: none;
      min-width: 0;
      padding: 0;
      height: 100%;

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    button {
      border: none;
      background-color: transparent;
      color: var(--text-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      cursor: pointer;
      flex-shrink: 0;
      height: 36px;
      width: 36px;
      border-radius: 999px;
      overflow: hidden;
      transition:
        background-color 0.2s,
        color 0.2s,
        transform 0.1s;

      &:hover {
        background-color: var(--bg-subtle);
        color: var(--text-secondary);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  `
      : `
    height: 48px;
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: var(--elevation-1-shadow);
    padding: 4px 6px 4px 16px;
    gap: 8px;
    border: 1px solid var(--border-default);

    &:focus-within {
      background-color: rgba(255, 255, 255, 0.85);
      border-color: var(--interactive-focus);
      box-shadow: 0 4px 14px 0 rgba(156, 175, 226, 0.2);
    }

    input {
      border: none;
      background: transparent;
      font-size: 16px;
      color: var(--text-secondary);
      font-weight: 500;
      flex-grow: 1;
      outline: none;
      min-width: 0;
      padding: 0;
      height: 100%;

      &::placeholder {
        color: var(--text-disabled);
      }
    }

    button {
      border: none;
      background-color: var(--interactive-focus);
      color: var(--text-inverse);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      cursor: pointer;
      flex-shrink: 0;
      height: 38px;
      width: 38px;
      border-radius: 50%;
      overflow: hidden;
      transition:
        background-color 0.2s,
        transform 0.1s;

      &:hover {
        background-color: rgb(139, 177, 217);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  `}

  svg {
    display: block;
  }
`;
