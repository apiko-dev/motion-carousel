import * as THREE from 'three';

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
		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.renderer.setSize(this.generalManager.width, this.generalManager.height);
		this.renderer.setPixelRatio(2);
		this.generalManager.DOM.container.appendChild(this.renderer.domElement);
		this.renderer.domElement.style.touchAction = 'pan-y';
		this.renderer.domElement.style.userSelect = 'none';
		this.generalManager.DOM.container.style.webkitUserSelect = 'none';
		this.generalManager.DOM.container.style.userSelect = 'none';
		this.renderer.setClearColor(0x000000, 0);
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
		this.camera.fov = this.fov;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	tick() {
		this.renderer.render(this.scene, this.camera);
	}
}
