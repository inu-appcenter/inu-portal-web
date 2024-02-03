interface FindPasswordButtonProps {
  onButtonClick: () => void;
}

export default function FindPasswordButton ({ onButtonClick }: FindPasswordButtonProps) {
  return (
    <button onClick={onButtonClick}>비밀번호 찾기</button>
  )
}