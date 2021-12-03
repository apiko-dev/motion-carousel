varying vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uScreenSize;
uniform vec2 uBGSize;
uniform float uOpacity;
uniform float uGrayScale;

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

	vec4 gray = vec4(vec3(dot(clr.rgb, vec3(0.1, 0.1, 0.2))), clr.a);
	// gl_FragColor = mix(clr, gray, uGrayScale);
	gray.r *= 0.8;
	gray.g *= 0.85;
	// gray.b *= 0.9;
	// gl_FragColor = gray;
	gl_FragColor = mix(clr, gray, uGrayScale);

	gl_FragColor.rgb *= min(vUv.y * 1.5, 1.0);
	// gl_FragColor = vec4(clr.r * 0.5, clr.g * 0.5, clr.b * 0.5, clr.a);
	// if(gl_FragColor.a<0.5) discard;
	/////
	// float samples = 1.0;
	// // vec2 direction = vec2(0.0, 1.0);
	// vec2 direction = vec2(0.866/(vUv.x / vUv.y), 0.5);
	// float bokeh = 0.2;
	
	// vec4 sum = vec4(0.0); //результирующий цвет
	// vec4 msum = vec4(0.0); //максимальное значение цвета выборок
	
	// float delta = 1.0/samples; //порция цвета в одной выборке
	// float di = 1.0/(samples-1.0); //вычисляем инкремент
	// float i=-0.2;
	// // for (float i=-0.5; i<0.501; i+=di) {
	// 	vec4 color = texture2D(uImage, vUv + direction * i); //делаем выборку в заданном направлении
	// 	sum += color * delta; //суммируем цвет
	// 	msum = max(color, msum); //вычисляем максимальное значение цвета
	// // }

	// gl_FragColor = vec4(vec3(mix(sum.rgb, msum.rgb, bokeh)), color.a);
}

// uniform sampler2D texture; //размываемая текстура
// uniform vec2 direction; //направление размытия, всего их три: (0, 1), (0.866/aspect, 0.5), (0.866/aspect, -0.5), все три направления необходимо умножить на желаемый радиус размытия
// uniform float samples; //количество выборок, float - потому что операции над этим параметром вещественные
// uniform float bokeh; //сила эффекта боке [0..1]

// varying vec2 vTexCoord; //входные текстурные координаты фрагмента

// void main() {
// 	vec4 sum = vec4(0.0); //результирующий цвет
// 	vec4 msum = vec4(0.0); //максимальное значение цвета выборок

// 	float delta = 1.0/samples; //порция цвета в одной выборке
// 	float di = 1.0/(samples-1.0); //вычисляем инкремент
// 	for (float i=-0.5; i<0.501; i+=di) {
// 		vec4 color = texture2D(texture, vTexCoord + direction * i); //делаем выборку в заданном направлении
// 		sum += color * delta; //суммируем цвет
// 		msum = max(color, msum); //вычисляем максимальное значение цвета
// 	}

// 	gl_FragColor = mix(sum, msum, bokeh); //смешиваем результирующий цвет с максимальным в заданной пропорции
// }