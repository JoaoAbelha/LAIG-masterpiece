/**
 * Cube
 * @constructor
 */
class Cube extends  CGFobject  {
	constructor(scene) {
		super(scene);
		this.plane = new MyPlane(this.scene,1 ,1);
	};	

	display() {
		//1
		this.scene.pushMatrix();
			this.scene.translate(0.0, 0.5, 0.0);
			this.plane.display();
		this.scene.popMatrix();
		//2
		this.scene.pushMatrix();
			this.scene.translate(0.0, -0.5, 0.0);
			this.scene.rotate(Math.PI, 1.0, 0.0, 0.0);
			this.plane.display();
		this.scene.popMatrix();
		//3
		this.scene.pushMatrix();
			this.scene.translate(0.0, 0.0, 0.5);
			this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
			this.plane.display();
		this.scene.popMatrix();
		//4
		this.scene.pushMatrix();
			this.scene.rotate(Math.PI, 0.0, 1.0, 0.0);
			this.scene.translate(0.0, 0.0, 0.5);
			this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
			this.plane.display();
		this.scene.popMatrix();
		//5
		this.scene.pushMatrix();
			this.scene.rotate(Math.PI/2, 0.0, 1.0, 0.0);
			this.scene.translate(0.0, 0.0, 0.5);
			this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
			this.plane.display();
		this.scene.popMatrix();
		//6
		this.scene.pushMatrix();
			this.scene.rotate(-Math.PI/2, 0.0, 1.0, 0.0);
			this.scene.translate(0.0, 0.0, 0.5);
			this.scene.rotate(Math.PI/2, 1.0, 0.0, 0.0);
			this.plane.display();
		this.scene.popMatrix();
	}
};