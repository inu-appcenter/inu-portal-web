import React from 'react'

interface TitleEditorProps{
    value: string,
    onChange: (newTitle:string) => void;
}

const TitleEditor: React.FC<TitleEditorProps> =({value, onChange}) =>{
    return(
        <div>
            <input id="title" value={value} onChange={(e) => onChange(e.target.value)}>
            </input>
        </div>
    );

};

export default TitleEditor;