import React, { useState } from 'react';
import Tips_Categories from './TipsCategories';
import Tips_Documents from './TipsDocuments';

const MainWindow: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div>
      {!selectedCategory ? (
        <Tips_Categories setSelectCategory={(category: string) => setSelectedCategory(category)} />
      ) : (
        <Tips_Documents selectedCategory={selectedCategory} />
      )}
    </div>
  )
};

export default MainWindow;
