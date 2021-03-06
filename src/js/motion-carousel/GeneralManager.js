import { throttle } from 'underscore';
import ThreeManager from './ThreeManager';
import SlidesManager from './SlidesManager';
import DragManager from './DragManager';
import LoadingManager from './LoadingManager';

export default class GeneralManager {
	constructor(props = {}) {
		this.DOM = {
			container: props.container,
		};

		this.slides = props.slides;

		this.settings = {
			breakpoints: [
				{
					minWidth: 0,
					slideWidth: 128 * 0.9,
					slideHeight: 270 * 0.9,
					slideOrderNumberToOpacity: 5,
					slideGap: 5,
					cameraPositionZ: 130,
					scaleGap0: 0,
					scaleGap1: 0.4,
					scaleGap2: 0.6,
					scaleGap3: 1.5,
					scaleGap4: 5,
					scaleWidth0: 1,
					scaleWidth1: 0.6,
					scaleWidth2: 0.8,
					scaleWidth3: 0.4,
					scaleWidth4: 1,
				},
				{
					minWidth: 325,
					slideWidth: 145 * 0.9,
					slideHeight: 300 * 0.9,
					slideOrderNumberToOpacity: 5,
					// cameraPositionZ: 180,
					scaleGap0: 0,
					scaleGap1: 0.4,
					scaleGap2: 0.6,
					scaleGap3: 1.5,
					scaleGap4: 5,
					scaleWidth0: 1,
					scaleWidth1: 0.6,
					scaleWidth2: 0.8,
					scaleWidth3: 0.4,
					scaleWidth4: 1,
				},
				{
					minWidth: 376,
					scaleGap0: 0.4,
					scaleGap1: 0.8,
					scaleGap2: 1,
					scaleGap3: 1.5,
					scaleGap4: 5,
					scaleWidth0: 1,
					scaleWidth1: 0.7,
					scaleWidth2: 0.8,
					scaleWidth3: 0.4,
					scaleWidth4: 1,
				},
				{
					minWidth: 600,
					slideWidth: 244 * 0.9,
					slideHeight: 512 * 0.9,
					slideOrderNumberToOpacity: 5,
					scaleGap0: 0,
					scaleGap1: 0.8,
					scaleGap2: 1,
					scaleGap3: 0.5,
					scaleGap4: 1,
					scaleWidth0: 1,
					scaleWidth1: 0.55,
					scaleWidth2: 0.7,
					scaleWidth3: 0.4,
					scaleWidth4: 1,
					cameraPositionZ: 270,
				},
				{
					minWidth: 769,
					slideWidth: 288 * 0.9,
					slideHeight: 564 * 0.9,
					slideOrderNumberToOpacity: 7,
					scaleGap0: 1.2,
					scaleGap1: 1.3,
					scaleGap2: 1.5,
					scaleGap3: 3.4,
					scaleGap4: 6.2,
					scaleWidth0: 1,
					scaleWidth1: 0.55,
					scaleWidth2: 0.7,
					scaleWidth3: 0.9,
					scaleWidth4: 1,
					cameraPositionZ: 250,
				},
			],
		};

		this.state = {
			isCreated: false,
			_width: null,
			_height: null,
			time: null,
			sliderPosition: null,
			sliderPositionEase: null,
			timelinePosition: null,
			slideWidth: 200,
			slideHeight: 350,
			slideOrderNumberToOpacity: 5,
			slideGap: 50,
			cameraPositionZ: 150,
			maxScaleToBig: 2,
			isBig: true,
		};

		this.eventCallbacks = {
			resize: [],
			create: [],
			destroy: [],
			tick: [],
			pointerdown: [],
			pointermove: [],
			pointerup: [],
			startDrag: [],
			stopDrag: [],
			slideClick: [],
			progress: [],
			load: [],
			slideOrderNumberToOpacity: [],
			keydown: [],
		};

		this.handlers = new Map([
			[
				window,
				{
					resize: this.resize.bind(this),

					keydown: this.keydown.bind(this),
				},
			],
			[
				this.DOM.container,
				{
					pointerdown: this.pointerdown.bind(this),
					pointermove: this.pointermove.bind(this),
					pointerup: this.pointerup.bind(this),
				},
			],
		]);

		this.managers = {
			three: new ThreeManager(this),
			slides: new SlidesManager(this),
			loading: new LoadingManager(this),
			drag: new DragManager(this),
		};

		this.create();
		window.create = this.create.bind(this);
		window.destroy = this.destroy.bind(this);
		window.toSlide = this.toSlide.bind(this);

		this.toPrevSlideThrottled = throttle(this.toPrevSlide.bind(this), 500, { trailing: false });
		this.toNextSlideThrottled = throttle(this.toNextSlide.bind(this), 500, { trailing: false });
	}

