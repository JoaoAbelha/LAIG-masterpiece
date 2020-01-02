#ifdef GL_ES
precision highp float;
#endif

varying float VertexPosition;
uniform sampler2D color;
varying vec2 VTextureCoord;





void main() {

    vec4 color_filter = texture2D(color, VTextureCoord);
    vec4 color_height = vec4(0.);

    if(VertexPosition < 0.3) {
        discard; // water is transparent
    }
    else if (VertexPosition <= 0.5) {
       color_height= vec4(0.22,0.417,0.359,0.9) ;
    }
    else if (VertexPosition <= 1.) {
        color_height= vec4(0.13,0.356,0.447,0.8);
    }
     else if (VertexPosition <= 1.5) {
        color_height= vec4(0.18, 0.34, 0.4, 0.7);
    }
    else if (VertexPosition <= 2.) {
        color_height= vec4(0.,0.412,0.58,0.7);
    }
    else if (VertexPosition <= 2.35) {
        color_height= vec4(0.34,0.82,1.,0.7);
    }
    else if (VertexPosition <= 2.5) {
        color_height= vec4(1.,1.,1.,1.);
    }

    /*change this factor and see what happens :D*/
    float factor = 0.9;

    gl_FragColor = color_filter * factor + color_height * (1. - factor);
   
    
 
}