import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./MainTips.css";
import Vector1 from './Vector1.svg';
import Vector2 from './Vector2.svg';

interface Article {
  id: number;
  title: string;
  date: string;
}

const MainTips: React.FC = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('제목+내용');
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);

  const handleSearchTypeClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleOptionClick = (type: string) => {
    setSearchType(type);
    setShowDropdown(false);
  };

  const handleSearch = () => {
    // TODO: 검색 구현하기
    alert(`검색: ${searchInput} (검색 타입: ${searchType})`);
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleArticleClick = (id: number) => {
    // TODO: tip 본문 이동 구현
    alert(`article.id: ${id}`);
  };

  const goToAllTips = () => {
    navigate('/Tips'); // '/Tips' 경로로 이동
  };

  useEffect(() => {
    // TODO: 팁 7개 가져오기
    const dummyArticles = [
      {id: 12, title: '1/2/3/4 학년 별로 들어놓으면 좋은 교과목', date: '2024-01-01' },
      {id: 34, title: '도서관 예약방법', date: '2024-01-02' },
      {id: 56, title: 'wifi 연결방법', date: '2024-01-03' },
      {id: 78, title: '인천대 기숙사 후기', date: '2024-01-04' },
      {id: 90, title: '학과별 졸업조건 및 자격증 TIP', date: '2024-01-05' },
      {id: 123, title: '단기어학연수 및 교환학생', date: '2024-01-06' },
      {id: 456, title: '학업우수장학금', date: '2024-01-07' }
    ];
    setArticles(dummyArticles);
  }, []);

  return (
    <div className='tips'>
      <div className="tips-header">
        <div className="tips-title">⭐️ TIPS</div>
        <div className="tips-search">
          <div className="tips-searchType" onClick={handleSearchTypeClick}>
            <div className="text-wrapper">{searchType}</div>
            <img className="Vector1" src={Vector1} alt="Vector1.svg"></img>
            {showDropdown && (
              <div className="dropdown-menu">
                <div onClick={() => handleOptionClick('제목+내용')}>제목+내용</div>
                <div onClick={() => handleOptionClick('제목')}>제목</div>
                <div onClick={() => handleOptionClick('내용')}>내용</div> 
                <div onClick={() => handleOptionClick('글쓴이')}>글쓴이</div>
              </div>
            )}
          </div>
          <div className="tips-searchInput-container">
            <input className="tips-searchInput" type="text" id="searchInput" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleKeyPress} />
            <img className="Vector2" src={Vector2} alt="Vector2.svg" onClick={handleSearch}></img>
          </div>
        </div>
      </div>
      <div className="tips-contents">
        {articles.map((article) => (
          <div className="article" key={article.id} onClick={() => handleArticleClick(article.id)}>
            <h3>{article.title}</h3>
            <p>{article.date}</p>
          </div>
        ))}
      </div>
      <button onClick={goToAllTips}>(임시)Tip 전체</button>
    </div>
  )
};

export default MainTips;
