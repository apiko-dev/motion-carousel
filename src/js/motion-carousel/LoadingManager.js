export default class LoadingManager {
	constructor(generalManager) {
		this.generalManager = generalManager;

		this.generalManager.addListener('create', this.load.bind(this));

		this.imgNumber = this.generalManager.slides.reduce((sum, slide) => {
			return sum + Object.keys(slide.images).length;
		}, 0);
	}

	load() {
		this.loadedNumber = 0;
		this.progress = 0;

		this.loadByIndex();
	}

	loadByIndex(index = 0) {
		const slideInfo = this.generalManager.slides[index];
		if (!slideInfo) return;

		Object.entries(slideInfo.images).forEach(([type, { src }]) => {
			const img = new Image();
			img.onload = this.loadSuccess.bind(this, index, type);
			img.onerror = this.loadError.bind(this, index);
			img.src = src;
		});
	}

	loadSuccess(index, key, { path }) {
		this.loadedNumber += 1;
		this.generalManager.slides[index].images[key].img = path[0]; //eslint-disable-line
		this.progress = this.loadedNumber / this.imgNumber;

		this.generalManager.progress(this.progress, this.generalManager.slides[index]);
		if (this.progress === 1) this.generalManager.load();

		this.loadByIndex(index + 1);
	}

	loadError(index) {
		this.loadedNumber += 1;
		this.progress = this.loadedNumber / this.imgNumber;

		this.generalManager.progress(this.progress, this.generalManager.slides[index]);
		if (this.progress === 1) this.generalManager.load();

		this.loadByIndex(index + 1);
	}
}
