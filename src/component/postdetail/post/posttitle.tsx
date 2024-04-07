import './posttitle.css'
import eyeImg from '../../../resource/assets/eye-img.svg';
import datePencilImg from '../../../resource/assets/date-pencil-img.svg';
import { useSelector } from 'react-redux';

import styled from 'styled-components';
import DeletePostBtn from './deletpostbtn';
import EditPostBtn from './editpostbtn';
interface PostTitleProps {
  title: string; // title prop 추가
  createDate: string;
  view: number;
  writer: string;
  id: string;
  hasAuthority: boolean;
}


export default function PostTitle({ title, createDate, view, writer,id, hasAuthority }: PostTitleProps) {
  const token = useSelector((state: any) => state.user.token);

  const handlePostUpdate = () => {
    //
};

  return (
    <div className='PostTitle'>
      <span className='titleText'>{title}</span>
      <PostInfo>
      <div key={id}>
                {hasAuthority &&(
                <EditPostWrapper>
                  <DeletePostBtn token={token} id={id} onPostUpdate={handlePostUpdate} /> 
                  <EditPostBtn id={id} />
                </EditPostWrapper>
                )}
            </div>
      <div className='titleInfo'>
        <img src={datePencilImg} />
        <span className='infoText'>{createDate}</span>
        <span className='infoText'>
        <img src={eyeImg} />
        {view}</span>
        <span className='writerInfo'>{writer}</span>
      </div>
      </PostInfo>
    </div>
  )
}

const EditPostWrapper = styled.div`
display: inline-flex;
margin: 0 10px;
flex-direction: row;
align-items: center;
justify-content: space-between;
gap: 10px;
`

const PostInfo = styled.div`
display: flex;`