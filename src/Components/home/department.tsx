import "styled-components"; 

import CategoryDepartment from "../../page/Category/CategoryDepartment";
import { departmentType } from "../../resource/Data/aboutDepartment";
import { useState } from "react";
import { BannerDepartment } from "../../styles/department";

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

