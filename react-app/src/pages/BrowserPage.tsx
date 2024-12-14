import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameDirectoryModel } from '../models/gameDirectoryModel'
import { ModelModel } from '../models/modelModel';
import { TagModel } from '../models/tagModel';

import directoryService from '../services/directoryService';
import modelService from '../services/modelService';
import tagService from '../services/tagService';
import localService from '../services/localService';
import thumbnailService from '../services/thumbnailService';

import ModelCard from '../components/ModelCard';
import ModelsFilter from '../components/ModelsFilter';
import BrowserPagination from '../components/BrowserPagination';
import NotificationWithOverlay from '../components/NotificationWithOverlay';
import Header from '../components/Header';

import 'react-toastify/dist/ReactToastify.css';

function BrowserPage() {

	const [gameDir, setGameDir] = useState(new GameDirectoryModel(0, "", "", "", ""));
	const [userPath, setUserPath] = useState<string>("");
	const [models, setModels] = useState<ModelModel[]>([]);
	const [filteredModels, setFilteredModels] = useState<ModelModel[]>([]);
	const [Tags, setTags] = useState<TagModel[]>([]);
	const [pageNumber, setPageNumber] = useState(0);

	const [thumbnailGenerationFinished, setThumbnailGenerationFinished] = useState(false);
	const [filterApplied, setFilterApplied] = useState(false);

	const modelsPerPage = 32;
	const pagesVisited = pageNumber * modelsPerPage;
	const pageCount = Math.ceil(filteredModels.length / modelsPerPage);

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

				await Promise.all([fetchGameDirectory(), fetchModels(), fetchTags(), fetchUserPath()]);
			} catch (error) {
				console.error(error);
			}
		};

		window.scrollTo(0, 0);
		fetchData();
	}, []);

	const fetchGameDirectory = async (): Promise<void> => {
		const gameDirectory = await directoryService.getDirectoryById(dirId);
		setGameDir(gameDirectory);
	}

	const fetchModels = async (): Promise<void> => {
		const models = await modelService.getModels(dirId);
		setModels(models);
		setFilteredModels(models.slice().sort((a, b) => a.id - b.id));
	}

	const fetchTags = async (): Promise<void> => {
		const tags = await tagService.getTags(dirId);
		setTags(tags);
	}

	const fetchUserPath = async () => {
		const userPath = await localService.getUserPath();
		setUserPath(userPath);
	}

	// Models

	function handleAddModel(id: number, name: string, dff: string, txd: string, ide: string, categoryId: number, tagIds: number[],
		drawDist: number, hasCol?: boolean, isBrk?: boolean, hasAnim?: boolean, timeOn?: number, timeOff?: number): void {
		const newModel = modelService.createModel(dirId, id, name, dff, txd, ide, categoryId, tagIds, drawDist, hasCol, isBrk, hasAnim, timeOn, timeOff);
		setModels([...models, newModel]);
		noFilter();
		setFilteredModels(models);
	}

	function handleChangeModel(model: ModelModel) {
		const updatedModels = modelService.updateModel(dirId, models, model);
		setModels(updatedModels);
		noFilter();
		setFilteredModels(models);
	}

	function handleDeleteModel(modelId: number) {
		const updatedModels = modelService.deleteModel(dirId, models, modelId);
		setModels(updatedModels);
		noFilter();
		setFilteredModels(models);
	}

	// Filtering

	function noFilter() {
		filterModels("id_asc");
	}

	function filterModels(sortOption: string, tagId?: number, categoryId?: number, keyword?: string) {
		changePage({ selected: 0 });

		// Re rendering pagination to highlight updated current page
		setFilterApplied(true);
		setTimeout(() => {
			setFilterApplied(false);
		}, 1);

		const mfilteredModels = [...models]
			.filter(model => (tagId !== undefined && tagId !== 0) ? model.tagIds.includes(tagId) : true)
			.filter(model => (categoryId !== undefined) ? model.categoryId === categoryId : true)
			.filter(model => (keyword !== undefined && keyword !== "") ? model.name.toLowerCase().includes(keyword.toLowerCase()) : true);

		const sortOptions = {
			id_asc: (a, b) => a.id - b.id,
			id_desc: (a, b) => b.id - a.id,
			name_asc: (a, b) => a.name.localeCompare(b.name),
			name_desc: (a, b) => b.name.localeCompare(a.name),
		} as { [key: string]: (a: any, b: any) => number };

		mfilteredModels.sort(sortOptions[sortOption] || ((a, b) => a.id - b.id));

		setFilteredModels(mfilteredModels);
	}

	// Pagination

	const changePage = ({ selected }: { selected: number }) => {
		window.scrollTo(0, 0);
		setPageNumber(selected);
	}

	// Thumbnails

	async function handleGenerateThumbnails() {
		let visibleModels = filteredModels.slice(pagesVisited, pagesVisited + modelsPerPage);

		setProgressText("0/" + visibleModels.length);
		await thumbnailService.generateAllThumbnails(gameDir, visibleModels, 0, (progressText) => {
			setProgressText(progressText);
		}).then(() => {
			setProgressText("Done!");
			setThumbnailGenerationFinished(true);

			// Re rendering model cards to show the new generated thumbnails
			setTimeout(() => {
				setThumbnailGenerationFinished(false);
			}, 1)
		});
		setTimeout(() => {
			setProgressText("");
		}, 2000); // wait for 2 seconds (2000 milliseconds)
	}

	return (
		<>
			<Header
				previousPage={`/home`}
			/>
			<div className="header-content">
				<div className='right'>
					<button onClick={handleGenerateThumbnails}>
						<i className="thumbnails"></i>
					</button>
					<button onClick={() => navigate(`/settings?id=${dirId}`)}>
						<i className="settings"></i>
					</button>
				</div>
			</div>

			<NotificationWithOverlay
				textTop="Generating thumbnails..."
				textBottom={progressText}
			/>

			<div className='browser-page-content'>
				<div className='browser-page-background' style={{ backgroundImage: `url(/dirCovers/${gameDir.coverImage})` }}></div>
				<div className='browser-title-div'>
					<h1 className="titleWithIcon">
						<img className='gameIconTitle' src={`/gameIcons/${gameDir.game}.png`} alt={`Game Icon for ${gameDir.game}`} />
						<span className="titleText">{gameDir.name}</span>
					</h1>
				</div>
				<div className='search-div'>
					<ModelsFilter
						tags={Tags}
						doFilter={filterModels}
						noFilter={noFilter}
					/>
				</div>
				{
					models.length === 0 ? (
						<div className='no-models-found'>
							<p>To view models in the program, you'll first need to extract them using a tool like <a href='https://www.gtagarage.com/mods/show.php?id=63'>IMG Tool</a>. Begin by creating a new folder in your game's root directory (for example, 'Extracted IMGs'). Then, using the IMG Tool or a similar program, extract the .IMG files into this folder.</p>
							<p>Once you've extracted everything you need, open the settings here (gear icon) and select 'Load IDEs'. This will prompt the program to read all the models from the extracted files.</p>
						</div>
					) : (
						<>
							{/* <BrowserPagination
								pageCount={pageCount}
								changePage={changePage}
							/> */}
							<div className='model-cards-div'>
								{filteredModels
									.slice(pagesVisited, pagesVisited + modelsPerPage)
									.map((model) => (
										!thumbnailGenerationFinished && ( // making possible to re render cards when thumbnails are generated
											<ModelCard
												key={`${model.id}-${thumbnailGenerationFinished}`}
												dirId={Number(dirId)}
												model={model}
												tags={Tags}
												onChange={handleChangeModel}
												onDelete={handleDeleteModel}
												userPath={userPath}
											/>
										)
									))
								}
							</div>
							{!filterApplied && (
								<BrowserPagination
									pageCount={pageCount}
									changePage={changePage}
								/>
							)}
						</>
					)
				}
			</div>
		</>
	);
}

export default BrowserPage;