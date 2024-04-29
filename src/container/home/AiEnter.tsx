import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AIEnter() {
    const navigate = useNavigate()
    const handleAiBtnClick = () => { // 매개변수로 url을 추가하여 해당 URL을 사용할 수 있도록 함
        window.open(`/ai`);
      };
  return (

    <div onClick={handleAiBtnClick}>AIEnter</div>
  )
}
