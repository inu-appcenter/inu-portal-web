import { useState } from 'react';

interface UserIdInputProps {
  onInputChange: (userId: string) => void;
}

export default function UserIdInput ({ onInputChange }: UserIdInputProps) {
  const [userId, setUserId] = useState('');

  const handleInputChange = (text: string) => {
    setUserId(text);
    onInputChange(text);
  }

  return (
    <input
      type="text"
      placeholder="아이디"
      id="userId"
      value={userId}
      onChange={(e) => handleInputChange(e.target.value)}
      className="userId-input"
    />
  )

}