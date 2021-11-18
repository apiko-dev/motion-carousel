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

		this.generalManager.slides.forEach((slide, index) => {
			slide.slideManager = new Slide(this.generalManager, index); //eslint-disable-line
			slide.originalIndex = index; //eslint-disable-line
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
		const direction = Math.round(-this.generalManager.state.sliderPosition / this.state.oneSlideLength);

		if (direction >= 0) {
			this.state.currentSlideIndex = direction % this.generalManager.slides.length;
		}
		if (direction < 0) {
			this.state.currentSlideIndex =
				direction +
				(Math.floor(Math.abs(direction) / (this.generalManager.slides.length + 0.1)) + 1) *
					this.generalManager.slides.length;
		}
		if (!this.generalManager.managers.drag.state.isPointerdown) {
			this.generalManager.state.sliderPosition = -direction * this.state.oneSlideLength;
		}
	}

	toSlide(toSlideIndex) {
		this.generalManager.state.sliderPosition -=
			this.generalManager.slides[toSlideIndex].slideManager.mesh.position.x / 200 / this.generalManager.slides.length;
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
