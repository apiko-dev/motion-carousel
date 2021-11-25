varying vec2 vUv;
uniform float uOpacity;

void main() {
	float opacity = 0.1 * uOpacity * (0.7 - vUv.y);
	gl_FragColor = vec4(0.0, 0.0, 0.0, opacity);
}