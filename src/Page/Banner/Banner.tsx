import { useState } from "react";
import CategoryUniversity from "../Category/CategoryUniversity";


import "./Banner.css"
import img from "../../assets/Vector.png"
import CategoryDepartment from "../Category/CategoryDepartment";


export interface University {
    university: string[],
    universitylink:string[]
}
export interface Department {
    title: string;
    department: {
      department: string[];
    };
    departmentlink: {
      link:string[]
  }
  }

export const university= {
    university:["포탈 바로가기","OCU 바로가기","수강신청","Star inu","국제 교류원"],
    universitylink:["https://portal.inu.ac.kr/","https://cyber.inu.ac.kr/","http://sugang.inu.ac.kr:8885/","https://job.inu.ac.kr/","https://global.inu.ac.kr/"]
}
export const departments: Department[] = [
{
    title: "인문대학",
    department: {
        department: ["국어국문학과", "영어영문학과", "독어독문학과", "불어불문학과", "일본지역문화학과", "중어중국학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG","https://inuchina.inu.ac.kr/inuchina/index.do?epTicket=LOG"]
    }
},
{
    title: '자연과학대학',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '글로벌정경대학',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '공과대학',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '정보기술대학',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '경영대학',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '예술체육대학',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '사범대학',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '도시과학대학',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '생명과학기술대학',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '동북아국제통상물류학부',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '법학부',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '계약학과',
    department: {
        department: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    departmentlink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},


];
function Nav(){
    const [isDepartmentOpen, setIsDepartmentOpen] = useState<boolean>(false);
    const [isUniversityOpen, setIsUniversityOpen] = useState<boolean>(false);
    const onDepartmentToggle = () => {
        setIsDepartmentOpen(!isDepartmentOpen);
    }
    const onUniversityToggle = () => {
        setIsUniversityOpen(!isUniversityOpen)
    }
    return (
        <div className="banner-container">
            <nav className="banner-nav">
                <a href="#" target="_blank">
                <img src="https://www.inu.ac.kr/sites/inu/images/common/logo-header.png" alt="인천대학교"/>
                </a>
            <div></div>
            <ul className="banner-list">
                <li><p>메인 페이지</p></li>
                <li><div onClick={onUniversityToggle}><p className={`banner-university${isUniversityOpen ? ' open' : ''}`}>학교 홈페이지</p></div>{isUniversityOpen && <CategoryUniversity university={university} />}</li>
                <li><div onClick={onDepartmentToggle}><p className={`banner-department${isDepartmentOpen ? ' open' : ''}`}>학과 홈페이지</p></div>{isDepartmentOpen && <CategoryDepartment department={departments} />}</li>
                <li><p>마이페이지</p></li>
                <li><img className="search-img" src={img} alt="" /></li>
            </ul>
            </nav>
        </div>

    )
}

export default Nav