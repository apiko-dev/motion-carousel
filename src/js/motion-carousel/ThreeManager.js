import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
// import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import * as dat from 'dat.gui';
import { BokehPass } from '../lib/BokehPass';

export default class ThreeManager {
	constructor(generalManager) {
		this.generalManager = generalManager;

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
		this.postprocessing = {};
	}

	create() {
		this.scene = new THREE.Scene();
		this.sceneText = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			this.fov,
			this.generalManager.width / this.generalManager.height,
			1,
			2000
		);

		this.scene.background = new THREE.TextureLoader().load('img/bg.jpg');
		this.camera.position.z = this.generalManager.state.cameraPositionZ;
		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			powerPreference: 'high-performance',
		});
		this.renderer.setSize(this.generalManager.width, this.generalManager.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		// this.renderer.shadowMap.enabled = true;
		this.renderer.autoClear = false;
		// this.renderer.sortObjects = false;
		this.generalManager.DOM.container.appendChild(this.renderer.domElement);

		this.renderer.domElement.style.touchAction = 'pan-y';
		this.renderer.domElement.style.userSelect = 'none';
		this.generalManager.DOM.container.style.webkitUserSelect = 'none';
		this.generalManager.DOM.container.style.userSelect = 'none';
		// this.renderer.setClearColor(0x000000, 0);

		const renderPass = new RenderPass(this.scene, this.camera);

		const bokehPass = new BokehPass(this.scene, this.camera, {
			focus: 15.0,
			aperture: 0.025,
			maxblur: 0.1,

			width: this.generalManager.width,
			height: this.generalManager.height,
		});

		const composer = new EffectComposer(this.renderer);

		composer.addPass(renderPass);
		composer.addPass(bokehPass);

		this.postprocessing.composer = composer;
		this.postprocessing.bokeh = bokehPass;

		// const matChanger = () => {
		// 	this.postprocessing.bokeh.uniforms.focus.value = effectController.focus;
		// 	this.postprocessing.bokeh.uniforms.aperture.value = effectController.aperture * 0.00001;
		// 	this.postprocessing.bokeh.uniforms.maxblur.value = effectController.maxblur;
		// };
		this.effectController = {
			focus: this.generalManager.state.cameraPositionZ - 20,
			aperture: 6,
			maxblur: 0.005,
		};

		// const gui = new dat.GUI();
		// gui.add(this.effectController, 'focus', 10.0, 3000.0, 5).onChange(this.matChanger.bind(this));
		// gui.add(this.effectController, 'aperture', 0, 50, 0.1).onChange(this.matChanger.bind(this));
		// gui.add(this.effectController, 'maxblur', 0.0, 0.01, 0.001).onChange(this.matChanger.bind(this));
		// gui.close();

		// matChanger();
		this.matChanger();
	}

	matChanger() {
		// const effectController = {
		// 	focus: this.generalManager.state.cameraPositionZ - 20,
		// 	aperture: 6,
		// 	maxblur: 0.005,
		// };

		this.postprocessing.bokeh.uniforms.focus.value = this.effectController.focus;
		this.postprocessing.bokeh.uniforms.aperture.value = this.effectController.aperture * 0.00001;
		this.postprocessing.bokeh.uniforms.maxblur.value = this.effectController.maxblur;
	}

	get fov() {
		return 2 * Math.atan(this.generalManager.height / 2 / this.generalManager.state.cameraPositionZ) * (180 / Math.PI);
	}

	destroy() {
		this.scene = null;
		this.camera = null;
		this.renderer.domElement.remove();
		this.renderer = null;
	}

	resize(width, height) {
		this.camera.aspect = width / height;
		this.camera.position.z = this.generalManager.state.cameraPositionZ;
		this.camera.fov = this.fov;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
		this.postprocessing.composer.setSize(width, height);
		this.matChanger();
	}

	tick() {
		this.postprocessing.composer.render(0.1);
		this.renderer.clearDepth();
		this.renderer.render(this.sceneText, this.camera);
	}
}
