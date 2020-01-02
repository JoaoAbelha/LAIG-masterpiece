#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
varying float VertexPosition;

uniform sampler2D sky_map;

uniform float timefactor1;

void main() {
    vec2 tex_coords_shift = vec2(timefactor1, timefactor1);

    vec2 calc_tex_coords = aTextureCoord + tex_coords_shift;

    vec4 color = texture2D(sky_map, calc_tex_coords);

    float calc_height = color.b * 5. ;

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition.x, calc_height, aVertexPosition.z, 1.0);

    VertexPosition = calc_height/5.;

}
