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

uniform sampler2D sand_map;


float gradient_radius(vec2 uv, float size)
{
 	uv -= 0.5; /*so that origns becomes (0,0)*/

    uv *= size;  // increase the size increase the radius range of the effect

	float amount = sqrt(pow(abs(uv.x), 2.) + pow(abs(uv.y), 2.));

	/*we want lower in the sides*/
    amount = 1.0 - amount ;

	// uv += 0.5;
   	return amount;
}


void main() {

    vec4 color = texture2D(sand_map, aTextureCoord);

    float height_gradient = gradient_radius(aTextureCoord,4.);

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition.x, color.b * 2.  + height_gradient,   aVertexPosition.z, 1.0);

    vTextureCoord = aTextureCoord;


  
}
