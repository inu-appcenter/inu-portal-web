// import NewPost from '../../component/createpost/newpost';
// import LaunchPosts from '../../component/createpost/postlaunch';
// import SelectCat from '../../component/createpost/selectcat';

import NewPost from "../../component/createPost/newpost";
import LaunchPosts from "../../component/createPost/postlaunch";

// import Anonymous from '../../component/createpost/anonymous';

export default function PostForm() {
  return (
    <>
      <NewPost />

      {/* <SelectCat
        onSelect={function (selectedCategory: string): void {
          throw new Error('Function not implemented.');
        }}
      />
      <Anonymous onToggleAnonymous={function (anonymous: boolean): void {
        throw new Error('Function not implemented.');
      } }/> */}
      <LaunchPosts title={'하이'} content={'안뇽'} category={'수강신청'} anonymous={true}/>
    </>
  );
}
