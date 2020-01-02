/**
 * water
 * @constructor
 */
class windowObject extends CGFobject {
	constructor(scene, distortion, size, background) {
        super(scene);
        this.scene = scene;
		this.shader = new CGFshader(this.scene.gl, "shaders/window.vert", "shaders/window.frag");
		
        this.distortion = this.scene.textures[distortion];
        this.background = this.scene.textures[background];
		
        this.shader.setUniformsValues({distortion: 0, background :1 , timefactor1: 0});


        this.plane = new MyPlane(scene, size * 2, size * 2);
        this.size = size;
	}
	
	display() {
        this.scene.setActiveShader(this.shader);
        this.scene.activeShader.setUniformsValues({timefactor1: (this.scene.time / 30000 % 100) });
        this.distortion.bind(0);
        this.background.bind(1);
        this.scene.pushMatrix();
        this.scene.scale(this.size ,1, this.size);
        this.plane.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
	}
};
