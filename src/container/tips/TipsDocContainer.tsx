import TipsDocuments from '../../component/tips/TipsDocuments';
import TipsTitle from '../../component/tips/TipsTitle';

export default function TipsDocContainer() {
  return (
    <>
      <TipsTitle selectedCategory={''} onCategoryClick={function (): void {}} />
      <TipsDocuments selectedCategory={''} />
    </>
  );
}
 