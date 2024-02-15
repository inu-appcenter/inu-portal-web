import NewPost from '../../component/createpost/newpost';
import Launch from '../../component/createpost/postlaunch';
import SelectCat from '../../component/createpost/selectcat';
import Anonymous from '../../component/createpost/anonymous';

export default function PostForm() {
  return (
    <>
      <NewPost />

      <SelectCat
        onSelect={function (selectedCategory: string): void {
          throw new Error('Function not implemented.');
        }}
      />
      <Anonymous onToggleAnonymous={function (anonymous: boolean): void {
        throw new Error('Function not implemented.');
      } }/>
      <Launch title={''} content={''} category={''} />
    </>
  );
}
