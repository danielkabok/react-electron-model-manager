import { useState } from 'react';
import { customAlphabet } from 'nanoid';

import { TagModel } from '../models/tagModel';

import { categoryTypes } from '../utils/constants';

import '../App.scss';


function AddModel(props: {
	handleAddModel: (
		id: number,
		name: string,
		dff: string,
		txd: string,
		ide: string,
		categoryId: number,
		tags: number[],
		drawDist: number,
		hasCollision: boolean,
		isBreakable: boolean,
		hasAnimation: boolean,
		timeOn?: number,
		timeOff?: number
	) => void,
	tags: TagModel[]
}) {

	const [modelName, setModelName] = useState('');
	const [modelDff, setModelDff] = useState('');
	const [modelTxd, setModelTxd] = useState('');
	const [modelIde, setModelIde] = useState('');
	const [modelCategoryId, setModelCategoryId] = useState<number>(0);
	const [modelTagIds, setModelTagIds] = useState<number[]>([]);
	const [modelDrawDist, setModelDrawDist] = useState<number>(0);
	const [modelHasCol, setModelHasCol] = useState<boolean>(false);
	const [modelIsBrk, setModelIsBrk] = useState<boolean>(false);
	const [modelHasAnim, setModelHasAnim] = useState<boolean>(false);
	const [modelTimeOn, setModelTimeOn] = useState<number | undefined>(undefined);
	const [modelTimeOff, setModelTimeOff] = useState<number | undefined>(undefined);
	const [tagInput, setTagInput] = useState(0);

	const nanoid = customAlphabet('1234567890', 5);

	const addTag = () => {
		if (!modelTagIds.includes(tagInput)) {
			setModelTagIds([...modelTagIds, tagInput]);
			setTagInput(0);
		}
	}

	const removeTag = (tagIdToRemove: number) => {
		const updatedTags = modelTagIds.filter(tag => tag !== tagIdToRemove);
		setModelTagIds(updatedTags);
	}

	const clickAdd = () => {
		const newModelId = Number(nanoid());
		props.handleAddModel(
			newModelId,
			modelName,
			modelDff,
			modelTxd,
			modelIde,
			modelCategoryId,
			modelTagIds,
			modelDrawDist,
			modelHasCol,
			modelIsBrk,
			modelHasAnim,
			modelTimeOn,
			modelTimeOff
		);

		setModelName('');
		setModelDff('');
		setModelTxd('');
		setModelIde('');
		setModelCategoryId(0);
		setModelTagIds([]);
		setModelDrawDist(0);
		setModelHasCol(false);
		setModelIsBrk(false);
		setModelHasAnim(false);
		setModelTimeOn(undefined);
		setModelTimeOff(undefined);
	}

	return (
		<div className='addModel'>
			<span>Name:</span>
			<br />
			<input
				placeholder='Name'
				value={modelName}
				onChange={(e) => setModelName(e.target.value)}
			/>
			<br />
			<span>DFF:</span>
			<br />
			<input
				placeholder='DFF'
				value={modelDff}
				onChange={(e) => setModelDff(e.target.value)}
			/>
			<br />
			<span>TXD:</span>
			<br />
			<input
				placeholder='TXD'
				value={modelTxd}
				onChange={(e) => setModelTxd(e.target.value)}
			/>
			<br />
			<span>IDE:</span>
			<br />
			<input
				placeholder='IDE'
				value={modelIde}
				onChange={(e) => setModelIde(e.target.value)}
			/>
			<br />
			<span>Category:</span>
			<br />
			<select
				value={modelCategoryId.toString()}
				onChange={(e) => setModelCategoryId(Number(e.target.value))}
			>
				<option value="" disabled>Select a type</option>
				{Object.entries(categoryTypes).map(([key, value]) => (
					<option key={key} value={key}>
						{value}
					</option>
				))}
			</select>
			<br />

			<span>Tags:</span>
			<br />
			<select
				value={tagInput}
				onChange={e => setTagInput(Number(e.target.value))}
			>
				<option value="">Select Tag</option>
				{props.tags.map(tag => (
					<option key={tag.id} value={tag.id}>
						{tag.name}
					</option>
				))}
			</select>
			<button className='textButton' onClick={addTag}>Add</button>
			<div>
				<ul>
					{modelTagIds.map(tagId => {
						const tag = props.tags.find(t => t.id === tagId);
						return (
							<li key={tagId}>
								{tag && tag.name}
								<button className='textButton' onClick={() => removeTag(tagId)}>X</button>
							</li>
						);
					})}
				</ul>
			</div>
			<br />

			<span>Draw Distance:</span>
			<br />
			<input
				placeholder='Draw Distance'
				value={modelDrawDist}
				onChange={(e) => setModelDrawDist(Number(e.target.value))}
				type='number'
			/>
			<br />

			<input
				type='checkbox'
				checked={modelHasCol}
				onChange={(e) => setModelHasCol(e.target.checked)}
			/>
			<span>Has Collision</span>
			<br />

			<input
				type='checkbox'
				checked={modelIsBrk}
				onChange={(e) => setModelIsBrk(e.target.checked)}
			/>
			<span>Is Breakable</span>
			<br />

			<input
				type='checkbox'
				checked={modelHasAnim}
				onChange={(e) => setModelHasAnim(e.target.checked)}
			/>
			<span>Has Animation</span>
			<br />

			<span>Time On:</span>
			<br />
			<input
				placeholder='Time On'
				value={modelTimeOn || ''}
				onChange={(e) => setModelTimeOn(Number(e.target.value) || undefined)}
				type='number'
			/>
			<br />

			<span>Time Off:</span>
			<br />
			<input
				placeholder='Time Off'
				value={modelTimeOff || ''}
				onChange={(e) => setModelTimeOff(Number(e.target.value) || undefined)}
				type='number'
			/>

			<button
				onClick={clickAdd}
			>
				Add
			</button>
		</div>
	);
}

export default AddModel;