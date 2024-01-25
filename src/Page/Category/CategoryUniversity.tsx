import React, { useState } from "react";
import "./CategoryUniversity.css";

interface University {
  university: string[];
  universitylink: string[];
}

interface CategoryUniversityProps {
  university: University;
}

const CategoryUniversity: React.FC<CategoryUniversityProps> = ({ university }) => {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>("");
  const onUniversityClicked = (category: string, link: string) => () => {
    setSelectedUniversity((prevUniversity) => (prevUniversity === category ? null : category));
    const targetUrl = link
    window.open(targetUrl);
  };


  return (
    <div className="category-university-container">
      <ul className="category-university-list">
        {university.university.map((category, index) => (
          <React.Fragment key={index}>
            <li className="category-university-item"  onClick={onUniversityClicked(category, university.universitylink[index])}>
              {category}
            </li>
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default CategoryUniversity;
