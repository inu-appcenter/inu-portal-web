import './loginimg.css';
import LoginPageImg from '../../resource/assets/login-page-img.png';

export default function LoginImage() {
    return (
        <>
          <div className='login-page-intip-text'>INTIP</div>
          <img className='login-page-img' src={LoginPageImg}/>
        </>
    )
}
