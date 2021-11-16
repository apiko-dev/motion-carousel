import * as THREE from 'three';

export default class Slide {
	constructor(generalManager, id) {
		this.generalManager = generalManager;

		this.id = id;
	}

	create() {
		const color = Math.random() * 0xffffff;
		this.geometry = new THREE.PlaneBufferGeometry(200, 350, 1, 1);
		this.material = new THREE.MeshBasicMaterial({ color, wireframe: false, side: THREE.DoubleSide });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.userData.id = this.id;
		this.generalManager.managers.three.scene.add(this.mesh);
	}

	updatePos(x, z, angle) {
		this.mesh.position.set(x, 0, -z);
		this.mesh.rotation.set(0, angle, 0);
	}
}
