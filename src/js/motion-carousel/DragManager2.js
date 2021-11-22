import * as THREE from 'three';
import { gsap, Power3 } from 'gsap';

export default class DragManager {
	constructor(generalManager) {
		this.generalManager = generalManager;

		this.state = {
			isPointerdown: false,
			isMovedX: false,
			isMovedY: false,
			isClicked: false,
			direction: null,

			x0: 0,
			x1: 0,
			x2: 0,

			y0: 0,
			y1: 0,
			y2: 0,

			delta: 0,

			raycaster: new THREE.Raycaster(),
			mouse: new THREE.Vector2(Infinity, Infinity),
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
		if (!event.composedPath().includes(this.generalManager.DOM.container)) return;

		this.generalManager.managers.three.renderer.domElement.style.cursor = this.getIsMouseIntersect()
			? 'pointer'
			: 'grabbing';

		this.state.isPointerdown = true;
		this.state.isClicked = false;
		this.state.direction = null;

		this.state.x0 = event.pageX;
		this.state.x1 = event.pageX;
		this.state.x2 = event.pageX;

		this.state.y0 = event.pageY;
		this.state.y1 = event.pageY;
		this.state.y2 = event.pageY;
	}

	pointermove(event) {
		this.state.x2 = event.pageX;
		this.state.y2 = event.pageY;

		if (this.state.isPointerdown) {
			console.log('move');
			this.state.isMovedX = Math.abs(this.state.x0 - this.state.x2) > 1;
			this.state.isMovedY = Math.abs(this.state.y0 - this.state.y2) > 1;

			if (Math.abs(this.state.x2 - this.state.x1) < Math.abs(this.state.y2 - this.state.y1)) {
				this.state.direction = this.state.direction ? this.state.direction : 'v';

				if (this.state.direction === 'v' && event.pointerType === 'touch') {
					this.pointerup(event);
				}
			} else {
				this.state.direction = this.state.direction ? this.state.direction : 'h';
			}
		}

		this.state.y1 = this.state.y2;

		if (this.state.tmpIsPointerdown !== this.state.isPointerdown) {
			this.state.tmpIsPointerdown = this.state.isPointerdown;

			this.state.x1 = this.state.x2;
			this.state.y1 = this.state.y2;
			if (Math.abs(this.state.x0 - this.state.x2) > 0) {
				this.generalManager.startDrag();
			}
		}

		this.state.mouse.x = (event.pageX / this.generalManager.width) * 2 - 1;
		this.state.mouse.y = -(event.pageY / this.generalManager.height) * 2 + 1;
		if (this.state.isMovedX || (!this.getIsMouseIntersect() && this.state.isPointerdown)) {
			this.generalManager.managers.three.renderer.domElement.style.cursor = 'grabbing';
		} else if (this.getIsMouseIntersect()) {
			this.generalManager.managers.three.renderer.domElement.style.cursor = 'pointer';
		} else {
			this.generalManager.managers.three.renderer.domElement.style.cursor = 'grab';
		}
	}

	pointerup(event) {
		console.log('up', this.state.direction);
		this.state.isPointerdown = false;
		this.state.tmpIsPointerdown = false;

		this.state.mouse.x = (event.pageX / this.generalManager.width) * 2 - 1;
		this.state.mouse.y = -(event.pageY / this.generalManager.height) * 2 + 1;
		if (
			!this.state.isMovedX &&
			// && (this.state.direction !== 'v' || event.pointerType !== 'touch')
			!this.state.isMovedY
		) {
			this.click();
		}

		this.state.isMovedX = false;
		this.state.isMovedY = false;

		this.generalManager.managers.three.renderer.domElement.style.cursor = this.getIsMouseIntersect()
			? 'pointer'
			: 'grab';

		this.state.y2 = 0;
		this.state.y1 = 0;
	}

	tick() {
		if (this.state.isPointerdown && Math.abs(this.state.x2 - this.state.x1) > Math.abs(this.state.y2 - this.state.y1)) {
			this.state.delta = this.state.x2 - this.state.x1;

			if (this.generalManager.state.timelinePosition) this.generalManager.state.timelinePosition.pause();
		} else if (!this.state.isPointerdown || (this.state.isPointerdown && this.state.direction !== 'h')) {
			this.state.delta *= 0.95;
		} else {
			this.state.delta = 0;
		}

		if (Math.abs(+this.state.delta.toFixed(1)) <= 0.5 && !this.state.isPointerdown) {
			this.state.isStop = true;
			if (this.state.tmpIsStop !== this.state.isStop && !this.state.isClicked) {
				this.state.tmpIsStop = this.state.isStop;

				this.state.delta = 0;
				const x =
					Math.round(
						this.generalManager.state.sliderPositionEase / this.generalManager.managers.slides.state.oneSlideLength
					) * this.generalManager.managers.slides.state.oneSlideLength;
				const duration = Math.abs(this.generalManager.state.sliderPositionEase - x) * 15;

				this.generalManager.stopDrag();
				this.generalManager.state.timelinePosition = gsap
					.timeline()
					.to(this.generalManager.state, { sliderPositionEase: x, duration, ease: Power3.easeInOut });
			}
		} else {
			this.state.isStop = false;
			this.state.tmpIsStop = false;
		}

		this.generalManager.state.sliderPositionEase += this.state.delta / (200 * this.generalManager.slides.length);
		this.state.x1 = this.state.x2;
		this.state.y1 = this.state.y2;
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
		if (intersects[0] && intersects[0].object.isMesh && intersects[0].object.userData.id !== undefined) {
			this.state.isClicked = true;
			this.state.delta = 0;
			this.generalManager.slideClick(intersects[0].object.userData.id);
		}
	}
}
