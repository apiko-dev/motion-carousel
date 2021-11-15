import * as THREE from 'three';

export default class DragManager {
	constructor(generalManager) {
		this.generalManager = generalManager;

		this.state = {
			isInDrag: false,
			pointerId: null,
			startX: 0,
			deltaX: 0,
			easeDeltaX: 0,
			raycaster: new THREE.Raycaster(),
			mouse: new THREE.Vector2(Infinity, Infinity),
			oneSlideLength: null,
		};

		this.handlers = {
			pointerdown: this.pointerdown.bind(this),
			pointermove: this.pointermove.bind(this),
			pointerup: this.pointerup.bind(this),
			tick: this.tick.bind(this),
		};

		this.generalManager.addListener('pointerdown', this.handlers.pointerdown);
		this.generalManager.addListener('pointermove', this.handlers.pointermove);
		this.generalManager.addListener('pointerup', this.handlers.pointerup);
		this.generalManager.addListener('tick', this.handlers.tick);
	}

	pointerdown(event) {
		if (!event.path.includes(this.generalManager.DOM.container)) return;

		this.state.isInDrag = true;
		this.state.pointerId = event.pointerId;
		this.state.startX = event.clientX / this.generalManager.width - this.state.easeDeltaX;
		this.state.startXCleared = event.clientX / this.generalManager.width;
	}

	pointermove(event) {
		if (!this.state.isInDrag || this.state.pointerId !== event.pointerId) return;

		this.state.deltaX = event.clientX / this.generalManager.width - this.state.startX;
		this.state.isMoved = Math.abs(event.clientX / this.generalManager.width - this.state.startXCleared) > 0.01;
		// console.log(this.state.deltaX);
	}

	pointerup(event) {
		if (!this.state.isInDrag || this.state.pointerId !== event.pointerId) return;

		this.state.mouse.x = (event.clientX / this.generalManager.width) * 2 - 1;
		this.state.mouse.y = -(event.clientY / this.generalManager.height) * 2 + 1;

		if (!this.state.isMoved) this.chooseSlide();

		this.state.isInDrag = false;
		this.state.pointerId = null;
		this.state.startX = 0;
		this.state.isMoved = false;
	}

	chooseSlide() {
		this.state.raycaster.setFromCamera(this.state.mouse, this.generalManager.managers.three.camera);
		const intersects = this.state.raycaster.intersectObjects(this.generalManager.managers.three.scene.children);
		if (!intersects[0] || !intersects[0].object.isMesh) return;

		const div = function (a, b) {
			return (a - (a % b)) / b;
		};

		const index = intersects[0].object.userData.id;
		console.log('this.state.currentActive', this.state.currentActive);
		let slideIndex = 0;
		if (this.state.currentActive > 0) {
			slideIndex = this.state.currentActive % this.generalManager.managers.slides.state.slides.length;
		}
		if (this.state.currentActive < 0) {
			slideIndex =
				this.state.currentActive +
				(div(Math.abs(this.state.currentActive), this.generalManager.managers.slides.state.slides.length + 0.1) + 1) *
					this.generalManager.managers.slides.state.slides.length;

			console.log('slideIndex', slideIndex);
			console.log(
				'div',
				div(Math.abs(this.state.currentActive), this.generalManager.managers.slides.state.slides.length + 0.1)
			);
		}
		// const slideIndex = Math.abs(this.state.currentActive % this.generalManager.managers.slides.state.slides.length);
		console.log(index, slideIndex, index >= slideIndex + this.generalManager.managers.slides.state.slides.length / 2);
		// console.log(
		// 	(Math.abs(this.state.currentActive) + index - this.generalManager.managers.slides.state.slides.length) *
		// 		this.state.oneSlideLength
		// );

		const x1 = this.generalManager.managers.slides.state.slides[slideIndex].mesh.position.x;
		const x2 = this.generalManager.managers.slides.state.slides[index].mesh.position.x;

		if (x1 > x2) {
			console.log('кручу вправо');
			if (index < slideIndex) {
				console.log(index - slideIndex);
				this.state.deltaX -= (index - slideIndex) * this.state.oneSlideLength;
			} else {
				console.log(index - slideIndex - this.generalManager.managers.slides.state.slides.length);
				this.state.deltaX -=
					(index - slideIndex - this.generalManager.managers.slides.state.slides.length) * this.state.oneSlideLength;
			}
		} else {
			console.log('кручу влево');
			if (index < slideIndex) {
				this.state.deltaX -=
					(index - slideIndex + this.generalManager.managers.slides.state.slides.length) * this.state.oneSlideLength;
			} else {
				this.state.deltaX -= (index - slideIndex) * this.state.oneSlideLength;
			}
		}
	}

	tick() {
		this.state.oneSlideLength = 1 / this.generalManager.managers.slides.state.slides.length;
		this.state.currentActive = Math.round(-this.state.deltaX / this.state.oneSlideLength);
		if (!this.state.isInDrag) {
			this.state.deltaX = -this.state.currentActive * this.state.oneSlideLength;
		}

		this.state.easeDeltaX += 0.05 * (this.state.deltaX - this.state.easeDeltaX);
		this.generalManager.managers.slides.updatePos(this.state.easeDeltaX);

		// for ( let i = 0; i < intersects.length; i ++ ) {

		// 	intersects[ i ].object.material.color.set( 0xff0000 );

		// }
	}
}
