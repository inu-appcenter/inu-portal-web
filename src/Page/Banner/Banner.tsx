import { useState } from "react";
import CategoryUniversity from "../Category/CategoryUniversity";

import "./Banner.css"

import { universityType } from "../../Resource/Data/aboutUniveristy";
import Department from "../../Components/home/department";



function Nav() {
    const [isUniversityOpen, setIsUniversityOpen] = useState<boolean>(false);
  
  
    const onUniversityToggle = () => {
      setIsUniversityOpen(!isUniversityOpen);
    };
  
    return (
      <div className="banner-container">
        <nav className="banner-nav">
          <a href="#" target="_blank">
            <img src="https://www.inu.ac.kr/sites/inu/images/common/logo-header.png" alt="인천대학교" />
          </a>
          <ul className="banner-list">
            <li><div><p>메인 페이지</p></div></li>
            <li>
              <div onClick={onUniversityToggle}>
                <p className={`banner-university${isUniversityOpen ? ' open' : ''}`}>학교 홈페이지</p>
              </div>
              {isUniversityOpen && <CategoryUniversity university={universityType} />}
            </li>
            <Department/>
            <li><p>마이페이지</p></li>
          </ul>
        </nav>
      </div>
    );
  }
  
  export default Nav;