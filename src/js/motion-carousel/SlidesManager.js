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
			slides: [
				new Slide(this.generalManager, 0),
				new Slide(this.generalManager, 1),
				new Slide(this.generalManager, 2),
				new Slide(this.generalManager, 3),
				new Slide(this.generalManager, 4),
				new Slide(this.generalManager, 5),
				new Slide(this.generalManager, 6),
				new Slide(this.generalManager, 7),
			],
		};
	}

	create() {
		this.state.slides.forEach((slide) => slide.create());
		this.state.oneSlideLength = 1 / this.state.slides.length;
		this.updatePos();
		this.updateCurrentSlideIndex();
	}

	destroy() {
		this.state.slides.forEach((slide) => slide.destroy());
		this.state.oneSlideLength = null;
	}

	updateCurrentSlideIndex() {
		const direction = Math.round(-this.generalManager.state.sliderPosition / this.state.oneSlideLength);

		if (direction >= 0) {
			this.state.currentSlideIndex = direction % this.state.slides.length;
		}
		if (direction < 0) {
			this.state.currentSlideIndex =
				direction + (Math.floor(Math.abs(direction) / (this.state.slides.length + 0.1)) + 1) * this.state.slides.length;
		}
		if (!this.generalManager.managers.drag.state.isPointerdown) {
			this.generalManager.state.sliderPosition = -direction * this.state.oneSlideLength;
		}
	}

	toSlide(toSlideIndex) {
		const x1 = this.state.slides[this.state.currentSlideIndex].mesh.position.x;
		const x2 = this.state.slides[toSlideIndex].mesh.position.x;

		if (x1 > x2 && toSlideIndex < this.state.currentSlideIndex) {
			this.generalManager.state.sliderPosition -=
				(toSlideIndex - this.state.currentSlideIndex) * this.state.oneSlideLength;
		}
		if (x1 > x2 && toSlideIndex > this.state.currentSlideIndex) {
			this.generalManager.state.sliderPosition -=
				(toSlideIndex - this.state.currentSlideIndex - this.state.slides.length) * this.state.oneSlideLength;
		}
		if (x1 < x2 && toSlideIndex < this.state.currentSlideIndex) {
			this.generalManager.state.sliderPosition -=
				(toSlideIndex - this.state.currentSlideIndex + this.state.slides.length) * this.state.oneSlideLength;
		}
		if (x1 < x2 && toSlideIndex > this.state.currentSlideIndex) {
			this.generalManager.state.sliderPosition -=
				(toSlideIndex - this.state.currentSlideIndex) * this.state.oneSlideLength;
		}
	}

	updatePos(sliderPosition = 0) {
		this.state.normalPosition = sliderPosition;
		if (Math.abs(this.state.normalPosition) > 1) this.state.normalPosition %= 1;

		this.state.slides.forEach((slide, index) => {
			let x;
			x = this.state.oneSlideLength * index + this.state.normalPosition;
			if (x > 0.5) x -= 1;
			if (x > 0.5) x -= 1;
			if (x < -0.5) x += 1;
			if (x < -0.5) x += 1;
			const z = Math.abs(x) ** 1.2;

			const angle = Math.asin(x * 1.5);
			slide.updatePos(x * 200 * this.state.slides.length, z * 200 * this.state.slides.length, angle);
		});
	}

	tick() {
		this.updatePos(this.generalManager.state.sliderPositionEase);
		this.updateCurrentSlideIndex();
	}
}
