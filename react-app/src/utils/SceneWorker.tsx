/* eslint-disable no-restricted-globals */
import { render } from '@react-three/offscreen';
import Scene from '../components/Scene';

// Store the received data globally
let modelData: { dff: any; txd: any; game: any; categoryId: any; } | null = null;

self.onmessage = (event) => {
	const { type, data } = event.data;

	if (type === 'MODEL_DATA') {
		modelData = data;
		console.log("Worker received MODEL_DATA:", modelData);
		renderScene();
	}
};

const handleFinished = () => {
	self.postMessage({ type: 'MODEL_LOADED' });
};

const renderScene = () => {
	if (!modelData) {
		console.error("No model data to render.");
		return;
	}

	const { dff, txd, game, categoryId } = modelData;
	console.log("Rendering scene with data:", modelData);
	render(<Scene dff={dff} txd={txd} game={game} categoryId={categoryId} handleFinished={handleFinished} />);
};
