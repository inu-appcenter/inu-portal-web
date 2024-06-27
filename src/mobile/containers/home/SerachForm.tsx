import styled from 'styled-components';




export default function SerachForm() {


  return (
    <SearchFormWrapper>
     <input type="text" />
    </SearchFormWrapper>
  );
}

const SearchFormWrapper = styled.div`
  /* flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: absolute;
  top:34%;
  text-align: center;
  align-items: center;
  padding:30px; */
  input {
    position: absolute;
    top:34%;
    display: flex;
    align-items: center;
  }
`;

