import "./Header.css"
import { useNavigate } from "react-router-dom";
function Header() {
    const navigate = useNavigate();

    const clicked = () => {
        console.log("Button clicked");
        navigate("/login");
    };
    return (
        <header className="header-header">
            <a onClick={clicked}>로그인</a>
            <button>English</button>
        </header>
    )
}

export default Header