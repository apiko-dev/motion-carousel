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
			slides: [
				new Slide(this.generalManager),
				new Slide(this.generalManager),
				new Slide(this.generalManager),
				new Slide(this.generalManager),
				new Slide(this.generalManager),
				new Slide(this.generalManager),
				new Slide(this.generalManager),
				new Slide(this.generalManager),
			],
		};

		window.updatePos = this.updatePos.bind(this);
	}

	create() {
		this.state.slides.forEach((slide) => slide.create());

		this.updatePos();
	}

	destroy() {
		this.state.slides.forEach((slide) => slide.destroy());
	}

	tick(time) {
		// return this;
		this.updatePos(time / 1000);
	}

	updatePos(normalPosition = 0) {
		if (Math.abs(normalPosition) > 1) k %= 1; // eslint-disable-line

		this.state.slides.forEach((slide, index) => {
			const sign = index % 2 === 0 ? -1 : 1;
			const zDecrement = index % 2 === 0 ? 0 : 1 / (this.state.slides.length - 0);

			const normalIndex = index / (this.state.slides.length - 0);

			let x = sign * (normalIndex + zDecrement) + normalPosition * 2;

			if (x > 1) x -= 2;
			if (x < -1) x += 2;

			const z = Math.abs(x) ** 1.3;

			slide.updatePos(x * 100 * this.state.slides.length, z * 100 * this.state.slides.length);
		});
	}
}
