import { useState } from 'react';

interface UserPasswordInputProps {
  onInputChange: (userId: string) => void;
}

export default function UserIdInput ({ onInputChange }: UserPasswordInputProps) {
  const [userPassword, setUserPassword] = useState('');

  const handleInputChange = (text: string) => {
    setUserPassword(text);
    onInputChange(text);
  }

  return (
    <input
      type="password"
      placeholder="비밀번호"
      id="userPassword"
      value={userPassword}
      onChange={(e) => handleInputChange(e.target.value)}
      className="userPassword-input"
    />
  )

}