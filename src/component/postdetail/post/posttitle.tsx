interface PostTitleProps {
    title: string; // title prop 추가
}

export default function PostTitle({ title }: PostTitleProps) {
    return <h1>{title}</h1>; // 제목 표시
}