	create() {
		if (this.state.isCreated) {
			console.error('The animation is already created'); // eslint-disable-line
			return;
		}

		this.state.isCreated = true;
		this.state.sliderPosition = 0;
		this.state.sliderPositionEase = 0;
		this.state.time = 0;

		this.updateWidthHeight();
		this.checkBreakpoints();
		this.addDefaultListeners();

		this.eventCallbacks.create.forEach((callback) => callback());

		this.becomeBig(true);

		window.requestAnimationFrame(this.tick.bind(this));
	}

	destroy() {
		if (!this.state.isCreated) {
			console.error('The animation is already destroyed'); // eslint-disable-line
			return;
		}

		this.removeDefaultListeners();

		this.eventCallbacks.destroy.forEach((callback) => callback());

		this.state.isCreated = false;
	}

	addDefaultListeners() {
		this.handlers.forEach((handlers, element) =>
			Object.entries(handlers).forEach(([event, handler]) => {
				element.addEventListener(event, handler);
			})
		);
	}

	removeDefaultListeners() {
		this.handlers.forEach((handlers, element) =>
			Object.entries(handlers).forEach(([event, handler]) => {
				element.removeEventListener(event, handler);
			})
		);
	}

	becomeDefault(required) {
		if (!this.state.isBig && !required) return;

		this.slides.forEach(({ slideManager }) => slideManager.state.isBig && slideManager.becomeDefault());
		this.state.isBig = false;
	}

	becomeBig(required) {
		if ((!this.managers.drag.getIsMouseIntersect() || this.state.isBig) && !required) return;

		this.state.isBig = true;
		this.slides[this.currentSlideShadowIndex].slideManager.becomeBig();
	}

	addListener(event, callback) {
		if (!this.eventCallbacks[event] || this.eventCallbacks[event].includes(callback)) return;

		this.eventCallbacks[event].push(callback);
	}

	removeListener(event, callback) {
		this.eventCallbacks[event] = this.eventCallbacks[event].filter((oldCallback) => callback !== oldCallback);
	}

	get width() {
		return this.state._width;
	}

	get height() {
		return this.state._height;
	}

	get currentSlideIndex() {
		return Math.abs(this.slides[this.managers.slides.state.currentSlideIndex].originalIndex);
	}

	get currentSlideShadowIndex() {
		return this.managers.slides.state.currentSlideIndex;
	}

	updateWidthHeight() {
		this.state._width = this.DOM.container.clientWidth;
		this.state._height = this.DOM.container.clientHeight;
	}

	checkBreakpoints() {
		let { slideOrderNumberToOpacity } = this.state;

		this.settings.breakpoints.forEach((breakpoint) => {
			if (this.width >= breakpoint.minWidth) {
				if (breakpoint.slideWidth !== undefined) this.state.slideWidth = breakpoint.slideWidth;
				if (breakpoint.slideHeight !== undefined) this.state.slideHeight = breakpoint.slideHeight;
				if (breakpoint.slideOrderNumberToOpacity !== undefined) {
					slideOrderNumberToOpacity = breakpoint.slideOrderNumberToOpacity; //eslint-disable-line
				}

				if (breakpoint.scaleGap0 !== undefined) this.state.scaleGap0 = breakpoint.scaleGap0;
				if (breakpoint.scaleGap1 !== undefined) this.state.scaleGap1 = breakpoint.scaleGap1;
				if (breakpoint.scaleGap2 !== undefined) this.state.scaleGap2 = breakpoint.scaleGap2;
				if (breakpoint.scaleGap3 !== undefined) this.state.scaleGap3 = breakpoint.scaleGap3;
				if (breakpoint.scaleGap4 !== undefined) this.state.scaleGap4 = breakpoint.scaleGap4;
				if (breakpoint.scaleWidth0 !== undefined) this.state.scaleWidth0 = breakpoint.scaleWidth0;
				if (breakpoint.scaleWidth1 !== undefined) this.state.scaleWidth1 = breakpoint.scaleWidth1;
				if (breakpoint.scaleWidth2 !== undefined) this.state.scaleWidth2 = breakpoint.scaleWidth2;
				if (breakpoint.scaleWidth3 !== undefined) this.state.scaleWidth3 = breakpoint.scaleWidth3;
				if (breakpoint.scaleWidth4 !== undefined) this.state.scaleWidth4 = breakpoint.scaleWidth4;
				if (breakpoint.cameraPositionZ !== undefined) this.state.cameraPositionZ = breakpoint.cameraPositionZ;
				if (breakpoint.maxScaleToBig !== undefined) this.state.maxScaleToBig = breakpoint.maxScaleToBig;
			}
		});

		if (this.state.slideOrderNumberToOpacity !== slideOrderNumberToOpacity) {
			this.state.slideOrderNumberToOpacity = slideOrderNumberToOpacity;
			this.slideOrderNumberToOpacity(this.state.slideOrderNumberToOpacity);
		}
	}

