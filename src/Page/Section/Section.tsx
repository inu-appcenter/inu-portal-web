import img from "../../assets/Images/image 7.png"
import DashBoard from "./Calendar/Calendar"
import "./Section.css"

function Section() {
return (
    <>
    <img className="homepage-img" src={img} alt="" />
    <DashBoard/>
    </>
)
}

export default Section