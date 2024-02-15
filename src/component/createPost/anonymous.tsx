import React, { useState } from 'react';

interface AnonymousProps {
  onToggleAnonymous: (anonymous: boolean) => void;
}

const Anonymous: React.FC<AnonymousProps> = ({ onToggleAnonymous }) => {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const handleToggle = () => {
    setIsAnonymous(!isAnonymous);
    onToggleAnonymous(!isAnonymous);
  };

  return (
    <div>
      <label>
        <input type="checkbox" checked={isAnonymous} onChange={handleToggle} />
        익명
      </label>
    </div>
  );
};

export default Anonymous;
