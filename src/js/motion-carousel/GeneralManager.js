import ThreeManager from './ThreeManager';
import SlidesManager from './SlidesManager';
import DragManager from './DragManager';
import LoadingManager from './LoadingManager';

export default class GeneralManager {
	constructor(props = {}) {
		this.DOM = {
			container: props.container,
		};

		this.slides = [
			{
				images: {
					bg: { src: 'img/0.jpg', img: null },
				},
				originalIndex: null,
				shadowIndex: null,
				slideManager: null,
			},
			{
				images: {
					bg: { src: 'img/1.jpg', img: null },
				},
				originalIndex: null,
				shadowIndex: null,
				slideManager: null,
			},
			{
				images: {
					bg: { src: 'img/2.jpg', img: null },
				},
				originalIndex: null,
				shadowIndex: null,
				slideManager: null,
			},
			{
				images: {
					bg: { src: 'img/3.jpg', img: null },
				},
				originalIndex: null,
				shadowIndex: null,
				slideManager: null,
			},
			{
				images: {
					bg: { src: 'img/4.jpg', img: null },
				},
				originalIndex: null,
				shadowIndex: null,
				slideManager: null,
			},
			{
				images: {
					bg: { src: 'img/5.jpg', img: null },
				},
				originalIndex: null,
				shadowIndex: null,
				slideManager: null,
			},
			{
				images: {
					bg: { src: 'img/6.jpg', img: null },
				},
				originalIndex: null,
				shadowIndex: null,
				slideManager: null,
			},
			{
				images: {
					bg: { src: 'img/7.jpg', img: null },
				},
				originalIndex: null,
				shadowIndex: null,
				slideManager: null,
			},
		];

		this.state = {
			isCreated: false,
			_width: null,
			_height: null,
			time: null,
			sliderPosition: null,
			sliderPositionEase: null,
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
		};

		this.handlers = new Map([
			[
				window,
				{
					resize: this.resize.bind(this),
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
		this.addDefaultListeners();

		this.eventCallbacks.create.forEach((callback) => callback());

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

	addListener(event, callback) {
		if (!this.eventCallbacks[event] || this.eventCallbacks[event].includes(callback)) return;

		this.eventCallbacks[event].push(callback);
	}

	removeListener(event, callback) {
		this.eventCallbacks[event] = this.eventCallbacks[event].filter((oldCallback) => callback !== oldCallback);
	}

	// removeAllListeners() {
	// 	Object.entries(this.eventCallbacks).forEach(([event, callbacks]) =>
	// 		callbacks.forEach((callback) => this.removeListener(event, callback))
	// 	);
	// }

	get width() {
		return this.state._width;
	}

	get height() {
		return this.state._height;
	}

	get currentSlideIndex() {
		return this.managers.slides.state.currentSlideIndex;
	}

	updateWidthHeight() {
		this.state._width = this.DOM.container.clientWidth;
		this.state._height = this.DOM.container.clientHeight;
	}

	resize() {
		this.updateWidthHeight();

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

	startDrag() {
		this.eventCallbacks.startDrag.forEach((callback) => callback());
	}

	stopDrag() {
		this.eventCallbacks.stopDrag.forEach((callback) => callback(this.currentSlideIndex));
	}

	slideClick(shadowIndex) {
		this.managers.slides.toSlide(shadowIndex);

		this.eventCallbacks.slideClick.forEach((callback) => callback(this.slides[shadowIndex].originalIndex));
	}

	toSlide(originalIndex, fast) {
		if (originalIndex >= this.slides.length || originalIndex < 0) {
			console.error(`The slide by index ${originalIndex} is not exists`); // eslint-disable-line
			return;
		}
		const index = this.slides.filter((slide) => slide.originalIndex === originalIndex)[0].shadowIndex;

		this.managers.slides.toSlide(index, fast);
	}

	progress(progress, slideInfo) {
		if (slideInfo.images.bg.img) slideInfo.slideManager.updateTexture(slideInfo.images.bg.img);

		this.eventCallbacks.progress.forEach((callback) => callback(progress));
	}

	load() {
		this.eventCallbacks.load.forEach((callback) => callback());
	}

	tick() {
		if (!this.state.isCreated) return;

		this.state.time += 1;

		this.state.sliderPositionEase += 0.05 * (this.state.sliderPosition - this.state.sliderPositionEase);

		this.eventCallbacks.tick.forEach((callback) => callback(this.state.time));

		window.requestAnimationFrame(this.tick.bind(this));
	}
}
