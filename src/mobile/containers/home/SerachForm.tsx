import styled from 'styled-components';
import searchImg from "../../../resource/assets/mobile/home/input.png";

export default function SerachForm() {

  return (
    <SearchFormWrapper>
      <div>
        <input type="text" placeholder='검색어를 입력하세요.'/>
        <img src={searchImg} alt="검색 이미지" />
      </div>
    </SearchFormWrapper>
  );
}

const SearchFormWrapper = styled.div`
  div {
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow: 0px 2px 8px 0px #0000001A;
    width: 100%;
    background-color: white;
    display: flex;
    justify-content: space-between;
    padding:8px 17px;
    input {
      border: none;
      font-size: 14px;
      color:#888888;
      font-weight: 500;
      flex-grow: 1;
    }
  }
`;

