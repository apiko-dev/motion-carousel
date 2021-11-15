import Slide from './Slide';

export default class SlidesManager {
	constructor(generalManager) {
		this.generalManager = generalManager;

		this.handlers = {
			create: this.create.bind(this),
			// tick: this.tick.bind(this),
		};

		this.generalManager.addListener('create', this.handlers.create);
		// this.generalManager.addListener('tick', this.handlers.tick);

		this.state = {
			normalPosition: 0,
			slides: [
				new Slide(this.generalManager, 0, 0),
				new Slide(this.generalManager, 1, 1),
				new Slide(this.generalManager, 2, 4),
				new Slide(this.generalManager, 3, 2),
				new Slide(this.generalManager, 4, 3),
				new Slide(this.generalManager, 5),
				new Slide(this.generalManager, 6),
				new Slide(this.generalManager, 7),
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

	updatePos(normalDelta = 0) {
		this.state.normalPosition = normalDelta;
		if (Math.abs(this.state.normalPosition) > 1) this.state.normalPosition %= 1; // eslint-disable-line

		// this.state.slides.forEach((slide, index) => {
		// 	const sign = index % 2 === 0 ? -1 : 1;
		// 	const zDecrement = index % 2 === 0 ? 0 : 1 / (this.state.slides.length - 0);

		// 	const normalIndex = index / (this.state.slides.length - 0);

		// 	let x = sign * (normalIndex + zDecrement) + this.state.normalPosition * 2;

		// 	if (x > 1) x -= 2;
		// 	if (x < -1) x += 2;

		// 	const z = Math.abs(x) ** 1.4;

		// 	const angle = Math.asin(x * 0.8);

		// 	slide.updatePos(x * 100 * this.state.slides.length, z * 100 * this.state.slides.length, angle);
		// });
		this.state.oneSlideLength = 1 / this.state.slides.length;
		this.state.slides.forEach((slide, index) => {
			let x;
			// if (this.state.oneSlideLength * index + this.state.normalPosition > 0.5) {
			// 	x = this.state.oneSlideLength * index + this.state.normalPosition - 1;
			// } else {
			x = this.state.oneSlideLength * index + this.state.normalPosition; // eslint-disable-line
			// }
			// if (index === 7) {
			// 	console.log(x);
			// }
			// if (x > 1) x -= 1;
			if (x > 0.5) x -= 1;
			if (x > 0.5) x -= 1;
			if (x < -0.5) x += 1;
			if (x < -0.5) x += 1;
			// if (x < -1) x += 2;
			// if (x > 0.5) x -= 1;
			// if (x < -1) x += 2;
			const z = Math.abs(x) ** 1.2;

			const angle = Math.asin(x * 1.5);
			slide.updatePos(x * 200 * this.state.slides.length, z * 200 * this.state.slides.length, angle);
			// console.log(x);
		});
	}
}
