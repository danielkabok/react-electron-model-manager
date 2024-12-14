import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import '../App.scss';
import { loadSkinMesh } from '../utils/viewport';


const Scene = (props: { dff: string, txd: string, game: string, categoryId: number, handleFinished: () => void }) => {

	const { camera, gl, scene, size } = useThree();
	const controlsRef = useRef<OrbitControls>();

	// Setup controls and camera
	useEffect(() => {
		const perspectiveCamera = camera as THREE.PerspectiveCamera;
		perspectiveCamera.fov = 75;
		perspectiveCamera.aspect = size.width / size.height;
		perspectiveCamera.near = 0.1;
		perspectiveCamera.far = 1000;
		perspectiveCamera.position.z = 2;
		perspectiveCamera.updateProjectionMatrix();

		controlsRef.current = new OrbitControls(perspectiveCamera, gl.domElement);
		controlsRef.current.enableDamping = true;
		controlsRef.current.dampingFactor = 0.25;
		// controlsRef.current.screenSpacePanning = false;
		// controlsRef.current.maxPolarAngle = Math.PI / 2;

		return () => controlsRef.current!.dispose();
	}, [camera, gl, size]);

	// Update controls on each frame
	useFrame(() => {
		controlsRef.current!.update();
	});

	// Load model and setup camera position
	useEffect(() => {
		const load = async () => {
			const startTime = performance.now();
			try {
				const mesh = await loadSkinMesh(props.dff, props.txd, props.game, props.categoryId);
				const endTime = performance.now();
				console.log(`loadSkinMesh took ${(endTime - startTime).toFixed(2)} milliseconds`);

				scene.clear(); // Clear previous objects
				scene.add(mesh);

				props.handleFinished(); // Hide loading spinner

				const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
				scene.add(ambientLight);

				// Set up the camera position to make the loaded mesh fully visible
				const boundingBox = new THREE.Box3().setFromObject(mesh);
				const boundingBoxCenter = boundingBox.getCenter(new THREE.Vector3());
				const boundingBoxSize = boundingBox.getSize(new THREE.Vector3());
				const maxBoundingSize = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);
				const diagonalLength = boundingBoxSize.length();
				let cameraDistance;

				const perspectiveCamera = camera as THREE.PerspectiveCamera;
				if (props.categoryId === 0) { // "object" category
					cameraDistance = diagonalLength / (2 * Math.tan(THREE.MathUtils.degToRad(perspectiveCamera.fov) / 2));
				} else {
					cameraDistance = maxBoundingSize / Math.tan(Math.PI * perspectiveCamera.fov / 360);
				}

				const zoomFactor = 0.7;
				cameraDistance *= zoomFactor;

				if (props.categoryId === 0) { // "object" category
					const cameraPosition = new THREE.Vector3();
					cameraPosition.copy(boundingBoxCenter);
					cameraPosition.x += cameraDistance / Math.sqrt(2); // Move camera right (45 degrees)
					cameraPosition.y += cameraDistance / Math.sqrt(2); // Move camera upwards (45 degrees)
					cameraPosition.z += cameraDistance;
					perspectiveCamera.position.copy(cameraPosition);
				} else {
					perspectiveCamera.position.copy(boundingBoxCenter);
					perspectiveCamera.position.z += cameraDistance;
				}

				controlsRef.current!.target.copy(boundingBoxCenter);
				controlsRef.current!.update();
				perspectiveCamera.updateProjectionMatrix();

			} catch (error) {

				console.error("Error loading model:", error);
				scene.clear(); // Clear previous objects

				const mesh = await loadSkinMesh("/models/error.dff", "/models/error.txd", "SA", 0);
				scene.add(mesh);
				scene.add(new THREE.AmbientLight(0xffffff, 1.0));

				// Set up the camera position to make the loaded mesh fully visible
				const boundingBox = new THREE.Box3().setFromObject(mesh);
				const boundingBoxCenter = boundingBox.getCenter(new THREE.Vector3());
				const boundingBoxSize = boundingBox.getSize(new THREE.Vector3());
				const maxBoundingSize = Math.max(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);

				const perspectiveCamera = camera as THREE.PerspectiveCamera;
				let cameraDistance = maxBoundingSize / Math.tan(Math.PI * perspectiveCamera.fov / 360);

				perspectiveCamera.position.copy(boundingBoxCenter);
				perspectiveCamera.position.z += cameraDistance;
			}
		};

		load();
	}, [props.dff, props.txd, props.game, props.categoryId, camera, scene]);

	return (
		<>
		</>
	);
};

export default Scene;
