/**
 * sky
 * @constructor
 */
class sky extends CGFobject {
	constructor(scene, heightMap, colorMap, size) {
        super(scene);
        this.scene = scene;
		this.shader = new CGFshader(this.scene.gl, "shaders/sky.vert", "shaders/sky.frag");
		
		this.wave_map = this.scene.textures[heightMap];
		
		this.color_map = this.scene.textures[colorMap];

        this.shader.setUniformsValues({wave_map: 0, color_map: 1, timefactor1: 0});
        

        this.plane = new MyPlane(scene, size * 2, size * 2);
        this.size = size;
	}
	
	display() {
        this.scene.setActiveShader(this.shader);
        this.scene.activeShader.setUniformsValues({timefactor1: (this.scene.time / 30000 % 100) *  3});
        this.wave_map.bind(0);
        this.color_map.bind(1);
        this.scene.pushMatrix();
        this.scene.scale(this.size ,1, this.size);
        this.scene.rotate(Math.PI,  1, 0 ,0);
        this.plane.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
	}
};
