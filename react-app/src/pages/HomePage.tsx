import { useState, useEffect } from 'react';

import { GameDirectoryModel } from '../models/gameDirectoryModel'

import directoryService from '../services/directoryService';

import GameDirectoryCard from '../components/GameDirectoryCard';
import { useNavigate } from 'react-router-dom';


function HomePage() {

	const [gameDirs, setGameDirs] = useState<GameDirectoryModel[]>([]);

	const navigate = useNavigate();


	// Initializing the page data

	useEffect(() => {
		const fetchData = async () => {
			try {
				await fetchGameDirectories();
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}

		window.scrollTo(0, 0);
		fetchData();
	}, []);

	const fetchGameDirectories = async (): Promise<void> => {
		const gameDirectories = await directoryService.getDirectories();
		setGameDirs(gameDirectories);
	}

	// Game Directories

	async function handleAddGameDirectory(id: number, name: string, path: string, game: string, image: string): Promise<void> {
		const newGameDirectory = await directoryService.createDirectory(id, name, path, game, image);
		setGameDirs((prevGameDirs: GameDirectoryModel[]) => [...prevGameDirs, newGameDirectory]);
	}

	async function handleUpdateGameDirectory(gameDir: GameDirectoryModel): Promise<void> {
		const updatedDirs = await directoryService.updateDirectory(gameDirs, gameDir);
		setGameDirs(updatedDirs);
	}

	async function handleDeleteGameDirectory(gameDirID: number): Promise<void> {
		const updatedDirs = await directoryService.deleteDirectory(gameDirs, gameDirID);
		setGameDirs(updatedDirs);
	}

	return (
		<>
			<div className='home-page-content'>
				<h1 className='page-title'>Directories</h1>
				<div className='cards-div'>
					{gameDirs.map(gameDir => (
						<GameDirectoryCard
							gameDir={gameDir}
							onChange={handleUpdateGameDirectory}
							onDelete={handleDeleteGameDirectory}
						/>
					))}
					<div className='addGameDirCard' onClick={() => navigate(`/add-game-directory`)}>
						<span>+</span>
					</div>
				</div>
				{/* <button onClick={fetchData}>Reload database</button> */}
			</div>
		</>
	);
}

export default HomePage;