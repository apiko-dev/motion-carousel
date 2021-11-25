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

		this.shadowScaleHeight = 1 / 2.5;
		this.shadowScaleWidth = 8 / 10;

		this.generalManager.addListener('resize', this.handlers.resize);
	}

	hide() {
		if (this.isHided) return;

		this.isHided = true;
		this.generalManager.managers.three.scene.remove(this.mesh);
		this.generalManager.managers.three.scene.remove(this.shadowMesh);
	}

	show() {
		if (!this.isHided) return;

		this.isHided = false;
		this.generalManager.managers.three.scene.add(this.mesh);
		this.generalManager.managers.three.scene.add(this.shadowMesh);
	}

	create() {
		this.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

		this.material = new THREE.ShaderMaterial({
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

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.userData.id = this.id;
		this.mesh.userData.originalId = this.originalId;
		this.generalManager.managers.three.scene.add(this.mesh);

		this.shadowGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
		this.shadowMaterial = new THREE.ShaderMaterial({
			uniforms: {
				uOpacity: {},
			},
			side: THREE.DoubleSide,
			fragmentShader: shadowFragment,
			vertexShader: shadowVertex,
			transparent: true,
		});

		this.shadowMesh = new THREE.Mesh(this.shadowGeometry, this.shadowMaterial);
		this.generalManager.managers.three.scene.add(this.shadowMesh);
		this.shadowMesh.rotation.set(90 / (180 / Math.PI), 0, 0);

		this.updateWidthHeight();
	}

	updateTexture(img) {
		const texture = new THREE.Texture(img);
		this.material.uniforms.uImage.value = texture;
		this.material.uniforms.uBGSize.value = new THREE.Vector2(texture.image.width, texture.image.height);
		this.updateContainerUniform();
		texture.needsUpdate = true;
	}

	updatePos(x, z, angle, opacity) {
		this.mesh.position.set(x, 0, -z);
		this.mesh.rotation.set(0, angle, 0);

		this.shadowMesh.position.set(
			x,
			-this.generalManager.state.slideHeight / 2 - this.generalManager.state.slideHeight / 20,
			-z + (this.generalManager.state.slideHeight / 2) * this.shadowScaleHeight
		);
		this.shadowMesh.rotation.set(90 / (180 / Math.PI), 0, -angle);
		this.material.uniforms.uOpacity.value = opacity;
		this.shadowMaterial.uniforms.uOpacity.value = opacity;
	}

	updateContainerUniform() {
		// this.material.uniforms.uScreenSize.value = new THREE.Vector2(
		// 	this.generalManager.state.slideWidth,
		// 	this.generalManager.state.slideHeight
		// );
		this.material.uniforms.uScreenSize.value = new THREE.Vector2(this.mesh.scale.x, this.mesh.scale.y);
	}

	updateWidthHeight(x = this.generalManager.state.slideWidth, y = this.generalManager.state.slideHeight) {
		this.mesh.scale.x = x;
		this.mesh.scale.y = y;

		this.shadowMesh.scale.x = x * this.shadowScaleWidth;
		this.shadowMesh.scale.y = y * this.shadowScaleHeight;
		this.updateContainerUniform();
	}

	resize() {
		this.updateContainerUniform();
	}
}
