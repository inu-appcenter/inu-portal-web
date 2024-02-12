import NewPost from '../../component/createpost/newpost';
import Launch from '../../component/createpost/postlaunch';
import SelectCat from '../../component/createpost/selectcat';

export default function PostForm() {
  return (
    <>
      <NewPost />

      <SelectCat
        onSelect={function (selectedCategory: string): void {
          throw new Error('Function not implemented.');
        }}
      />
      <Launch title={''} content={''} category={''} />
    </>
  );
}
