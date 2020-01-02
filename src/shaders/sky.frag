#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying float VertexPosition;


uniform sampler2D color_map; /*cor relativa a altura*/

void main() {

    /*altura esta a variar entre 1 e 4*/

    vec4 color = texture2D(color_map, vec2(1. -VertexPosition, 0));

    gl_FragColor =  color ;
	
}