import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameDirectoryModel } from '../models/gameDirectoryModel';
import { ModelModel } from '../models/modelModel';
import { TagModel } from '../models/tagModel';

import directoryService from '../services/directoryService';
import modelService from '../services/modelService';
import tagService from '../services/tagService';
import thumbnailService from '../services/thumbnailService';

import ModelViewport from '../components/ModelViewport';
import Notification from '../components/Notification';
import Header from '../components/Header';

import { categoryTypes } from '../utils/constants';

import '../App.scss'


function ViewerPage() {

	const [gameDir, setGameDir] = useState(new GameDirectoryModel(0, "", "", "", ""));
	const [model, setModel] = useState(new ModelModel(0, "", "", "", "", 0, [], 0));
	const [gameDirTags, setGameDirTags] = useState<TagModel[]>([]);
	const [modelName, setModelName] = useState("");
	const [modelDff, setModelDff] = useState("");
	const [modelTxd, setModelTxd] = useState("");
	const [modelIde, setModelIde] = useState("");
	const [modelCategoryId, setModelCategoryId] = useState<number>(0);
	const [modelTagIds, setModelTagIds] = useState<number[]>([]);
	const [modelDrawDist, setModelDrawDist] = useState<number>(0);
	const [modelHasCol, setModelHasCol] = useState<boolean>();
	const [modelIsBrk, setModelIsBrk] = useState<boolean>();
	const [modelHasAnim, setModelHasAnim] = useState<boolean>();
	const [modelTimeOn, setModelTimeOn] = useState<number | undefined>();
	const [modelTimeOff, setModelTimeOff] = useState<number | undefined>();
	const [tagInput, setTagInput] = useState(0);

	const [thumbnailNotificationTextTop, setThumbnailNotificationTextTop] = useState("Thumbnail generated!");
	const [thumbnailNotificationTextBottom, setThumbnailNotificationTextBottom] = useState("");

	const MemoizedModelViewport = React.memo(ModelViewport);

	const navigate = useNavigate();

	// Fetching data from URL

	const searchPrarams = new URLSearchParams(window.location.search);

	const [gameDirId, setId] = useState(Number(searchPrarams.get("d")) || 0);
	const [modelId, setModelId] = useState(Number(searchPrarams.get("m")) || 0);

	// Initializing the page data

	useEffect(() => {
		const fetchData = async () => {
			if (gameDirId == 0 || modelId == 0) {
				navigate('/404');
			} else {
				await Promise.all([fetchGameDirectory(), fetchTags(), fetchModel()]);
			}
		};

		window.scrollTo(0, 0);
		fetchData();
	}, []);

	// TODO: Investigate if useCallback is needed
	const fetchGameDirectory = useCallback(async (): Promise<void> => {
		const gameDirectory = await directoryService.getDirectoryById(gameDirId);
		setGameDir(gameDirectory);
	}, [gameDirId]);

	const fetchModel = useCallback(async (): Promise<void> => {
		const fetchedModel = await modelService.getModelById(gameDirId, modelId);
		setModel(fetchedModel);

		// Update the state variables for the input fields with the fetched data
		setModelName(fetchedModel.name);
		setModelDff(fetchedModel.dff);
		setModelTxd(fetchedModel.txd);
		setModelIde(fetchedModel.ide);
		setModelCategoryId(fetchedModel.categoryId);
		setModelDrawDist(fetchedModel.drawDist);
		setModelHasCol(fetchedModel.hasCollision);
		setModelIsBrk(fetchedModel.isBreakable);
		setModelHasAnim(fetchedModel.hasAnimation);
		setModelTimeOn(fetchedModel.timeOn);
		setModelTimeOff(fetchedModel.timeOff);

		// Update the modelTagIds state with the fetched tag ids
		setModelTagIds(fetchedModel.tagIds);
	}, [gameDirId, modelId]);

	// Tags

	const fetchTags = useCallback(async (): Promise<void> => {
		const tags = await tagService.getTags(gameDirId);
		setGameDirTags(tags);
	}, [gameDirId, modelId]);

	const addTag = () => {
		if (!modelTagIds.includes(tagInput) && tagInput != 0) {
			setModelTagIds([...modelTagIds, tagInput]);
			setTagInput(0);

			handleChangeModel(new ModelModel(modelId, modelName, modelDff, modelTxd, modelIde, modelCategoryId, [...modelTagIds, tagInput], modelDrawDist, modelHasCol, modelIsBrk, modelHasAnim, modelTimeOn, modelTimeOff));
		} else {
			// TODO: pop up informing the user about missing field
		}
	};

	const removeTag = (tagIdToRemove: number) => {
		const updatedTags = modelTagIds.filter(tag => tag !== tagIdToRemove);
		setModelTagIds(updatedTags);

		handleChangeModel(new ModelModel(modelId, modelName, modelDff, modelTxd, modelIde, modelCategoryId, updatedTags, modelDrawDist, modelHasCol, modelIsBrk, modelHasAnim, modelTimeOn, modelTimeOff));
	};

	// Model

	function handleChangeModel(model: ModelModel) {
		let newModel = {
			...model,
		};

		const updatedModel = modelService.updateModel(gameDirId, [model], newModel);
		setModel(updatedModel[0]);
	}

	// Handling

	async function handleTakeThumbnail() {
		await thumbnailService.generateThumbnail(gameDir, model).then((text) => {
			setThumbnailNotificationTextTop("Thumbnail generated!");
			setThumbnailNotificationTextBottom(model.name);
			setTimeout(() => {
				const notificationElement = document.getElementById('notification-progress');

				if (notificationElement) {
					notificationElement.classList.add('fade-out');
					setTimeout(() => {
						setThumbnailNotificationTextBottom("");
					}, 500);
				}
			}, 2500);
		}).catch((error) => {
			setThumbnailNotificationTextTop("Error generating thumbnail!");
			setThumbnailNotificationTextBottom(model.name);
			setTimeout(() => {
				const notificationElement = document.getElementById('notification-progress');

				if (notificationElement) {
					notificationElement.classList.add('fade-out');
					setTimeout(() => {
						setThumbnailNotificationTextBottom("");
					}, 500);
				}
			}, 2500);
		});
	}

	const ModelViewportContainer = () => {
		return (
			<MemoizedModelViewport
				dff={modelDff}
				txd={modelTxd}
				game={gameDir.game}
				categoryId={modelCategoryId}
			/>
		);
	};

	return (
		<>
			<Header
				previousPage={`/browser?id=${gameDir.id}`}
			/>
			<div className="header-content">
				<div className='right'>
					<button onClick={handleTakeThumbnail}>
						<i className="add-thumbnail"></i>
					</button>
				</div>
			</div>

			<Notification
				textTop={thumbnailNotificationTextTop}
				textBottom={thumbnailNotificationTextBottom}
			/>

			<div className='page-content'>
				<div className='browser-page-background' style={{ backgroundImage: `url(/dirCovers/${gameDir.coverImage})` }}></div>

				<h1 className='page-title'>{modelName ? modelName + " (" + modelId + ")" : "‎"}</h1>

				{/* Render SkinViewport only if model state is set */}
				{model.id !== 0 ? (
					<ModelViewportContainer />
				) : (
					<div className='fake-canvas'></div>
				)}

				<div className='content-block'>
					<div className='modelCardTags'>
						{modelTagIds && modelTagIds.length > 0 && modelTagIds.map(tagId => {
							const tag = gameDirTags.find(t => t.id === tagId);
							return (
								<span>
									{tag && tag.name}
									<span className='removeTag' onClick={() => removeTag(tagId)}>X</span>
								</span>
							);
						})}
					</div>
					<br />
					<div className='inputWithButton'>
						<select
							value={tagInput}
							onChange={e => setTagInput(Number(e.target.value))}
						>
							<option value="">Select Tag</option>
							{gameDirTags
								.filter(tag => !modelTagIds.includes(tag.id))
								.map(tag => (
									<option key={tag.id} value={tag.id}>
										{tag.name}
									</option>
								))}
						</select>
						<button className='textButton' onClick={addTag}>Add</button>
					</div>
				</div>

				<div className='content-block'>
					<h2><i className="transparent list"></i>Properties</h2>
					<table className='modelTable'>
						<tr>
							<td><b>Model id:</b></td>
							<td>{modelId}</td>
						</tr>
						<tr>
							<td><b>Model name:</b></td>
							<td>{modelName}</td>
						</tr>
						<tr>
							<td><b>In gameDirectory:</b></td>
							<td>{gameDir.name}</td>
						</tr>
						<tr>
							<td><b>Category:</b></td>
							<td>{Object.entries(categoryTypes).find(([key, value]) => Number(key) === modelCategoryId)?.[1] ?? ""}</td>
						</tr>
						<tr>
							<td><b>Draw distance:</b></td>
							<td>{modelDrawDist}</td>
						</tr>
						{/* <tr>
							<td><b>Has collision:</b></td>
							<td>{modelHasCol ? 'yes' : 'no'}</td>
						</tr>
						<tr>
							<td><b>Is breakable:</b></td>
							<td>{modelIsBrk ? 'yes' : 'no'}</td>
						</tr>
						<tr>
							<td><b>Has animation:</b></td>
							<td>{modelHasAnim ? 'yes' : 'no'}</td>
						</tr>
						<tr>
							<td><b>Visible:</b></td>
							<td>{modelTimeOn ? modelTimeOn + ' - ' + modelTimeOff : 'always'}</td>
						</tr> */}
					</table>
				</div>

				<div className='content-block'>
					<h2><i className="transparent file"></i>Files</h2>
					<table className='modelTable'>
						<tr>
							<td><b>IDE:</b></td>
							<td>{modelIde}</td>
						</tr>
						<tr>
							<td><b>DFF:</b></td>
							<td>{modelDff}</td>
						</tr>
						<tr>
							<td><b>TXD:</b></td>
							<td>{modelTxd}</td>
						</tr>
					</table>
				</div>
			</div>
		</>
	);
}

export default ViewerPage;