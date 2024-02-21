//PostFormContainer.tsx
import { useState } from 'react';
import Anonymous from '../../component/createPost/anonymous';
import NewPost from '../../component/createPost/newpost';
import PostLaunch from '../../component/createPost/postlaunch';
import SelectCat from '../../component/createPost/selectcat';
import launchPost from '../../utils/launchPost';


// import Anonymous from '../../component/createpost/anonymous';

export default function PostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] =useState(false);

  const handleTitleChange = (newTitle: string) =>{
    setTitle(newTitle);
  }

  const handleContentChange = (newContent: string) =>{
    setTitle(newContent);
  }

  const handleCategorySelect = (selectedCategory: string) =>{
    setCategory(selectedCategory);
  }

  const handleToggleAnonymous = (isAnonymous: boolean) =>{
    setAnonymous(isAnonymous);
  }
  return (
    <>
      <NewPost 
      onTitleChange ={handleTitleChange}/>
<SelectCat setSelectedCategory={function (category: string): void {
}}/>
      <Anonymous
        onToggleAnonymous={handleToggleAnonymous}
      />
      <LaunchPosts
        title={title}
        content={content}
        category={category}
        anonymous={false}
      />
    </>
  );
}
