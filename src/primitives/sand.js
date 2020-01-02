/**
 * sand
 * @constructor
 */
class sand extends CGFobject {
	constructor(scene, heightMap, size, color) {
        super(scene);
        this.scene = scene;
		this.shader = new CGFshader(this.scene.gl, "shaders/sand.vert", "shaders/sand.frag");
		
        this.sand_map = this.scene.textures[heightMap];
        this.color = this.scene.textures[color];
		
        this.shader.setUniformsValues({sand_map: 0, color :1});

        this.plane = new MyPlane(scene, size * 2, size * 2);
        this.size = size;
	}
	
	display() {
        this.scene.setActiveShader(this.shader);
        this.sand_map.bind(0);
        this.color.bind(1);
        this.scene.pushMatrix();
        this.scene.scale(this.size ,1, this.size);
        this.plane.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
	}
};
