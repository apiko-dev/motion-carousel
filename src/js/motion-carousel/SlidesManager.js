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
			slideOrderNumberToOpacity: this.slideOrderNumberToOpacity.bind(this),
		};

		this.generalManager.addListener('create', this.handlers.create);
		this.generalManager.addListener('tick', this.handlers.tick);
		this.generalManager.addListener('slideOrderNumberToOpacity', this.handlers.slideOrderNumberToOpacity);

		this.state = {
			normalPosition: 0,
			oneSlideLength: null,
			currentSlideIndex: 0,
			rights: [],
			lefts: [],
			originalSlides: this.generalManager.slides,
		};

		this.sortingSlides();

		this.generalManager.slides = this.state.normal;
		this.generalManager.slides.forEach((slide, index) => {
			slide.slideManager = new Slide(this.generalManager, index, slide.originalIndex); //eslint-disable-line
			slide.shadowIndex = index; //eslint-disable-line
		});

		this.setLeftsRightsIndex();
	}

	slideOrderNumberToOpacity() {
		this.sortingSlides();
		this.setLeftsRightsIndex();
	}

	sortingSlides() {
		const arrays = this.state.originalSlides.reduce(
			({ normal, right, left }, slide, index) => {
				slide.originalIndex = index; //eslint-disable-line
				if (index % 2 === 0 && index !== 0) {
					normal[1].push(slide);
				} else {
					normal[0].push(slide);
				}
				if (index % 2 === 0 && index !== 0 && index < this.generalManager.state.slideOrderNumberToOpacity) {
					right[1].push(slide);
				} else {
					right[0].push(slide);
				}
				if ((index % 2 === 0 && index !== 0) || index >= this.generalManager.state.slideOrderNumberToOpacity) {
					left[1].push(slide);
				} else {
					left[0].push(slide);
				}
				return { normal, right, left };
			},
			{ normal: [[], []], right: [[], []], left: [[], []] }
		);
		this.state.normal = [...arrays.normal[0], ...arrays.normal[1].reverse()];
		this.state.rights = [...arrays.right[0], ...arrays.right[1].reverse()];
		this.state.lefts = [...arrays.left[0], ...arrays.left[1].reverse()];
	}

	setLeftsRightsIndex() {
		this.state.rights.forEach((slide, index) => {
			slide.slideManager.shadowIndexRight = index; //eslint-disable-line
		});
		this.state.lefts.forEach((slide, index) => {
			slide.slideManager.shadowIndexLeft = index; //eslint-disable-line
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
		if (this.state.direction === 'normal') {
			this.state.currentSlideIndex = Math.abs(this.state.currentSlideIndex);
		}
		if (this.state.direction === 'right') {
			this.state.currentSlideIndex = this.state.rights[this.state.currentSlideIndex].shadowIndex;
		}
		if (this.state.direction === 'left') {
			this.state.currentSlideIndex = this.state.lefts[this.state.currentSlideIndex].shadowIndex;
		}
	}

	toSlide(toSlideIndex, fast) {
		if (this.generalManager.state.timelinePosition) this.generalManager.state.timelinePosition.pause();
		const x =
			this.generalManager.state.sliderPositionEase -
			(this.generalManager.slides[toSlideIndex].slideManager.state.bg.mesh.position.x -
				this.getSlideGapByOrder(this.generalManager.slides[toSlideIndex].slideManager.orderNumber)) /
				this.generalManager.state.slideWidth /
				this.generalManager.slides.length;

		const duration = 0.5;

		this.generalManager.becomeDefault();

		this.generalManager.state.timelinePosition = gsap
			.timeline()
			.to(this.generalManager.state, { sliderPositionEase: x, duration, ease: Power3.easeInOut }, 0)
			.to(
				this.generalManager.state,
				{ 
					duration: duration * 0.7, 
					onComplete: ()=>{
						// this.generalManager.becomeBig.bind(this.generalManager) 
						this.generalManager.becomeBig(true)
					}
				},
				0
			);

		if (fast) this.generalManager.state.sliderPositionEase = this.generalManager.state.sliderPosition;
	}

	updatePos(sliderPosition = 0) {
		this.state.normalPosition = sliderPosition;
		if (Math.abs(this.state.normalPosition) >= 1) this.state.normalPosition %= 1;

		this.generalManager.slides.forEach(({ slideManager }) => {
			if (!slideManager) return;

			let index = slideManager.id;
			this.state.direction = 'normal';

			if (this.state.normalPosition < 0) {
				index = slideManager.shadowIndexRight;
				this.state.direction = 'right';
			}

			if (this.state.normalPosition > 0) {
				index = slideManager.shadowIndexLeft;
				this.state.direction = 'left';
			}

			let x;
			x = this.state.oneSlideLength * index + this.state.normalPosition;
			if (x > 0.5) x -= 1;
			if (x > 0.5) x -= 1;
			if (x < -0.5) x += 1;
			if (x < -0.5) x += 1;

			const orderNumber = Number(x * this.generalManager.slides.length);
			if (Math.abs(orderNumber) > this.generalManager.state.slideOrderNumberToOpacity / 1.75) {
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
			let greyScale = 0;
			if (Math.abs(orderNumber) >= 0 && Math.abs(orderNumber) <= 1) {
				greyScale = Math.abs(orderNumber);
			}
			if (Math.abs(orderNumber) > 1) {
				greyScale = 1;
			}
			const sin = Math.sin(x * 1.1 * Math.PI);
			const angle = 0.19 * Math.sign(sin) * Math.abs(sin) ** 1.3;

			slideManager.updatePos(
				x * this.generalManager.state.slideWidth * this.generalManager.state.slideOrderNumberToOpacity +
					this.getSlideGapByOrder(orderNumber, index),
				(z * this.generalManager.state.slideWidth * this.generalManager.state.slideOrderNumberToOpacity) / 1.7,
				angle,
				opacity,
				greyScale
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
