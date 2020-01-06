class Mushroom extends CGFobject {
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.head_top = new MySphere(this.scene, 0.2, 20, 20);
        this.head_bottom = new MyTorus(this.scene, 0.2, 0.2, 20, 20);
        this.body = new MyCylinder(this.scene, 50, 6, 0.3, 0.25, 0.25);

        this.body_texture = new CGFtexture(this.scene, "scenes/images/mushroombottom.png");
        this.body_material = new CGFappearance(this.scene);
        this.body_material.setAmbient(0.15, 0.15, 0.15, 1);
        this.body_material.setDiffuse(0.5, 0.5, 0.5, 1);
        this.body_material.setSpecular(0.3, 0.3, 0.3, 1);
        this.body_material.setEmission(0, 0, 0, 1);
        this.body_material.setShininess(25);
        this.body_material.setTexture(this.body_texture);
    };

    display() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0.4, -0.05);
        this.scene.rotate(-(20 * Math.PI) / 180, 1, 0, 0);
        this.scene.scale(1, 1.2, 1);
        this.scene.pushMatrix();
        this.scene.translate(0, 0.075, 0);
        this.scene.scale(1.8, 1, 1.8);
        this.head_top.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.head_bottom.display();
        this.scene.popMatrix();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.body_material.apply();
        this.body.display();
        this.scene.popMatrix();
    }
}