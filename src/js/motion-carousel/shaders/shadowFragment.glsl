uniform float uOpacity;

void main() {
	float opacity = 0.1 * uOpacity;
	gl_FragColor = vec4(0.0, 0.0, 0.0, opacity);
}