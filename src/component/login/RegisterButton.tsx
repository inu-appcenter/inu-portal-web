interface RegisterButtonProps {
  onButtonClick: () => void;
}

export default function RegisterButton ({ onButtonClick }: RegisterButtonProps) {
  return (
    <button onClick={onButtonClick}>회원가입</button>
  )
}