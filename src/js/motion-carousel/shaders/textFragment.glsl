varying vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uScreenSize;
uniform vec2 uBGSize;
uniform float uOpacity;

void main() {
	vec2 s = uScreenSize;
	vec2 i = uBGSize;
	float rs = s.x / s.y;
	float ri = i.x / i.y;
	vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
	vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
	vec2 uv = vUv * s / new + offset;
	vec4 clr = texture2D(uImage, uv);
	clr.a = clr.a * uOpacity;

	
	gl_FragColor = clr;
}

// vec4 color = texture2D(uSampler0, vTextureCoord);
// 	float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
// 	gl_FragColor = vec4(vec3(gray), 1.0);