#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform float timeFactor;


/*
	Some notes:

    smoothstep(): performs smooth Hermite interpolation between 0 and 1 
	when edge0 < x < edge1. This is useful in cases where a threshold function 
	with a smooth transition is desired.

	mix(): performs a linear interpolation between x and y using a to weight between 
	them. The return value is computed as x×(1−a)+y×a.

*/

/*
	create a rounded effect in the image simulating the lens
*/
vec2 bend_text_coords(vec2 uv, float bend) {

	/*coords space between - 1 and 1 to manipulate the coords easily*/
	uv -= 0.5;
    uv *= 2.0;

	/*create a little bend*/
    uv.x *= 1. + pow(abs(uv.y)/bend, 2.);
    uv.y *= 1. + pow(abs(uv.x)/bend, 2.);
    
	/* return to the normal coords domain*/
    uv = uv /2.0 + 0.5;
    return uv;
}


float gradient_radius(vec2 uv, float size, float smooth_scale, float edge_curvature)
{
 	uv -= 0.5; /*so that origns becomes (0,0)*/

    uv *= size;  // increase the size increase the radius range of the effect

	/*
	distance to the origin : 
	smaller number creates more of a circular frame and bigger number creates a curvature in the edge of the frame
	formula of distance that instead of 2 it has edge_curvature
	perfect circular gradient - edge_curvature = 2
	*/

	float amount = sqrt(pow(abs(uv.x), edge_curvature) + pow(abs(uv.y), edge_curvature));

	/*we want darker in the sides and not in the origin*/
    amount = 1.0 - amount ;

	// uv += 0.5;
   	return smoothstep(0.0, smooth_scale, amount);
}

float create_scanline(vec2 uv, float vel, float line) {
	return sin(uv.y * line +  timeFactor * vel);
}

/* funcao random e noise retiradas do livro book of shaders*/
float random(vec2 uv)
{
 	return fract(sin(dot(uv, vec2(15.5151, 42.2561))) * 12341.14122 * sin(timeFactor * 0.03));   
}

float noise(vec2 uv)
{
 	vec2 i = floor(uv);
    vec2 f = fract(uv);
    
    float a = random(i);
    float b = random(i + vec2(1.,0.));
	float c = random(i + vec2(0., 1.));
    float d = random(i + vec2(1.));
    
    vec2 u = smoothstep(0., 1., f);
    
    return mix(a,b, u.x) + (c - a) * u.y * (1. - u.x) + (d - b) * u.x * u.y; 
                     
}


void main() {

	/*get the texture*/
	vec4 color = texture2D(uSampler1, vTextureCoord);

	vec2 bend_texture = bend_text_coords(vTextureCoord, 3.0); /*simulate lens*/

	vec4 gradient = vec4( vec3(gradient_radius(vTextureCoord, 1.95 , .8, 7.)), 1.0); /*create radial gradient*/

	float scl1 = 1. - create_scanline(vTextureCoord, -15.,200.);  /*scan line one*/
	float scl2 = 1. - create_scanline(vTextureCoord, -3.,40.);   /*scan line two*/


	vec4 output_color = texture2D(uSampler1, bend_texture);  

	vec4 mix_linesNColors = mix ((output_color), vec4(scl1 + scl2), 0.05) * gradient;


	/*put a second texture*/
	vec4 camara =  texture2D(uSampler2, vec2(vTextureCoord.s, 1.0-vTextureCoord.t));
	if (camara.r > 0.75 ) {
		gl_FragColor = camara;
	}
	else  {
		gl_FragColor  = mix(mix_linesNColors, vec4(noise(vTextureCoord * 75.)), 0.1) ;

	}

}

