import React, { useState } from "react";
import "./CategoryDepartment.css"
interface Department {
  title: string;
  department: {
    department: string[];
  };
  departmentlink: {
    link:string[]
}
}

interface CategoryDepartmentProps {
  department: Department[];
}

const CategoryDepartment: React.FC<CategoryDepartmentProps> = ({ department }) => {
  const [selectedDepartment,setSelectedDepartment] = useState<string | null>(null);
  console.log(selectedDepartment);


  const onDepartmentClicked = (department: string) => () => {
    setSelectedDepartment((prevDepartment) => (prevDepartment === department ? null : department));
  };
  
  const onhandleClick = (index: number) => () => {
    if (selectedDepartment) {
      const foundDepartment = department.find((dep) => dep.title === selectedDepartment);
  
      if (foundDepartment) {
        foundDepartment.departmentlink.link.forEach((link, subIndex) => {
          if (subIndex === index) {
            const targetUrl = link;
            window.location.href = targetUrl;
          }
        });
      }
    }
  };
  

  return (
      <div className="category-department-container">
        <ul className="category-department-list">
            {department.map((department, index) => (
              <React.Fragment key={index}>
                  <li className="category-department-item" onClick={onDepartmentClicked(department.title)}>
                    {department.title}
                  </li>
                {selectedDepartment === department.title &&
                  department.department.department.map((title, subIndex) => (
                    <li className="category-department-items" key={subIndex} onClick={onhandleClick(subIndex)}>{title}</li>
                  ))}
              </React.Fragment>
            ))}
        </ul>
      </div>
  );
};

export default CategoryDepartment;