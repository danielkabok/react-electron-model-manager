import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameDirectoryModel } from '../models/gameDirectoryModel';

import '../App.scss';


function GameDirectoryCard(props: { gameDir: GameDirectoryModel, onChange: (gameDir: GameDirectoryModel) => void, onDelete: (gameDirID: number) => void }) {

    const [dirId, setGameDirId] = useState<number>(props.gameDir.id);
    const [dirGame, setGameDirGame] = useState<string>(props.gameDir.game);
    const [dirImage, setGameDirImage] = useState(props.gameDir.coverImage);

    const navigate = useNavigate();

    const handleCardClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        navigate(`/browser?id=${dirId}`);
    }

    return (
        <div>
            <div className='gameDirectoryCard' style={{ backgroundImage: `url(/dirCovers/${dirImage})` }} onClick={handleCardClick}>
                <h3>{props.gameDir.name}</h3>
                <img className='gameIcon' src={`/gameIcons/${dirGame}.png`} alt={`Game Icon for ${dirGame}`} />
            </div>
        </div>
    )
}

export default GameDirectoryCard;