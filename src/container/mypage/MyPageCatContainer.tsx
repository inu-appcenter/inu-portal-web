
import styled from 'styled-components';
import MyPageCategories from '../../component/mypage/common/MyPageCategories';

interface TipsCatContainerProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function MypageCatContainer( { selectedCategory, setSelectedCategory }: TipsCatContainerProps) {
  return (
    <MyPageContainerWrappper>
      <MyPageCategories selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
    </MyPageContainerWrappper>
  );
}

const MyPageContainerWrappper = styled.div`
  display: flex;
  flex-direction: row;
  margin: 30px 0 0 0;
`
