import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ModelModel } from '../models/modelModel';
import { TagModel } from '../models/tagModel';

import { categoryTypes } from '../utils/constants';

import '../App.scss';


function ModelCard(props: { dirId: number, model: ModelModel, tags: TagModel[], userPath: string, onChange: (model: ModelModel) => void, onDelete: (modelId: number) => void }) {

	const [modelName, setModelName] = useState(props.model.name);
	const [modelCategoryId, setModelCategoryId] = useState<number>(props.model.categoryId);
	const [modelTagIds, setModelTagIds] = useState<number[]>(props.model.tagIds);
	const [tagInput, setTagInput] = useState(0);
	const imagePath = props.userPath.replaceAll("\\", "\\\\") + "\\\\" + props.dirId + "\\\\" + modelName + ".png";
	const [backgroundImage, setBackgroundImage] = useState<string | null>(imagePath);

	const defaultImagePath = "default-thumbnail.png";

	const navigate = useNavigate();

	useEffect(() => {
		const img = new Image();
		img.onload = () => {
			setBackgroundImage(imagePath);
		};
		img.onerror = () => {
			setBackgroundImage(defaultImagePath);
		};
		img.src = imagePath;
	}, [imagePath, defaultImagePath]);

	const addTag = () => {
		if (!modelTagIds.includes(tagInput)) {
			setModelTagIds([...modelTagIds, tagInput]);
			setTagInput(0);
		}
	};

	const removeTag = (tagIdToRemove: number) => {
		const updatedTags = modelTagIds.filter(tag => tag !== tagIdToRemove);
		setModelTagIds(updatedTags);
	};

	const handleCardClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (!(event.target as HTMLElement).closest('.editButton')) {
			navigate(`/viewer?d=${props.dirId}&m=${props.model.id}`);
		}
	}

	return (
		<div>
			<div className='modelCard' onClick={handleCardClick}>
				<div
					className='modelCardImage'
					style={{ backgroundImage: `url(${backgroundImage})` }}
				>
					<span>{props.model.id}</span>
					<span>{Object.entries(categoryTypes).find(([key, value]) => Number(key) === modelCategoryId)?.[1]}</span>
				</div>

				<h3>{props.model.name}</h3>
			</div>
			<div className='modelCardTags'>
				{modelTagIds.map(tagId => {
					const tag = props.tags.find(t => t.id === tagId);
					return (
						<span>
							{tag && tag.name}
						</span>
					);
				})}
			</div>
		</div>
	);
}

export default ModelCard;