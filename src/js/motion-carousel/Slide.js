import * as THREE from 'three';
import gsap from 'gsap';

import slidebgVertex from './shaders/slidebgVertex.glsl';
import slidebgFragment from './shaders/slidebgFragment.glsl';

import shadowVertex from './shaders/shadowVertex.glsl';
import shadowFragment from './shaders/shadowFragment.glsl';

import textFragment from './shaders/textFragment.glsl';

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
			hero: {},
			text: {},
			isBig: false,
			bigTimeline: null,
			bigCoef: 0,
		};

		this.shadowScaleHeight = 1 / 2.5;
		this.shadowScaleWidth = 10 / 10;

		this.generalManager.addListener('resize', this.handlers.resize);
	}

	hide() {
		if (this.isHided) return;

		this.isHided = true;
		this.generalManager.managers.three.scene.remove(this.state.bg.mesh);
		this.generalManager.managers.three.scene.remove(this.state.shadow.mesh);
		this.generalManager.managers.three.scene.remove(this.state.hero.mesh);
		this.generalManager.managers.three.scene.remove(this.state.text.mesh);
	}

	show() {
		if (!this.isHided) return;

		this.isHided = false;
		this.generalManager.managers.three.scene.add(this.state.bg.mesh);
		this.generalManager.managers.three.scene.add(this.state.shadow.mesh);
		this.generalManager.managers.three.scene.add(this.state.hero.mesh);
		this.generalManager.managers.three.scene.add(this.state.text.mesh);
	}

	create() {
		this.state.bg.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
		this.state.hero.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
		this.state.text.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

		this.state.bg.material = new THREE.ShaderMaterial({
			uniforms: {
				uImage: {},
				uScreenSize: { value: new THREE.Vector2() },
				uBGSize: { value: new THREE.Vector2() },
				uOpacity: {},
				uGrayScale: {},
			},
			fragmentShader: slidebgFragment,
			vertexShader: slidebgVertex,
			transparent: true,
		});

		this.state.hero.material = new THREE.ShaderMaterial({
			uniforms: {
				uImage: {},
				uScreenSize: { value: new THREE.Vector2() },
				uBGSize: { value: new THREE.Vector2() },
				uOpacity: {},
				uGrayScale: {},
			},
			fragmentShader: slidebgFragment,
			vertexShader: slidebgVertex,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			// alphaTest: 0.5,
		});

		this.state.text.material = new THREE.ShaderMaterial({
			uniforms: {
				uImage: {},
				uScreenSize: { value: new THREE.Vector2() },
				uBGSize: { value: new THREE.Vector2() },
				uOpacity: { value: 0 },
			},
			fragmentShader: textFragment,
			vertexShader: slidebgVertex,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			// alphaTest: 0.5,
		});
		// this.state.text.material = new THREE.ShaderMaterial({
		// 	uniforms: {
		// 		uImage: {},
		// 		uScreenSize: { value: new THREE.Vector2() },
		// 		uBGSize: { value: new THREE.Vector2() },
		// 		uOpacity: { value: 0 },
		// 	},
		// 	fragmentShader: textFragment,
		// 	vertexShader: slidebgVertex,
		// 	transparent: true,
		// 	depthTest: false,
		// 	depthWrite: false,
		// 	// alphaTest: 0.5,
		// });

		this.state.bg.mesh = new THREE.Mesh(this.state.bg.geometry, this.state.bg.material);
		this.state.bg.mesh.userData.id = this.id;
		this.state.bg.mesh.userData.originalId = this.originalId;

		this.state.hero.mesh = new THREE.Mesh(this.state.hero.geometry, this.state.hero.material);
		this.state.text.mesh = new THREE.Mesh(this.state.text.geometry, this.state.text.material);
		// this.state.text.mesh.renderOrder = 10;
		// console.log(this.state.text.mesh);

		this.generalManager.managers.three.scene.add(this.state.bg.mesh);
		this.generalManager.managers.three.scene.add(this.state.hero.mesh);
		this.generalManager.managers.three.scene.add(this.state.text.mesh);

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
			depthTest: false,
			depthWrite: false,
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

	updatePos(x, z, angle, opacity, greyScale) {
		this.state.text.mesh.position.set(
			x,
			0,
			-z + (this.generalManager.state.slideHeight / 30) * this.state.bigCoef + 2.1
		);
		this.state.text.mesh.rotation.set(0, angle, 0);
		this.state.hero.mesh.position.set(x, 0, -z + (this.generalManager.state.slideHeight / 30) * this.state.bigCoef + 2);
		this.state.hero.mesh.rotation.set(0, angle, 0);
		this.state.bg.mesh.position.set(x, 0, -z);
		this.state.bg.mesh.rotation.set(0, angle, 0);

		this.state.shadow.mesh.position.set(
			x,
			-this.generalManager.state.slideHeight / 2 - this.generalManager.state.slideHeight / 30,
			-z + (this.generalManager.state.slideHeight / 2) * this.shadowScaleHeight
			// + (this.generalManager.state.slideHeight / 30) * this.state.bigCoef
		);
		this.state.shadow.mesh.rotation.set(90 / (180 / Math.PI), 0, -angle);
		this.state.bg.material.uniforms.uOpacity.value = opacity;
		this.state.hero.material.uniforms.uOpacity.value = opacity;
		this.state.shadow.material.uniforms.uOpacity.value = opacity;
		this.state.bg.material.uniforms.uGrayScale.value = greyScale;
		this.state.hero.material.uniforms.uGrayScale.value = greyScale;
	}

	becomeBig() {
		if (this.state.isBig) return;
		this.state.isBig = true;
		this.state.bigTimeline = gsap
			.timeline()
			.to(this.state.text.material.uniforms.uOpacity, { value: 1, duration: 0.5 }, 0)
			.to(this.state, { bigCoef: this.generalManager.state.maxScaleToBig, duration: 0.5 }, 0);
	}

	becomeDefault() {
		if (!this.state.isBig) return;
		this.state.isBig = false;
		this.state.bigTimeline = gsap
			.timeline()
			.to(this.state.text.material.uniforms.uOpacity, { value: 0, duration: 0.5 }, 0)
			.to(this.state, { bigCoef: 0, duration: 0.5 }, 0);
	}

	updateContainerUniform() {
		// this.state.bg.material.uniforms.uScreenSize.value = new THREE.Vector2(
		// 	this.state.bg.mesh.scale.x,
		// 	this.state.bg.mesh.scale.y
		// );
		// this.state.hero.material.uniforms.uScreenSize.value = new THREE.Vector2(
		// 	this.state.hero.mesh.scale.x,
		// 	this.state.hero.mesh.scale.y
		// );
		// this.state.text.material.uniforms.uScreenSize.value = new THREE.Vector2(
		// 	this.state.text.mesh.scale.x,
		// 	this.state.text.mesh.scale.y
		// );
		// this.state.shadow.material.uniforms.uScreenSize.value = new THREE.Vector2(
		// 	this.state.shadow.mesh.scale.x,
		// 	this.state.shadow.mesh.scale.y
		// );
		this.state.bg.material.uniforms.uScreenSize.value = new THREE.Vector2(
			this.generalManager.state.slideWidth,
			this.generalManager.state.slideHeight
		);
		this.state.hero.material.uniforms.uScreenSize.value = new THREE.Vector2(
			this.generalManager.state.slideWidth,
			this.generalManager.state.slideHeight
		);
		this.state.text.material.uniforms.uScreenSize.value = new THREE.Vector2(
			this.state.text.mesh.scale.x,
			this.state.text.mesh.scale.y
		);
		this.state.shadow.material.uniforms.uScreenSize.value = new THREE.Vector2(
			this.state.shadow.mesh.scale.x,
			this.state.shadow.mesh.scale.y
		);
	}

	updateWidthHeight(x = this.generalManager.state.slideWidth, y = this.generalManager.state.slideHeight) {
		this.state.bg.mesh.scale.x = x;
		this.state.bg.mesh.scale.y = y;
		this.state.hero.mesh.scale.x = x;
		this.state.hero.mesh.scale.y = y;

		this.state.text.mesh.scale.x =
			this.state.text.material.uniforms.uBGSize.value.x * (y / this.state.text.material.uniforms.uBGSize.value.y);
		this.state.text.mesh.scale.y = y;

		this.state.shadow.mesh.scale.x = x * this.shadowScaleWidth;
		this.state.shadow.mesh.scale.y = y * this.shadowScaleHeight;
		this.updateContainerUniform();
	}

	resize() {
		this.updateContainerUniform();
	}
}