	resize() {
		this.updateWidthHeight();
		this.checkBreakpoints();

		this.eventCallbacks.resize.forEach((callback) => callback(this.width, this.height));
	}

	pointerdown(event) {
		this.eventCallbacks.pointerdown.forEach((callback) => callback(event));
	}

	pointermove(event) {
		this.eventCallbacks.pointermove.forEach((callback) => callback(event));
	}

	pointerup(event) {
		this.eventCallbacks.pointerup.forEach((callback) => callback(event));
	}

	toSlideByIncrement(increment) {
		
		if (this.managers.slides.state.direction === 'right') {
			for (let i = 0; i < this.managers.slides.state.rights.length; i++) {
				if (this.managers.slides.state.rights[i].originalIndex === this.currentSlideIndex) {
					let index = i + increment;
					if (index >= this.managers.slides.state.rights.length) index = 0;
					else if (index < 0) index = this.managers.slides.state.rights.length - 1;
					this.toSlide(this.managers.slides.state.rights[index].originalIndex);
					break;
				}
			}
		}
		if (this.managers.slides.state.direction === 'left') {
			for (let i = 0; i < this.managers.slides.state.lefts.length; i++) {
				if (this.managers.slides.state.lefts[i].originalIndex === this.currentSlideIndex) {
					let index = i + increment;
					if (index >= this.managers.slides.state.rights.length) index = 0;
					else if (index < 0) index = this.managers.slides.state.rights.length - 1;
					this.toSlide(this.managers.slides.state.lefts[index].originalIndex);
					break;
				}
			}
		}
		if (this.managers.slides.state.direction === 'normal') {
			for (let i = 0; i < this.slides.length; i++) {
				if (this.slides[i].originalIndex === this.currentSlideIndex) {
					let index = i + increment;
					if (index >= this.managers.slides.state.rights.length) index = 0;
					else if (index < 0) index = this.managers.slides.state.rights.length - 1;
					this.toSlide(this.slides[index].originalIndex);
					break;
				}
			}
		}
	}



	toPrevSlide() {
		this.toSlideByIncrement(-1);
	}

	toNextSlide() {
		this.toSlideByIncrement(1);
	}

	keydown({ key }) {
		if (key === 'ArrowRight') this.toNextSlideThrottled();
		if (key === 'ArrowLeft') this.toPrevSlideThrottled();

		this.eventCallbacks.keydown.forEach((callback) => callback(key));
	}

	startDrag() {
		this.becomeDefault(true);

		this.eventCallbacks.startDrag.forEach((callback) => callback(this.currentSlideIndex));
	}

	stopDrag() {
		this.becomeBig(true);
		this.eventCallbacks.stopDrag.forEach((callback) => callback(this.currentSlideIndex));
	}

	slideClick(shadowIndex) {
		if (shadowIndex === this.currentSlideShadowIndex) return;

		this.managers.slides.toSlide(shadowIndex);

		this.eventCallbacks.slideClick.forEach((callback) =>
			callback(this.slides[shadowIndex].originalIndex, this.currentSlideIndex)
		);
	}

	toSlide(originalIndex, fast) {
		
		if (originalIndex >= this.slides.length || originalIndex < 0) {
			console.error(`The slide by index ${originalIndex} is not exists`); // eslint-disable-line
			return;
		}
		const index = this.slides.filter((slide) => slide.originalIndex === originalIndex)[0].shadowIndex;

		this.managers.slides.toSlide(index, fast);
	}

	progress(progress, slideInfo, key) {
		if (slideInfo.images[key].img && !slideInfo.images[key].isInited) {
			slideInfo.images[key].isInited = true; //eslint-disable-line
			slideInfo.slideManager.updateTexture(slideInfo.images[key].img, key);
		}

		this.eventCallbacks.progress.forEach((callback) => callback(progress));
	}

	slideOrderNumberToOpacity(slideOrderNumberToOpacity) {
		this.eventCallbacks.slideOrderNumberToOpacity.forEach((callback) => callback(slideOrderNumberToOpacity));
	}

	load() {
		this.eventCallbacks.load.forEach((callback) => callback());
	}

	tick() {
		if (!this.state.isCreated) return;

		this.state.time += 1;

		this.eventCallbacks.tick.forEach((callback) => callback(this.state.time));

		window.requestAnimationFrame(this.tick.bind(this));
	}
}
