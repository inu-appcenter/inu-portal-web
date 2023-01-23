import React, { useState } from "react";
import "./Category.css"
interface Group {
  title: string;
  extendProps: {
    group: string[];
  };
  groupLink: {
    link:string[]
}
}

interface CategoryDropDown {
  groups: Group[];
}

const CategoryDropDown: React.FC<CategoryDropDown> = ({ groups }) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  console.log(selectedGroup);


  const onGroupClicked = (group: string) => () => {

    setSelectedGroup((prevGroup) => (prevGroup === group ? null : group));
  };
  
  const onhandleClick = (index: number) => () => {
    if (selectedGroup) {
      const group = groups.find((group) => group.title === selectedGroup);
      if (group) {
        group.groupLink.link.forEach((link, subIndex) => {
          if (subIndex === index) {
            const targetUrl = link;
            window.location.href = targetUrl;
          }
        });
      }
    }
  };

  return (
      <div className="category-container">
        <ul className="category-list">
            {groups.map((group, index) => (
              <React.Fragment key={index}>
                  <li className="category-item" onClick={onGroupClicked(group.title)}>
                    {group.title}
                  </li>
                {selectedGroup === group.title &&
                  group.extendProps.group.map((title, subIndex) => (
                    <li className="category-items" key={subIndex} onClick={onhandleClick(subIndex)}>{title}</li>
                  ))}
              </React.Fragment>
            ))}
        </ul>
      </div>
  );
};

export default CategoryDropDown;