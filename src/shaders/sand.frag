#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;


uniform sampler2D color; 

void main() {


    vec4 color = texture2D(color,vTextureCoord);

    gl_FragColor =  color;
	
}