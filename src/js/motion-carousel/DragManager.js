import * as THREE from 'three';

export default class DragManager {
	constructor(generalManager) {
		this.generalManager = generalManager;

		this.state = {
			isPointerdown: false,
			pointerId: null,
			startX: 0,
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
		if (!event.path.includes(this.generalManager.DOM.container)) return;

		this.state.isPointerdown = true;
		this.state.pointerId = event.pointerId;

		this.state.startX = event.clientX / this.generalManager.width - this.generalManager.state.sliderPositionEase;
		this.state.startXCleared = event.clientX / this.generalManager.width;
	}

	pointermove(event) {
		if (!this.state.isPointerdown || this.state.pointerId !== event.pointerId) return;

		const delta = Math.abs(event.clientX / this.generalManager.width - this.state.startXCleared);

		if (delta > 0.01) {
			if (this.state.isMoved !== delta > 0.01) {
				this.state.isMoved = delta > 0.01;
				this.generalManager.startDrag();
			}

			this.generalManager.state.sliderPosition = event.clientX / this.generalManager.width - this.state.startX;
		}
	}

	pointerup(event) {
		if (!this.state.isPointerdown || this.state.pointerId !== event.pointerId) return;

		this.state.mouse.x = (event.clientX / this.generalManager.width) * 2 - 1;
		this.state.mouse.y = -(event.clientY / this.generalManager.height) * 2 + 1;

		if (!this.state.isMoved) this.click();

		if (this.state.isMoved) {
			this.generalManager.stopDrag();
		}

		this.state.isPointerdown = false;
		this.state.pointerId = null;
		this.state.startX = 0;
		this.state.isMoved = false;
	}

	click() {
		this.state.raycaster.setFromCamera(this.state.mouse, this.generalManager.managers.three.camera);
		const intersects = this.state.raycaster.intersectObjects(this.generalManager.managers.three.scene.children);
		if (intersects[0] && intersects[0].object.isMesh) this.generalManager.slideClick(intersects[0].object.userData.id);
	}
}
