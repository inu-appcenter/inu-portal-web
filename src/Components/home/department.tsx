
import CategoryDepartment from "../../Page/Category/CategoryDepartment";
import { departmentType } from "../../Resource/Data/aboutDepartment";
import { useState } from "react";

export default function Department() {
    
    const [isDepartmentOpen, setIsDepartmentOpen] = useState<boolean>(false);

    const onDepartmentToggle = () => {
        setIsDepartmentOpen(!isDepartmentOpen);
      };
    return (
        <li>
              <div onClick={onDepartmentToggle}>
                <p className={`banner-department${isDepartmentOpen ? ' open' : ''}`}>학과 홈페이지</p>
              </div>
              {isDepartmentOpen && <CategoryDepartment department={departmentType} />}
        </li>
    )
}