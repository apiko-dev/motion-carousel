import sayHello from './lib/sayHello';
import MotionCarousel from './motion-carousel';

sayHello();

new MotionCarousel({ container: document.getElementById('motion-carousel-container') }); // eslint-disable-line
