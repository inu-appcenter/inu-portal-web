import "styled-components"; 

import { useState } from "react";

import CategoryUniversity from "../../page/Category/CategoryUniversity";
import { universityType } from "../../resource/Data/aboutUniveristy";
import { BannerDepartment } from "../../styles/department";
export default function University() {
    
    const [isUniversityOpen, setIsUniversityOpen] = useState<boolean>(false);
  
  
    const onUniversityToggle = () => {
      setIsUniversityOpen(!isUniversityOpen);
    };
    
    return (
        <li>
              <div onClick={onUniversityToggle}>
                <BannerDepartment className={`banner-university${isUniversityOpen ? ' open' : ''}`}>학교 홈페이지</BannerDepartment>
              </div>
              {isUniversityOpen && <CategoryUniversity university={universityType} />}
        </li>
        );
    
    
}

