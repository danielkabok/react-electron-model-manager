import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { loadSkinMesh } from './viewport';

export async function generateThumbnail(dff: string, txd: string, game: string, categoryId: number, dirId: number, modelName: string): Promise<string> {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, 230 / 160, 0.1, 1000);
	camera.position.z = 2;
	const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setSize(230, 160);
	const controls = new OrbitControls(camera, renderer.domElement);

	scene.add(new THREE.AmbientLight());

	// Load the model
	const mesh = await loadSkinMesh(dff, txd, game, categoryId);
	scene.add(mesh);

	// Set up the camera position to make the loaded mesh fully visible
	const boundingBox = new THREE.Box3().setFromObject(mesh);
	const boundingBoxCenter = boundingBox.getCenter(new THREE.Vector3());
	const boundingBoxSize = boundingBox.getSize(new THREE.Vector3());
	const maxBoundingSize = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);
	const diagonalLength = boundingBoxSize.length();
	let cameraDistance;

	if (categoryId == 0) { // "object" category
		cameraDistance = diagonalLength / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
	} else {
		cameraDistance = maxBoundingSize / Math.tan(Math.PI * camera.fov / 360);
	}

	// Adjust camera distance to make it more zoomed in
	const zoomFactor = 0.7;
	cameraDistance *= zoomFactor;

	if (categoryId == 0) { // "object" category
		// Calculate the new camera position
		const cameraPosition = new THREE.Vector3();
		cameraPosition.copy(boundingBoxCenter);
		cameraPosition.x += cameraDistance / Math.sqrt(2); // Move camera left (45 degrees)
		cameraPosition.y += cameraDistance / Math.sqrt(2); // Move camera downwards (45 degrees)
		cameraPosition.z += cameraDistance;

		// Set the camera position
		camera.position.copy(cameraPosition);
	}
	else {
		// Update the camera's position to look at the center of the bounding box
		camera.position.copy(boundingBoxCenter);
		camera.position.z += cameraDistance;
	}

	// Update the controls target to look at the center of the bounding box
	controls.target.copy(boundingBoxCenter);
	controls.update();

	// Take a screenshot of the scene
	renderer.render(scene, camera);
	const screenshotDataURL = renderer.domElement.toDataURL("png", 0.8);
	console.log("Screenshot taken:", screenshotDataURL);
	window.electron.ipcRenderer.sendMessage('save-screenshot', dirId, modelName, screenshotDataURL);

	// Cleanup
	renderer.dispose();
	controls.dispose();

	return screenshotDataURL;
}
