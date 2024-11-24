import styled from "styled-components";
import sortDropIcon from "resources/assets/mypage/sort-drop.svg";

interface SortDropdownProps {
  selectedSort: string;
  options: string[];
  onSortChange: (value: string) => void;
}

export default function SortDropdown({
  selectedSort,
  options,
  onSortChange,
}: SortDropdownProps) {
  return (
    <SortDropdownWrapper>
      <span className="sortby">Sort by</span>
      <span className="dropdown">
        <span>{selectedSort}</span>
        <div className="dropdown-menu">
          {options.map((option) => (
            <button key={option} onClick={() => onSortChange(option)}>
              {option}
            </button>
          ))}
        </div>
      </span>
      <img src={sortDropIcon} alt="Sort Dropdown Icon" />
    </SortDropdownWrapper>
  );
}

const SortDropdownWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  .sortby {
    color: rgba(150, 150, 150, 1);
    margin-right: 8px;
  }

  .dropdown {
    display: inline-block;
    position: relative;

    &:hover .dropdown-menu {
      display: flex;
    }

    .dropdown-menu {
      display: none;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      background: rgba(255, 255, 255, 0.5);
      z-index: 10;
      border-radius: 8px;
      overflow: hidden;

      button {
        background: transparent;
        border: none;
        padding: 8px 12px;
        font-size: 16px;
        color: #0e4d9d;
        text-align: left;
        cursor: pointer;

        &:hover {
          background: rgba(122, 167, 229, 0.1);
        }
      }
    }
  }

  img {
    margin-left: 8px;
    width: 16px;
    height: 16px;
  }
`;
