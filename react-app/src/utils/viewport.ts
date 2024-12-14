import * as THREE from 'three';
import { DFFLoader } from './renderware/dffloader';

export async function loadSkinMesh(dff: string, txd: string, game: string, categoryId: number): Promise<THREE.Mesh> {
	return new Promise<THREE.Mesh>((resolve, reject) => {
		new DFFLoader().load(
			dff,
			txd,
			(mesh: THREE.Mesh) => {
				// Category names represented by categoryIds
				// 0: "object"
				// 1: "vehicle"
				// 2: "npc"
				// 3: "weapon"

				// GTA 3 or GTA SA NPC
				if (categoryId == 2 && (game == "3" || game == "SA")) {
					mesh.rotation.y = -Math.PI / 2;
					resolve(mesh);
					return;
				}

				// GTA VC NPC
				if (categoryId == 2 && game == "VC") {
					mesh.rotation.x = Math.PI;
					mesh.rotation.z = -Math.PI / 2;
					resolve(mesh);
					return;
				}

				// Vehicle
				if (categoryId == 1) {
					mesh.rotation.x = -Math.PI / 2;
					mesh.rotation.y = -Math.PI;
					mesh.rotation.z = Math.PI;
					resolve(mesh);
					return;
				}

				// Everything else
				mesh.rotation.x = -Math.PI / 2;
				mesh.rotation.y = -Math.PI;
				mesh.rotation.z = Math.PI / 2;
				resolve(mesh); // Resolve the promise with the loaded mesh
			},
			undefined, // onProgress
			(error: any) => {
				reject(error); // Reject the promise with the error
			}
		);
	});
}

