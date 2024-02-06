import TipsDocuments from '../../component/Tips/TipsDocuments';
import TipsTitle from '../../component/Tips/TipsTitle';

export default function TipsDocContainer() {
  return (
    <>
      <TipsTitle selectedCategory={''} onCategoryClick={function (): void {}} />
      <TipsDocuments selectedCategory={''} />
    </>
  );
}
