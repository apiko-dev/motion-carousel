import { gsap, Power3 } from 'gsap';

import Slide from './Slide';

export default class SlidesManager {
	constructor(generalManager) {
		this.generalManager = generalManager;

		this.handlers = {
			create: this.create.bind(this),
			tick: this.tick.bind(this),
		};

		this.generalManager.addListener('create', this.handlers.create);
		this.generalManager.addListener('tick', this.handlers.tick);

		this.state = {
			normalPosition: 0,
			oneSlideLength: null,
			currentSlideIndex: 0,
		};

		const arrays = this.generalManager.slides.reduce(
			(acc, slide, index) => {
				slide.originalIndex = index; //eslint-disable-line
				if (index % 2 === 0 && index !== 0) {
					acc[1].push(slide);
				} else {
					acc[0].push(slide);
				}
				return acc;
			},
			[[], []]
		);
		this.generalManager.slides = [...arrays[0], ...arrays[1].reverse()];

		this.generalManager.slides.forEach((slide, index) => {
			slide.slideManager = new Slide(this.generalManager, index, slide.originalIndex); //eslint-disable-line
			slide.shadowIndex = index; //eslint-disable-line
		});
	}

	create() {
		this.generalManager.slides.forEach((slide) => slide.slideManager.create());
		this.state.oneSlideLength = 1 / this.generalManager.slides.length;
		this.updatePos();
		this.updateCurrentSlideIndex();
	}

	destroy() {
		this.generalManager.slides.forEach((slide) => slide.slideManager.destroy());
		this.state.oneSlideLength = null;
	}

	updateCurrentSlideIndex() {
		const direction = Math.round(-this.generalManager.state.sliderPositionEase / this.state.oneSlideLength);
		// console.log(direction);
		if (direction >= 0) {
			this.state.currentSlideIndex = direction % this.generalManager.slides.length;
		}
		if (direction < 0) {
			this.state.currentSlideIndex =
				direction +
				(Math.floor(Math.abs(direction) / (this.generalManager.slides.length + 0.001)) + 1) *
					this.generalManager.slides.length;
		}
		// console.log(this.state.currentSlideIndex, direction);
		// if (!this.generalManager.managers.drag.state.isPointerdown) {
		// 	this.generalManager.state.sliderPosition = -direction * this.state.oneSlideLength;
		// }
	}

	toSlide(toSlideIndex, fast) {
		const x =
			this.generalManager.state.sliderPositionEase -
			this.generalManager.slides[toSlideIndex].slideManager.mesh.position.x / 200 / this.generalManager.slides.length;
		const duration = 0.3;
		gsap.to(this.generalManager.state, { sliderPositionEase: x, duration, ease: Power3.easeInOut });
		// this.generalManager.state.sliderPosition -=
		// 	this.generalManager.slides[toSlideIndex].slideManager.mesh.position.x / 200 / this.generalManager.slides.length;

		if (fast) this.generalManager.state.sliderPositionEase = this.generalManager.state.sliderPosition;
	}

	updatePos(sliderPosition = 0) {
		this.state.normalPosition = sliderPosition;
		if (Math.abs(this.state.normalPosition) > 1) this.state.normalPosition %= 1;

		this.generalManager.slides.forEach(({ slideManager }, index) => {
			if (!slideManager) return;

			let x;
			x = this.state.oneSlideLength * index + this.state.normalPosition;
			if (x > 0.5) x -= 1;
			if (x > 0.5) x -= 1;
			if (x < -0.5) x += 1;
			if (x < -0.5) x += 1;
			const z = Math.abs(x) ** 1.2;

			const angle = Math.asin(x * 1.5);
			slideManager.updatePos(
				x * 200 * this.generalManager.slides.length,
				z * 200 * this.generalManager.slides.length,
				angle
			);
		});
	}

	tick() {
		this.updatePos(this.generalManager.state.sliderPositionEase);
		this.updateCurrentSlideIndex();
	}
}
