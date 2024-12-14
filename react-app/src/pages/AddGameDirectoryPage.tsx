import Header from '../components/Header';

import GameDirectoryForm from '../components/GameDirectoryForm';
import { useEffect } from 'react';

function AddGameDirectoryPage() {

	// Initializing the page data

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<>
			<Header
				previousPage={`/home`}
			/>
			<div className='page-content'>
				<h1 className='page-title'>Add Game Directory</h1>
				<GameDirectoryForm />
			</div>
		</>
	);
}

export default AddGameDirectoryPage;