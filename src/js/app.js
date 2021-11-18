import sayHello from './lib/sayHello';
import MotionCarousel from './motion-carousel';

sayHello();

const mc = new MotionCarousel({ container: document.getElementById('motion-carousel-container') });

mc.addListener('resize', () => console.log('resize')); // eslint-disable-line
mc.addListener('create', () => console.log('create')); // eslint-disable-line
mc.addListener('destroy', () => console.log('destroy')); // eslint-disable-line
mc.addListener('startDrag', () => console.log('startDrag')); // eslint-disable-line
mc.addListener('stopDrag', (i) => console.log('stopDrag', i)); // eslint-disable-line
mc.addListener('slideClick', (i) => console.log('slideClick', i)); // eslint-disable-line
mc.addListener('progress', (p) => console.log('progress', p)); // eslint-disable-line
mc.addListener('load', () => console.log('load')); // eslint-disable-line
