import { useState } from "react";
import searchImg from '../../resource/assets/search.svg';
import { useNavigate } from "react-router-dom";
import './SearchBar.css';

export default function SearchBar() {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch(searchInput);
    }
  };

  const onSearch = (query: string) => {
    if (query.length < 2) {
      alert('두 글자 이상 입력해주세요.');
      return;
    }
    navigate(`/tips/search?query=${query}`);
  };

  return (
    <div className='search-bar'>
      <input
        className= 'search-input'
        type='text'
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder='     Quick search ...' 
      />
      <img src={searchImg} alt='search image' onClick={() => onSearch(searchInput)} />
    </div>
  )
}