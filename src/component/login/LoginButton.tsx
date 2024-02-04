interface LoginButtonProps {
  onButtonClick: () => void;
}

export default function LoginButton ({ onButtonClick }: LoginButtonProps) {
  return (
    <button onClick={onButtonClick}>로그인</button>
  )
}