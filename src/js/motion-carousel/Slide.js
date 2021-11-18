import * as THREE from 'three';

import slidebgVertex from './shaders/slidebgVertex.glsl';
import slidebgFragment from './shaders/slidebgFragment.glsl';

export default class Slide {
	constructor(generalManager, id) {
		this.generalManager = generalManager;

		this.id = id;
	}

	create() {
		this.geometry = new THREE.PlaneBufferGeometry(200, 350, 1, 1);

		this.material = new THREE.ShaderMaterial({
			uniforms: { uImage: {} },
			side: THREE.DoubleSide,
			fragmentShader: slidebgFragment,
			vertexShader: slidebgVertex,
		});

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.userData.id = this.id;
		this.generalManager.managers.three.scene.add(this.mesh);

		this.shadowGeometry = new THREE.PlaneBufferGeometry(200, 250, 1, 1);
		this.shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: false, side: THREE.DoubleSide });
		this.shadowMesh = new THREE.Mesh(this.shadowGeometry, this.shadowMaterial);
		this.generalManager.managers.three.scene.add(this.shadowMesh);
		this.shadowMesh.rotation.set(90 / (180 / Math.PI), 0, 0);
	}

	updateTexture(img) {
		const texture = new THREE.Texture(img);
		texture.needsUpdate = true;
		this.material.uniforms.uImage.value = texture;
	}

	updatePos(x, z, angle) {
		this.mesh.position.set(x, 0, -z);
		this.mesh.rotation.set(0, angle, 0);

		this.shadowMesh.position.set(x, -200, -z + 125);
		this.shadowMesh.rotation.set(90 / (180 / Math.PI), 0, -angle);
	}
}
