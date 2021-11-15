import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';

export default class ThreeManager {
	constructor(generalManager) {
		this.generalManager = generalManager;

		this.setings = {
			cameraPositionZ: 500,
		};

		this.handlers = {
			create: this.create.bind(this),
			destroy: this.destroy.bind(this),
			resize: this.resize.bind(this),
			tick: this.tick.bind(this),
		};

		this.generalManager.addListener('create', this.handlers.create);
		this.generalManager.addListener('destroy', this.handlers.destroy);
		this.generalManager.addListener('resize', this.handlers.resize);
		this.generalManager.addListener('tick', this.handlers.tick);
	}

	create() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			this.fov,
			this.generalManager.width / this.generalManager.height,
			1,
			10000
		);
		this.camera.position.z = this.setings.cameraPositionZ;
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(this.generalManager.width, this.generalManager.height);
		this.generalManager.DOM.container.appendChild(this.renderer.domElement);
		// this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
	}

	get fov() {
		return 2 * Math.atan(this.generalManager.height / 2 / this.setings.cameraPositionZ) * (180 / Math.PI);
	}

	destroy() {
		this.scene = null;
		this.camera = null;
		this.renderer.domElement.remove();
		this.renderer = null;
	}

	resize(width, height) {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	tick() {
		this.renderer.render(this.scene, this.camera);
	}
}
// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// camera.position.z = 5;

// const animate = function () {
// 	requestAnimationFrame(animate);

// 	cube.rotation.x += 0.01;
// 	cube.rotation.y += 0.01;

// 	renderer.render(scene, camera);
// };

// animate();
