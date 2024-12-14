import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import BrowserPage from './pages/BrowserPage';
import SettingsPage from './pages/SettingsPage';
import ViewerPage from './pages/ViewerPage';
import AddGameDirectoryPage from './pages/AddGameDirectoryPage';
import NoPage from './pages/NoPage';

function App() {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route index element={<HomePage />} />
					<Route path="/home" element={<HomePage />} />
					<Route path="/browser" element={<BrowserPage />} />
					<Route path="/settings" element={<SettingsPage />} />
					<Route path="/viewer" element={<ViewerPage />} />
					<Route path="/add-game-directory" element={<AddGameDirectoryPage />} />
					<Route path="*" element={<NoPage />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
