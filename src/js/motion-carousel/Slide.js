import * as THREE from 'three';

export default class Slide {
	constructor(generalManager) {
		this.generalManager = generalManager;

		// this.handlers = {
		// create: this.create.bind(this),
		// destroy: this.destroy.bind(this),
		// resize: this.resize.bind(this),
		// tick: this.tick.bind(this),
		// };

		// this.generalManager.addListener('create', this.handlers.create);
	}

	create(x, z) {
		const color = Math.random() * 0xffffff;
		this.geometry = new THREE.PlaneBufferGeometry(200, 350, 1, 1);
		this.material = new THREE.MeshBasicMaterial({ color, wireframe: false, side: THREE.DoubleSide });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		// this.mesh.position.set(x, 0, -z);
		// this.mesh.rotation.set(0, Math.atan(-z / x), 0);
		// this.mesh.position.y = x ** 2;
		// console.log(this.mesh.x);
		console.log(this.mesh.position);
		this.generalManager.managers.three.scene.add(this.mesh);
	}

	updatePos(x, z) {
		this.mesh.position.set(x, 0, -z);
	}
}
