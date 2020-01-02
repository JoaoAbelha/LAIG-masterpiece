/**
 * CubeMap
 * @constructor
 * 
 *  receives a path of a file with 6 images
 * 
 */
class cubeMap extends  CGFobject  {
	constructor(scene, size, filePath) {
		super(scene);
		this.size = size;
		this.plane = new MyPlane(this.scene,1 ,1);
		this.scene = scene;

		this.materials = [];

		for(let  i = 1 ;  i <= 6 ; i++) {
			let material = new CGFappearance(this.scene);
			material.setAmbient(0.3, 0.3, 0.3, 1);
			material.setDiffuse(0.5, 0.5, 0.5, 1);
			material.setSpecular(0.3, 0.3, 0.3, 1);
			material.setEmission(0, 0, 0, 1);
			material.setShininess(10);
			material.setTexture(new CGFtexture(this.scene, "scenes/images/background1.jpg"));
			this.materials.push(material);
		}

		
	};	

	display() {
		//1
		this.scene.pushMatrix();
			this.scene.translate(0.0, -this.size/2, 0.0);
			this.scene.scale(this.size,1, this.size);
			this.materials[0].apply();
			
			this.plane.display();
		this.scene.popMatrix();
		//2
		this.scene.pushMatrix();
			this.scene.translate(0.0, +this.size/2, 0.0);
			this.scene.rotate(Math.PI, 1.0, 0.0, 0.0);
			this.scene.scale(this.size,1, this.size);
			this.plane.display();
		this.scene.popMatrix();
		//3
		this.scene.pushMatrix();
			this.scene.translate(0.0, 0.0, -this.size/2);
			this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
			this.scene.scale(this.size,1, this.size);
			this.plane.display();
		this.scene.popMatrix();
		//4
		this.scene.pushMatrix();
			this.scene.rotate(Math.PI, 0.0, 1.0, 0.0);
			this.scene.translate(0.0, 0.0, -this.size/2);
			this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
			this.scene.scale(this.size,1, this.size);
			this.plane.display();
		this.scene.popMatrix();
		//5
		this.scene.pushMatrix();
			this.scene.rotate(Math.PI/2, 0.0, 1.0, 0.0);
			this.scene.translate(0.0, 0.0, -this.size/2);
			this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
			this.scene.scale(this.size,1, this.size);
			this.plane.display();
		this.scene.popMatrix();
		//6
		this.scene.pushMatrix();
			this.scene.rotate(-Math.PI/2, 0.0, 1.0, 0.0);
			this.scene.translate(0.0, 0.0, -this.size/2);
			this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
			this.scene.scale(this.size,1, this.size);
			this.plane.display();
		this.scene.popMatrix();
	}
};