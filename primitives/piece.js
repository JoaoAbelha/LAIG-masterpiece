class piece  extends CGFobject {
	constructor(scene, top, bottom, radius_top) {
        super(scene);
        this.scene = scene;
        this._piece = new MySphere(this.scene, top, 5, 5);

     
    };


    display() {
        this._piece.display();
    }

    
  
}
