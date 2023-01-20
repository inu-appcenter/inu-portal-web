import { useState } from "react";
import CategoryDropDown from "./Category";
import "./banner.css"

export interface Group {
    title: string;
    extendProps: {
      group: string[];
    };
    groupLink: {
        link:string[]
    }
  }
  
export const groups: Group[] = [
{
    title: "인문대학",
    extendProps: {
    group: ["국어국문학과", "영어영문학과", "독어독문학과", "불어불문학과", "일본지역문화학과", "중어중국학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG","https://inuchina.inu.ac.kr/inuchina/index.do?epTicket=LOG"]
    }
},
{
    title: '자연과학대학',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '글로벌정경대학',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '공과대학',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '정보기술대학',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '경영대학',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '예술체육대학',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '사범대학',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '도시과학대학',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '생명과학기술대학',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '동북아국제통상물류학부',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '법학부',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},
{
    title: '계약학과',
    extendProps: {
    group: ["수학과", "물리학과", "화확과", "패션산업학과", "해양학과"]
    },
    groupLink:{
        link:["https://korean.inu.ac.kr/korean/index.do?epTicket=LOG","https://www.inu.ac.kr/inu/755/subview.do","https://german.inu.ac.kr/german/index.do?epTicket=LOG","https://inufrance.inu.ac.kr/inufrance/index.do?epTicket=LOG","https://unjapan.inu.ac.kr/unjapan/index.do?epTicket=LOG"]
    }
},


];
function Banner(){
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const onToggle = () => {
        setIsOpen(!isOpen);
    }
    return (
        <div className="banner-container">
            <header className="banner-header">
                <a href="#" target="_blank">
                <img src="https://www.inu.ac.kr/sites/inu/images/common/logo-header.png" alt="인천대학교"/>
                </a>
            <ul className="banner-list">
                <li><a href="https://portal.inu.ac.kr:444/enview/" target="_blank"><p>포탈</p></a></li>
                <li><a href="https://cyber.inu.ac.kr/" target="_blank"><p>학습관리시스템</p></a></li>
                <li><a href="http://sugang.inu.ac.kr:8885/" target="_blank"><p>수강신청</p></a></li>
                <li><a href="https://job.inu.ac.kr/ckw/main/index.do" target="_blank"><p>취업경력개발원</p></a></li>
                <li><a href="https://global.inu.ac.kr/global/index.do?epTicket=LOG" target="_blank"><p>국제교류원</p></a></li>
                <li><div onClick={onToggle}><p>카테고리</p></div>{isOpen && <CategoryDropDown groups={groups} />}</li>
            </ul>
            </header>
        </div>

    )
}

export default Banner