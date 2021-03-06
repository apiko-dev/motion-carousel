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

	loadByIndex(originalIndex = 0) {
		if (originalIndex === this.generalManager.slides.length) return;
		const index = this.generalManager.slides.filter((slide) => slide.originalIndex === originalIndex)[0].shadowIndex;
		const slideInfo = this.generalManager.slides[index];
		if (!slideInfo) return;

		Object.entries(slideInfo.images).forEach(([type, { src }], i, arr) => {
			const img = new Image();
			img.onload = this.loadSuccess.bind(this, index, type, img, i === arr.length - 1);
			img.onerror = this.loadError.bind(this, index, i === arr.length - 1);
			img.src = src;
		});
	}

	loadSuccess(index, key, img, isLast) {
		this.loadedNumber += 1;
		this.generalManager.slides[index].images[key].img = img; //eslint-disable-line
		this.progress = this.loadedNumber / this.imgNumber;

		this.generalManager.progress(this.progress, this.generalManager.slides[index], key);
		if (this.progress === 1) this.generalManager.load();
		if (isLast) this.loadByIndex(this.generalManager.slides[index].originalIndex + 1);
	}

	loadError(index, isLast) {
		this.loadedNumber += 1;
		this.progress = this.loadedNumber / this.imgNumber;

		this.generalManager.progress(this.progress, this.generalManager.slides[index]);
		if (this.progress === 1) this.generalManager.load();

		if (isLast) this.loadByIndex(this.generalManager.slides[index].originalIndex + 1);
	}
}
