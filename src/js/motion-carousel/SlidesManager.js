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
			],
		};

		window.updatePos = this.updatePos.bind(this);
	}

	create() {
		this.state.slides.forEach((slide, i) => {
			// const sign = i % 2 === 0 ? -1 : 1;
			// const zDecrement = i % 2 === 0 ? 0 : 1;

			// const index = i + 0.1;

			// const x = sign * (index + zDecrement);
			// const z = Math.abs(x) ** 1.1;
			slide.create();
		});

		this.updatePos();
	}

	destroy() {
		this.state.slides.forEach((slide) => slide.destroy());
	}

	tick(time) {
		// return this;
		this.updatePos(-time / 50);
	}

	updatePos(k = 0) {
		if (Math.abs(k) >= this.state.slides.length) k = k % this.state.slides.length; // eslint-disable-line
		// console.log(k);
		// const c = k % 2 === 0 ? -(k - 1) : k;
		this.state.slides.forEach((slide, i) => {
			// const maxX = this.state.slides.length;
			// if (Math.abs(x) > maxX) {
			// 	x = -sign * (slide.index - 1 - zDecrement) - k * 2;
			// 	console.log(slide.index);
			// 	// slide.index += 1; // eslint-disable-line
			// }

			// console.log(k);

			slide.index = slide.index ? slide.index : i; // eslint-disable-line
			const sign = slide.index % 2 === 0 ? -1 : 1;
			const zDecrement = slide.index % 2 === 0 ? 0 : 1;

			// const index = i;

			let x = sign * (slide.index + zDecrement) - k * 2;

			// console.log(x);
			// console.log(x, slide.index);
			// if (Math.abs(x) > this.state.slides.length) {
			// 	const x1 = sign * (slide.index + zDecrement + 1) - k * 2;
			// 	console.log('should move', x, slide.index, x1);
			// 	// slide.index += 1; // eslint-disable-line
			// }
			if (x > this.state.slides.length) {
				x = x - this.state.slides.length * 2; // eslint-disable-line
				// console.log('after:', x);
				// const x1 = slide.index - sign + zDecrement - k * 2;
				// console.log(x, slide.index);
				// slide.index += -k; // eslint-disable-line
			}
			if (x < -this.state.slides.length) {
				x = this.state.slides.length * 2 + x; // eslint-disable-line
				// console.log('after:', x);
				// const x1 = slide.index - sign + zDecrement - k * 2;
				// console.log(x, slide.index);
				// slide.index += -k; // eslint-disable-line
			}
			const z = Math.abs(x) ** 1.1;

			slide.updatePos(x * 100, z * 100);
		});
	}
}
