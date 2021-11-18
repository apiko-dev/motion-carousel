varying vec2 vUv;
uniform sampler2D uImage;

void main() {
		vec4 texture = texture2D(uImage, vUv);
		gl_FragColor = vec4(vUv, 0.0, 1.0);
		gl_FragColor = texture;
}