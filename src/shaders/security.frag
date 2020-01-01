#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler1;
uniform float timeFactor;



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



void main() {

	/*get the texture*/

	vec2 bend_texture = bend_text_coords(vec2(vTextureCoord.x,1.-vTextureCoord.y), 3.0); /*simulate lens*/

	vec4 output_color = texture2D(uSampler1, bend_texture);  

	gl_FragColor = output_color;

	

}

