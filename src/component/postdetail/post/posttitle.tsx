import './posttitle.css'
import pencilImg from '../../../resource/assets/date-pencil-img.png'
import eyeImg from '../../../resource/assets/eye-img.png';

interface PostTitleProps {
  title: string; // title prop 추가
  createDate: string;
  view: number;
  writer: string;
}

export default function PostTitle({ title, createDate, view, writer }: PostTitleProps) {
  return (
    <div className='PostTitle'>
      <span className='titleText'>{title}</span>
      <span className='titleInfo'>
        <img src={pencilImg} />
        <span className='infoText'>{createDate}</span>
        <img src={eyeImg} />
        <span className='infoText'>{view}</span>
        <span className='writerInfo'>{writer}</span>
      </span>
    </div>
  )
}
