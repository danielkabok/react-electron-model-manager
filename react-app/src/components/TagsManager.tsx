import { useState } from 'react';
import { customAlphabet } from 'nanoid';

import { TagModel } from '../models/tagModel';

import '../App.scss'


function TagsManager(props: { tags: TagModel[], onAddTag: (id: number, name: string) => void, onChangeTag: (tag: TagModel) => void, onDeleteTag: (id: number) => void }) {

    const [tagId, setTagId] = useState<number>(0);
    const [tagName, setTagName] = useState('');
    const [editingTagId, setEditingTagId] = useState<number | null>(null);
    const [editingTagName, setEditingTagName] = useState('');

    const nanoid = customAlphabet('1234567890', 5);

    return (
        <>
            <div className='form-content'>

                <div className='content-block'>
                    <span>New tag</span>
                    <br />

                    <div className='inputWithButton'>
                        <input
                            placeholder="Name"
                            value={tagName}
                            onChange={e => setTagName(e.target.value)}
                        />

                        <button className='textButton' onClick={() => {
                            const newTagId = Number(nanoid());
                            props.onAddTag(newTagId, tagName);
                            setTagId(newTagId);
                            setTagName('');
                        }}>Add</button>
                    </div>
                    <br />

                    <span>Existing tags:</span>
                    <ul>
                        {props.tags.map(tag => (
                            <li key={tag.id}>
                                {tag.id === editingTagId ? (
                                    <>
                                        <input
                                            value={editingTagName}
                                            onChange={e => setEditingTagName(e.target.value)}
                                        />
                                        <button className='textButton' onClick={() => {
                                            props.onChangeTag({ id: editingTagId, name: editingTagName })
                                            setEditingTagId(null);
                                            setEditingTagName('');
                                        }}>Update</button>
                                        <button className='cancelBtn textButton' onClick={() => setEditingTagId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <span className='tagNameInList'>{tag.name}</span>
                                        <button className='textButton' onClick={() => setEditingTagId(tag.id)}>Edit</button>
                                        <button className='deleteBtn textButton' onClick={() => props.onDeleteTag(tag.id)}>Delete</button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default TagsManager;