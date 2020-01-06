#ifdef GL_ES
precision highp float;
#endif



uniform sampler2D distortion;
uniform sampler2D background;
uniform float timefactor1;
uniform float resolutionWidth;
uniform float resolutionHeight;

varying vec2 vTextureCoord;


void main() {

    vec2 u_resolution=  vec2(resolutionWidth,resolutionHeight);

    vec2 n = texture2D(distortion, vTextureCoord * 0.1).rg;

    /*normal texture*/
    gl_FragColor = texture2D(background, vTextureCoord, 1.5);

    /*apply distortion using a distortion map*/
    for (float r = 4.0; r > 0.0; r--) {

        vec2 x = u_resolution.xy * r * .015;
        vec2 p = 6.28 * vTextureCoord * x + (n - .5) * 2.;
        vec2 s = sin(p);
        vec4 d = texture2D(distortion, floor(vTextureCoord * x - 0.25 + 0.5) / x);
        float t = (s.x + s.y) * max(0.,1.-fract(timefactor1 * 5.0 * (d.b+.1)+d.g) * 2.0);

        if (d.r < (5.0-r) * .08 && t > 0.5) {
            vec3 v = normalize(-vec3(cos(p), mix(0.2, 2.0, t-0.5)));
            gl_FragColor = texture2D(background, vTextureCoord);
            gl_FragColor = texture2D(background, vTextureCoord - v.xy);
            gl_FragColor = texture2D(background, vTextureCoord + v.xy);
            gl_FragColor = texture2D(background, vTextureCoord - v.xy * .3);
            gl_FragColor = texture2D(background, vTextureCoord + v.xy * .3);
        }
    }

    /*create window effect*/
    if (mod(vTextureCoord.x * 50., 10.) < 1.0 ) {
        gl_FragColor = vec4(0.8,0.8,0.8,1.0);
    }


    if (mod(vTextureCoord.y * 50., 10.) < 1.0 ) {
        gl_FragColor = vec4(0.8,0.8,0.8,1.0);
    }



	
}