// import * as THREE from 'three';
import ThreeManager from './ThreeManager';
import SlidesManager from './SlidesManager';
import DragManager from './DragManager';

export default class GeneralManager {
	constructor(props = {}) {
		this.DOM = {
			container: props.container,
		};

		this.state = {
			isCreated: false,
			_width: null,
			_height: null,
			time: 0,
		};

		this.eventCallbacks = {
			resize: [],
			create: [],
			destroy: [],
			tick: [],
			pointerdown: [],
			pointermove: [],
			pointerup: [],
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
			drag: new DragManager(this),
		};

		this.create();
		window.create = this.create.bind(this);
		window.destroy = this.destroy.bind(this);

		console.log(this);
	}

	create() {
		if (this.state.isCreated) {
			console.error('The animation is already created'); // eslint-disable-line
			return;
		}

		this.state.isCreated = true;

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
	// pointerdown(event) {
	// 	this.eventCallbacks.pointerdown.forEach((callback) => callback(event));
	// }

	tick() {
		if (!this.state.isCreated) return;

		this.state.time += 1;

		this.eventCallbacks.tick.forEach((callback) => callback(this.state.time));

		window.requestAnimationFrame(this.tick.bind(this));
	}
}
