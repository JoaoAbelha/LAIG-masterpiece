class Mushroom extends CGFobject {
    constructor(scene, top, bottom, radius_top) {
        super(scene);
        this.scene = scene;
        this.piece = new MySphere(this.scene, top, 10, 10);
    };

    display() {
        this.piece.display();
    }
}