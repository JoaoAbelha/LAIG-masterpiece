#ifdef GL_ES
precision highp float;
#endif



uniform sampler2D distortion;
uniform sampler2D background;
uniform float timefactor1;

varying vec2 vTextureCoord;


void main() {

    vec2 u_resolution=  gl_FragCoord.xy /  vTextureCoord.xy;

    vec2 n = texture2D(distortion, vTextureCoord * .1).rg;

    gl_FragColor = texture2D(background, vTextureCoord, 1.5);

 for (float r = 4.; r > 0.; r--) {

        vec2 x = u_resolution.xy * r * .015;
        vec2 p = 6.28 * vTextureCoord * x + (n - .5) * 2.;
        vec2 s = sin(p);
        vec4 d = texture2D(distortion, floor(vTextureCoord * x - 0.25 + 0.5) / x);
        float t = (s.x + s.y) * max(0.,1.-fract(timefactor1 * 5. * (d.b+.1)+d.g) * 2.);

        if (d.r < (5.-r) * .08 && t > .5) {
            vec3 v = normalize(-vec3(cos(p), mix(.2, 2., t-.5)));
            gl_FragColor = texture2D(background, vTextureCoord);
            gl_FragColor = texture2D(background, vTextureCoord - v.xy);
            gl_FragColor = texture2D(background, vTextureCoord + v.xy);
            gl_FragColor = texture2D(background, vTextureCoord - v.xy * .3);
            gl_FragColor = texture2D(background, vTextureCoord + v.xy * .3);
        }
    }
	
}