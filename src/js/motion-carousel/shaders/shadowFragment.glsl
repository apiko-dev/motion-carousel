varying vec2 vUv;
uniform float uOpacity;
uniform sampler2D uImage;
uniform vec2 uScreenSize;
uniform vec2 uBGSize;

void main() {
	vec2 s = uScreenSize; // Screen
	vec2 i = uBGSize; // Image
	float rs = s.x / s.y;
	float ri = i.x / i.y;
	vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
	vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
	vec2 uv = vUv * s / new + offset;
	vec4 clr = texture2D(uImage, vUv);
	// float opacity = 0.9 * uOpacity * (0.7 - vUv.y);
	clr.a *= uOpacity;
	gl_FragColor = clr;

	
	// gl_FragColor = vec4(0.0, 0.0, 0.0, opacity);t
}