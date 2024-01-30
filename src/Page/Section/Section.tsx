import img from "../../assets/Images/image 7.png"
import MainTips from "../MainTips/MainTips"

import DashBoard from "./Calendar/Calendar"
import "./Section.css"

function Section() {
return (
    <>
    <img className="homepage-img" src={img} alt="" />
    <MainTips/>
    <DashBoard/>
    </>
)
}

export default Section