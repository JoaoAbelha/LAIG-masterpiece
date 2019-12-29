class Mushroom extends CGFobject {
    constructor(scene, top, bottom, radius_top) {
        super(scene);
        this.scene = scene;
        this.piece = new MySphere(this.scene, top, 5, 5);
    };

    display() {
        this.piece.display();
    }
}