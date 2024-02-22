import { useEffect, useState } from "react";
import getUser from "../../utils/getUser";
import { useSelector } from "react-redux";
import MyInfoDetail from "./logininfodetail";

export default function LoginInfo () {
    const token = useSelector((state: any) => state.user.token);
    const [currnetnickname, setCurrentNickname] = useState("");
    useEffect(() => {
        handleUserInfo();
    }, []);
  
    const handleUserInfo = async () => {
        try {
            const response = await getUser(token);
            console.log(response);
            setCurrentNickname(response);
            console.log("닉네임이름",currnetnickname);
        } catch (error) {
            console.error("회원을 가져오지 못했습니다.", error);
        }
    };

    return (
        <MyInfoDetail nickname={currnetnickname} />
    )
}