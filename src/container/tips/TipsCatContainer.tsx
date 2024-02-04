import TipsCategories from '../../component/Tips/TipsCategories';

export default function TipsCatContainer() {
  return (
    <>
      <TipsCategories setSelectCategory={function (category: string): void {
              //코드 수정 요망
          } } />
    </>
  );
}
