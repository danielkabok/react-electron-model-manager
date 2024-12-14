import { useNavigate } from 'react-router-dom';

import '../App.scss';

function Header(props: {previousPage: string}) {
    const navigate = useNavigate();

    return (
        <div className="header-content">
            <div className='left'>
                <button className='back-button' onClick={() => navigate(props.previousPage)}>
                    <i className="arrow-left no-background"></i>
                </button>
            </div>
        </div>
    )
}

export default Header;