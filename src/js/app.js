import Stats from 'stats-js';
import sayHello from './lib/sayHello';
import MotionCarousel from './motion-carousel';
import slides from './motion-carousel/slides';

sayHello();

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
function animate() {
	stats.begin();
	stats.end();
	requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

const mc = new MotionCarousel({ container: document.getElementById('motion-carousel-container'), slides });

mc.addListener('resize', () => console.log('resize')); // eslint-disable-line
mc.addListener('create', () => console.log('create')); // eslint-disable-line
mc.addListener('destroy', () => console.log('destroy')); // eslint-disable-line
mc.addListener('startDrag', (i) => console.log('startDrag', i)); // eslint-disable-line
mc.addListener('stopDrag', (i) => console.log('stopDrag', i)); // eslint-disable-line
mc.addListener('slideClick', (i, prev) => console.log('slideClick', i, prev)); // eslint-disable-line
mc.addListener('progress', (p) => console.log('progress', p)); // eslint-disable-line
mc.addListener('load', () => console.log('load')); // eslint-disable-line
