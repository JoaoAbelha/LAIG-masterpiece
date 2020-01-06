uniform float wave_map;



attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform sampler2D water_map;

uniform float timefactor1;
varying float VertexPosition;
varying vec2 VTextureCoord;


void main() {

    const float frequency = 0.5;

    vec2 tex_coords_shift = vec2(sin(timefactor1 * frequency)  + cos(timefactor1 * frequency) );

    vec2 calc_tex_coords = aTextureCoord + tex_coords_shift;

    vec4 color = texture2D(water_map, calc_tex_coords);

    float calc_height = color.b * 2. ; 

    if(calc_height > 2.5) {
        calc_height = 2.5;
    }

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition.x, calc_height, aVertexPosition.z, 1.0);

    VertexPosition = calc_height;
    VTextureCoord = aTextureCoord;
  
}
