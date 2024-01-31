import "styled-components"; 

import CategoryDepartment from "../../Page/Category/CategoryDepartment";
import { departmentType } from "../../Resource/Data/aboutDepartment";
import { useState } from "react";
import { BannerDepartment } from "../../Styles/department";

export default function Department() {
    
    const [isDepartmentOpen, setIsDepartmentOpen] = useState<boolean>(false);

    const onDepartmentToggle = () => {
        setIsDepartmentOpen(!isDepartmentOpen);
    };
    
    return (
        <li>
            <div onClick={onDepartmentToggle}>
            <BannerDepartment className={`banner-department${isDepartmentOpen ? ' open' : ''}`}>학과 홈페이지</BannerDepartment>
            </div>
            {isDepartmentOpen && <CategoryDepartment department={departmentType} />}
        </li>
        );
    
    
}

