import * as THREE from 'three';

import slidebgVertex from './shaders/slidebgVertex.glsl';
import slidebgFragment from './shaders/slidebgFragment.glsl';

import shadowVertex from './shaders/shadowVertex.glsl';
import shadowFragment from './shaders/shadowFragment.glsl';

export default class Slide {
	constructor(generalManager, id, originalId) {
		this.generalManager = generalManager;

		this.id = id;
		this.originalId = originalId;

		this.handlers = {
			resize: this.resize.bind(this),
		};

		this.state = {
			bg: {},
			shadow: {},
		};

		this.shadowScaleHeight = 1 / 2.5;
		this.shadowScaleWidth = 10 / 10;

		this.generalManager.addListener('resize', this.handlers.resize);
	}

	hide() {
		if (this.isHided) return;

		this.isHided = true;
		this.generalManager.managers.three.scene.remove(this.state.bg.mesh);
		this.generalManager.managers.three.scene.remove(this.state.shadow.nesh);
	}

	show() {
		if (!this.isHided) return;

		this.isHided = false;
		this.generalManager.managers.three.scene.add(this.state.bg.mesh);
		this.generalManager.managers.three.scene.add(this.state.shadow.mesh);
	}

	create() {
		this.state.bg.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

		this.state.bg.material = new THREE.ShaderMaterial({
			uniforms: {
				uImage: {},
				uScreenSize: { value: new THREE.Vector2() },
				uBGSize: { value: new THREE.Vector2() },
				uOpacity: {},
			},
			side: THREE.DoubleSide,
			fragmentShader: slidebgFragment,
			vertexShader: slidebgVertex,
			transparent: true,
		});

		this.state.bg.mesh = new THREE.Mesh(this.state.bg.geometry, this.state.bg.material);
		this.state.bg.mesh.userData.id = this.id;
		this.state.bg.mesh.userData.originalId = this.originalId;

		this.generalManager.managers.three.scene.add(this.state.bg.mesh);

		this.state.shadow.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
		this.state.shadow.material = new THREE.ShaderMaterial({
			uniforms: {
				uImage: {},
				uScreenSize: { value: new THREE.Vector2() },
				uBGSize: { value: new THREE.Vector2() },
				uOpacity: {},
			},
			side: THREE.DoubleSide,
			fragmentShader: shadowFragment,
			vertexShader: shadowVertex,
			transparent: true,
		});

		this.state.shadow.mesh = new THREE.Mesh(this.state.shadow.geometry, this.state.shadow.material);
		this.generalManager.managers.three.scene.add(this.state.shadow.mesh);
		this.state.shadow.mesh.rotation.set(90 / (180 / Math.PI), 0, 0);

		this.updateWidthHeight();
	}

	updateTexture(img, key) {
		const texture = new THREE.Texture(img);
		this.state[key].material.uniforms.uImage.value = texture;
		this.state[key].material.uniforms.uBGSize.value = new THREE.Vector2(texture.image.width, texture.image.height);
		this.updateContainerUniform();
		texture.needsUpdate = true;
	}

	updatePos(x, z, angle, opacity) {
		this.state.bg.mesh.position.set(x, 0, -z);
		this.state.bg.mesh.rotation.set(0, angle, 0);

		this.state.shadow.mesh.position.set(
			x,
			-this.generalManager.state.slideHeight / 2 - this.generalManager.state.slideHeight / 30,
			-z + (this.generalManager.state.slideHeight / 2) * this.shadowScaleHeight
		);
		this.state.shadow.mesh.rotation.set(90 / (180 / Math.PI), 0, -angle);
		this.state.bg.material.uniforms.uOpacity.value = opacity;
		this.state.shadow.material.uniforms.uOpacity.value = opacity;
	}

	updateContainerUniform() {
		// this.material.uniforms.uScreenSize.value = new THREE.Vector2(
		// 	this.generalManager.state.slideWidth,
		// 	this.generalManager.state.slideHeight
		// );
		this.state.bg.material.uniforms.uScreenSize.value = new THREE.Vector2(
			this.state.bg.mesh.scale.x,
			this.state.bg.mesh.scale.y
		);
		this.state.shadow.material.uniforms.uScreenSize.value = new THREE.Vector2(
			this.state.shadow.mesh.scale.x,
			this.state.shadow.mesh.scale.y
		);
	}

	updateWidthHeight(x = this.generalManager.state.slideWidth, y = this.generalManager.state.slideHeight) {
		this.state.bg.mesh.scale.x = x;
		this.state.bg.mesh.scale.y = y;

		this.state.shadow.mesh.scale.x = x * this.shadowScaleWidth;
		this.state.shadow.mesh.scale.y = y * this.shadowScaleHeight;
		this.updateContainerUniform();
	}

	resize() {
		this.updateContainerUniform();
	}
}
