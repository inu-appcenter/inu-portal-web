interface FindUserIdButtonProps {
  onButtonClick: () => void;
}

export default function FindUserIdButton ({ onButtonClick }: FindUserIdButtonProps) {
  return (
    <button onClick={onButtonClick}>아이디 찾기</button>
  )
}