import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customAlphabet } from 'nanoid';

import { GameDirectoryModel } from '../models/gameDirectoryModel';

import localService from '../services/localService';
import directoryService from '../services/directoryService';

import Notification from '../components/Notification';

import { imageOptions } from '../utils/constants';

import '../App.scss';


function GameDirectoryForm(props: { gameDir?: GameDirectoryModel }) {

    const [dirId, setGameDirId] = useState<number>(props.gameDir?.id ?? 0);
    const [dirName, setGameDirName] = useState(props.gameDir?.name ?? '');
    const [dirPath, setGameDirPath] = useState(props.gameDir?.directoryPath ?? '');
    const [dirGame, setGameDirGame] = useState<string>(props.gameDir?.game ?? '');
    const [dirImage, setGameDirImage] = useState(props.gameDir?.coverImage ?? '');
    const [gameDirs, setGameDirs] = useState<GameDirectoryModel[]>([]);

    const [formValidationText, setFormValidationText] = useState("");

    const navigate = useNavigate();
    const nanoid = customAlphabet('1234567890', 5);

    // Initializing data

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchGameDirectories();
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, []);

    const fetchGameDirectories = async (): Promise<void> => {
        const gameDirectories = await directoryService.getDirectories();
        setGameDirs(gameDirectories);
    }

    const getDirPath = async (): Promise<void> => {
        const path = await localService.selectFolder();
        setGameDirPath(path);
        getDirGame(path);
        setGameDirId(Number(nanoid())) // TODO: move it somewhere else where it makes more sense
    };

    const getDirGame = async (path: string): Promise<void> => {
        const detectedGame = await localService.detectGame(path);
        setGameDirGame(detectedGame);
    }

    async function handleAddGameDirectory(id: number, name: string, path: string, game: string, image: string): Promise<void> {
        if ((dirId && dirId !== 0) && dirName !== '' && dirPath !== '' && dirGame !== '' && dirImage !== '') {
            const newGameDirectory = await directoryService.createDirectory(id, name, path, game, image);
            navigate(`/browser?id=${dirId}`);
        } else {
            console.log("Please fill in all the fields!");
            setFormValidationText("Please fill in all the fields!");
            setTimeout(() => {
                const notificationElement = document.getElementById('notification-progress');

                if (notificationElement) {
                    notificationElement.classList.add('fade-out');
                    setTimeout(() => {
                        setFormValidationText("");
                    }, 500);
                }
            }, 2500);
        }
    }

    async function handleUpdateGameDirectory(gameDir: GameDirectoryModel): Promise<void> {
        if ((dirId && dirId !== 0) && dirName !== '' && dirPath !== '' && dirGame !== '' && dirImage !== '') {
            const updatedDirs = await directoryService.updateDirectory(gameDirs, gameDir);
            navigate(`/browser?id=${dirId}`);
        } else {
            console.log("Please fill in all the fields!");
            setFormValidationText("Please fill in all the fields!");
            setTimeout(() => {
                const notificationElement = document.getElementById('notification-progress');

                if (notificationElement) {
                    notificationElement.classList.add('fade-out');
                    setTimeout(() => {
                        setFormValidationText("");
                    }, 500);
                }
            }, 2500);
        }
    }

    async function handleDeleteGameDirectory(gameDirID: number): Promise<void> {
        const updatedDirs = await directoryService.deleteDirectory(gameDirs, gameDirID);
        navigate(`/home`);
    }

    return (
        <div className='form-content'>

            <Notification
                textTop="Incomplete form!"
                textBottom={formValidationText}
            />

            <div className='content-block'>
                <span>Directory name:</span>
                <br />
                <input
                    placeholder="Name"
                    value={dirName}
                    onChange={e => setGameDirName(e.target.value)}
                />
            </div>

            <div className='content-block'>
                <span>Select folder:</span>
                <br />
                <button className='textButton' onClick={getDirPath}>Open folder</button>
                <br />
                <div className='detectionField'>
                    <span>Folder path: </span>
                    <br />
                    <span className='detectedText'>{dirPath}</span>
                    <br />
                    <span>Detected game: </span>
                    <br />
                    <span className='detectedText'>{dirGame}</span>
                </div>
            </div>

            <div className='content-block'>
                <span>Select cover image:</span>
                <br />
                <div className='imageSelection'>
                    {imageOptions.map((option) => (
                        <img
                            key={option.value}
                            className={dirImage === option.image.split("/")[option.image.split("/").length - 1] ? 'highlight' : ''}
                            onClick={() => setGameDirImage(option.image.split("/")[option.image.split("/").length - 1])}
                            src={option.image}
                        />
                    ))}
                </div>
            </div>

            <br />

            <div className='form-buttons'>
                {props.gameDir ?
                    <>
                        <button className='textButton' onClick={() => {
                            handleUpdateGameDirectory(new GameDirectoryModel(dirId, dirName, dirPath, dirGame, dirImage));
                        }}>Update</button>

                        <button className='deleteBtn textButton' onClick={() => {
                            handleDeleteGameDirectory(props.gameDir?.id ?? 0);
                        }}>Delete</button>
                    </>
                    :
                    <>
                        <button className='textButton' onClick={() => {
                            handleAddGameDirectory(dirId, dirName, dirPath, dirGame, dirImage);
                        }}>Add</button>

                        <button className='cancelBtn textButton' onClick={() => {
                            navigate(`/home`);
                        }}>Cancel</button>
                    </>
                }
            </div>
        </div>
    )
}

export default GameDirectoryForm;