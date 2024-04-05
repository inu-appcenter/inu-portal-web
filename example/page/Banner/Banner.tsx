import Department from "../../components/home/department";
import University from "../../components/home/university";
import "./Banner.css"


function Nav() {

  
    return (
      <div className="banner-container">
        <nav className="banner-nav">
          <a href="#" target="_blank">
            <img src="https://www.inu.ac.kr/sites/inu/images/common/logo-header.png" alt="인천대학교" />
          </a>
          <ul className="banner-list">
            <li><div><p>메인 페이지</p></div></li>
            <Department/>
            <University/>
            <li><p>마이페이지</p></li>
          </ul>
        </nav>
      </div>
    );
  }
  
  export default Nav;