import TipsDocuments from '../../component/Tips/TipsDocuments';
import TipsTitle from '../../component/Tips/TipsTitle';

export default function TipsDocContainer() {
  return (
    <>
      <TipsTitle />
      <TipsDocuments selectedCategory={''} />
    </>
  );
}
