import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameDirectoryModel } from '../models/gameDirectoryModel'
import { ModelModel } from '../models/modelModel';
import { TagModel } from '../models/tagModel';

import directoryService from '../services/directoryService';
import modelService from '../services/modelService';
import tagService from '../services/tagService';
import ideService from '../services/ideService';
import thumbnailService from '../services/thumbnailService';

import GameDirectoryForm from '../components/GameDirectoryForm';
import NotificationWithOverlay from '../components/NotificationWithOverlay';
import TagsManager from '../components/TagsManager';
import Header from '../components/Header';

function SettingsPage() {

	const [gameDir, setGameDir] = useState(new GameDirectoryModel(0, "", "", "", ""));
	const [models, setModels] = useState<ModelModel[]>([]);
	const [tags, setTags] = useState<TagModel[]>([]);

	const [progressText, setProgressText] = useState("");

	const navigate = useNavigate();

	// Fetching data from URL

	const searchPrarams = new URLSearchParams(window.location.search);
	const dirId = Number(searchPrarams.get("id")) || 0;

	// Initializing the page data

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (dirId === 0) {
					return navigate('/404');
				}
				await Promise.all([fetchGameDirectory(), fetchModels(), fetchTags()]);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();
	}, []);

	const fetchGameDirectory = async (): Promise<void> => {
		const gameDirectory = await directoryService.getDirectoryById(dirId);
		setGameDir(gameDirectory);
	}

	const fetchModels = async (): Promise<void> => {
		const models = await modelService.getModels(dirId);
		setModels(models);
	}

	const fetchTags = async (): Promise<void> => {
		const tags = await tagService.getTags(dirId);
		setTags(tags);
	}

	// Adding models from IDE files

	async function loadIdeFiles() {
		try {
			const models = await ideService.getModelsFromIdeFiles(gameDir.directoryPath, gameDir.game);
			modelService.saveMultipleModels(dirId, models);
			setModels(models);
		} catch (error) {
			console.error('Error loading IDE files:', error);
		}
	}

	async function deleteIdeFiles() {
		modelService.removeModels(dirId);
	}

	async function handleReloadIdes() {
		await deleteIdeFiles();
		await loadIdeFiles();
	}

	// Thumbnails

	async function handleGenerateThumbnails() {
		setProgressText("0/" + models.length);
		await thumbnailService.generateAllThumbnails(gameDir, models, 0, (progressText) => {
			setProgressText(progressText);
		}).then(() => {
			setProgressText("Done!");
		});
		setTimeout(() => {
			setProgressText("");
		}, 2000); // wait for 2 seconds (2000 milliseconds)
	};

	// Tags

	function handleAddTag(id: number, name: string) {
		if ((id && id !== 0) && name !== '') {
			const newTag = tagService.createTag(dirId, id, name);
			setTags([...tags, newTag]);
		} else {
			// TODO: pop up informing the user about missing name
		}
	}

	function handleChangeTags(tag: TagModel) {
		const updatedTags = tagService.updateTag(dirId, tags, tag);
		setTags(updatedTags);
	}

	function handleDeleteTags(id: number) {
		const updatedTags = tagService.deleteTag(dirId, tags, id);
		setTags(updatedTags);
	}

	return (
		<>
			<Header
				previousPage={`/browser?id=${gameDir.id}`}
			/>

			<NotificationWithOverlay
				textTop="Generating thumbnails..."
				textBottom={progressText}
			/>

			<div className='page-content'>
				<div className='browser-page-background' style={{ backgroundImage: `url(/dirCovers/${gameDir.coverImage})` }}></div>
				<h1 className='page-title'>Settings: {gameDir.name}</h1>
				<h2>Actions</h2>
				<div className='form-content'>
					<div className='content-block'>
						<table>
							<tr>
								<td>
									{models.length < 1 ? (
										"Load IDEs:"
									) : (
										"Reload IDEs:"
									)}
								</td>
								<td>
									{models.length < 1 ? (
										<button className='textButton' onClick={loadIdeFiles}>Load IDEs</button>
									) : (
										<button className='textButton' onClick={handleReloadIdes}>Reload IDEs</button>
									)}
								</td>
							</tr>
							<br />
							<tr>
								<td>
									Generate all thumbnails:
								</td>
								<td>
									<button className='textButton' onClick={handleGenerateThumbnails}>Generate all thumbnails</button>
								</td>
							</tr>
						</table>
					</div>
				</div>

				<h2>Tags</h2>
				<TagsManager
					tags={tags}
					onAddTag={handleAddTag}
					onChangeTag={handleChangeTags}
					onDeleteTag={handleDeleteTags}
				/>

				<h2>Edit game directory</h2>
				{gameDir.id !== 0 && (
					<GameDirectoryForm
						gameDir={gameDir}
					/>
				)}
			</div>
		</>
	);
}

export default SettingsPage;