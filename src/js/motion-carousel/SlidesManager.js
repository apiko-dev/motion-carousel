import { gsap, Power3 } from 'gsap';

import Slide from './Slide';

function lerp(start, end, t) {
	return start * (1 - t) + end * t;
}

function spline(x, points) {
	for (let i = 0; i < points.length - 1; i++) {
		if (x >= points[i].x && x < points[i + 1].x) {
			return lerp(points[i].y, points[i + 1].y, (x - points[i].x) / (points[i + 1].x - points[i].x));
		}
	}
	return 1;
}

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
		if (direction >= 0) {
			this.state.currentSlideIndex = direction % this.generalManager.slides.length;
		}
		if (direction < 0) {
			this.state.currentSlideIndex =
				direction +
				(Math.floor(Math.abs(direction) / (this.generalManager.slides.length + 0.001)) + 1) *
					this.generalManager.slides.length;
		}
	}

	toSlide(toSlideIndex, fast) {
		if (this.generalManager.state.timelinePosition) this.generalManager.state.timelinePosition.pause();
		const x =
			this.generalManager.state.sliderPositionEase -
			(this.generalManager.slides[toSlideIndex].slideManager.mesh.position.x -
				this.getSlideGapByOrder(this.generalManager.slides[toSlideIndex].slideManager.orderNumber)) /
				this.generalManager.state.slideWidth /
				this.generalManager.slides.length;

		const duration = 0.5;

		this.generalManager.state.timelinePosition = gsap
			.timeline()
			.to(this.generalManager.state, { sliderPositionEase: x, duration, ease: Power3.easeInOut });

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

			const orderNumber = Number(x * this.generalManager.slides.length);
			if (Math.abs(orderNumber) > this.generalManager.state.slideOrderNumberToOpacity) {
				slideManager.hide();
				return;
			}
			slideManager.show();
			slideManager.orderNumber = orderNumber; //eslint-disable-line

			const currentDelta = 0.5 / (this.generalManager.slides.length / 2);
			const neededDelta = 0.5 / (this.generalManager.state.slideOrderNumberToOpacity / 2);

			x *= neededDelta / currentDelta;

			const z = Math.abs(x) ** 1.8;

			let opacity = 1;
			if (
				Math.abs(orderNumber) >= Math.floor(this.generalManager.state.slideOrderNumberToOpacity / 2) &&
				Math.abs(orderNumber) < Math.floor(this.generalManager.state.slideOrderNumberToOpacity / 2) + 1
			) {
				opacity = 1 - (Math.abs(orderNumber) % Math.floor(this.generalManager.state.slideOrderNumberToOpacity / 2));
			}
			if (Math.abs(orderNumber) >= Math.floor(this.generalManager.state.slideOrderNumberToOpacity / 2) + 1) {
				opacity = 0;
			}

			const sin = Math.sin(x * 1.5 * Math.PI);
			const angle = 0.2 * Math.sign(sin) * Math.abs(sin) ** 1.3;

			slideManager.updatePos(
				x * this.generalManager.state.slideWidth * this.generalManager.state.slideOrderNumberToOpacity +
					this.getSlideGapByOrder(orderNumber, index),
				(z * this.generalManager.state.slideWidth * this.generalManager.state.slideOrderNumberToOpacity) / 1.75,
				angle,
				opacity
			);

			slideManager.updateWidthHeight(
				this.generalManager.state.slideWidth *
					spline(Math.abs(orderNumber), [
						{ x: 0, y: this.generalManager.state.scaleWidth0 },
						{ x: 1, y: this.generalManager.state.scaleWidth1 },
						{ x: 2, y: this.generalManager.state.scaleWidth2 },
						{ x: 3, y: this.generalManager.state.scaleWidth3 },
						{ x: 4, y: this.generalManager.state.scaleWidth4 },
					]),
				this.generalManager.state.slideHeight
			);
		});
	}

	getSlideGapByOrder(orderNumber) {
		let slideGap = -(this.generalManager.state.slideWidth / 4.5) * orderNumber;
		const gap = 20;
		slideGap +=
			gap *
			orderNumber *
			spline(Math.abs(orderNumber), [
				{ x: 0, y: this.generalManager.state.scaleGap0 },
				{ x: 1, y: this.generalManager.state.scaleGap1 },
				{ x: 2, y: this.generalManager.state.scaleGap2 },
				{ x: 3, y: this.generalManager.state.scaleGap3 },
				{ x: 4, y: this.generalManager.state.scaleGap4 },
			]);

		return slideGap;
	}

	tick() {
		this.updatePos(this.generalManager.state.sliderPositionEase);
		this.updateCurrentSlideIndex();
	}
}
