import * as THREE from 'three';

export default class DragManager {
	constructor(generalManager) {
		this.generalManager = generalManager;

		this.state = {
			isPointerdown: false,
			pointerId: null,
			normalStartX: 0,
			normalStartXCleared: 0,
			raycaster: new THREE.Raycaster(),
			mouse: new THREE.Vector2(Infinity, Infinity),
		};

		this.handlers = {
			pointerdown: this.pointerdown.bind(this),
			pointermove: this.pointermove.bind(this),
			pointerup: this.pointerup.bind(this),
		};

		this.generalManager.addListener('pointerdown', this.handlers.pointerdown);
		this.generalManager.addListener('pointermove', this.handlers.pointermove);
		this.generalManager.addListener('pointerup', this.handlers.pointerup);
	}

	pointerdown(event) {
		if (!event.composedPath().includes(this.generalManager.DOM.container)) return;

		this.state.isPointerdown = true;
		this.state.pointerId = event.pointerId;

		this.generalManager.managers.three.renderer.domElement.style.cursor = this.getIsMouseIntersect()
			? 'pointer'
			: 'grabbing';

		this.state.normalStartX = event.pageX / this.generalManager.width - this.generalManager.state.sliderPositionEase;
		this.state.normalStartXCleared = event.pageX / this.generalManager.width;
	}

	pointermove(event) {
		this.state.mouse.x = (event.pageX / this.generalManager.width) * 2 - 1;
		this.state.mouse.y = -(event.pageY / this.generalManager.height) * 2 + 1;

		if (this.state.isMoved || (!this.getIsMouseIntersect() && this.state.isPointerdown)) {
			this.generalManager.managers.three.renderer.domElement.style.cursor = 'grabbing';
		} else if (this.getIsMouseIntersect()) {
			this.generalManager.managers.three.renderer.domElement.style.cursor = 'pointer';
		} else {
			this.generalManager.managers.three.renderer.domElement.style.cursor = 'grab';
		}

		if (!this.state.isPointerdown || this.state.pointerId !== event.pointerId) return;

		const delta = Math.abs(event.pageX / this.generalManager.width - this.state.normalStartXCleared);

		if (delta > 0.01) {
			if (this.state.isMoved !== delta > 0.01) {
				this.state.isMoved = delta > 0.01;
				this.generalManager.startDrag();
			}

			this.generalManager.state.sliderPosition = event.pageX / this.generalManager.width - this.state.normalStartX;
		}
	}

	pointerup(event) {
		if (!this.state.isPointerdown || this.state.pointerId !== event.pointerId) return;

		this.state.mouse.x = (event.pageX / this.generalManager.width) * 2 - 1;
		this.state.mouse.y = -(event.pageY / this.generalManager.height) * 2 + 1;

		if (!this.state.isMoved) this.click();

		if (this.state.isMoved) {
			this.generalManager.stopDrag();
		}

		this.generalManager.managers.three.renderer.domElement.style.cursor = this.getIsMouseIntersect()
			? 'pointer'
			: 'grab';

		this.state.isPointerdown = false;
		this.state.pointerId = null;
		this.state.normalStartX = 0;
		this.state.isMoved = false;
	}

	getIntersects() {
		this.state.raycaster.setFromCamera(this.state.mouse, this.generalManager.managers.three.camera);
		return this.state.raycaster.intersectObjects(this.generalManager.managers.three.scene.children);
	}

	getIsMouseIntersect() {
		const intersects = this.getIntersects();
		return intersects[0] && intersects[0].object.isMesh && intersects[0].object.userData.id !== undefined;
	}

	click() {
		const intersects = this.getIntersects();
		if (intersects[0] && intersects[0].object.isMesh && intersects[0].object.userData.id !== undefined)
			this.generalManager.slideClick(intersects[0].object.userData.id);
	}
}
