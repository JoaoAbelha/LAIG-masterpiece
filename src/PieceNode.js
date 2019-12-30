class PieceNode extends CGFobject {
    constructor(scene, matrix, material, texture, length_s, length_t, primitive) {
        super(scene);

        this.matrix = matrix;
        this.material = material;
        this.texture = texture;
        this.length_s = length_s;
        this.length_t = length_t;
        this.primitive = primitive;
    }

    display() {
        this.scene.pushMatrix();
        this.scene.multMatrix(this.matrix);

        let texture;
        (this.texture === "none") ? texture = null : texture = this.texture;
        
        this.material.setTexture(texture);
        this.material.apply();

        //only triangle and rectangle scale factors need to be applied
        if (this.primitive instanceof MyTriangle || this.primitive instanceof MyRectangle) {
            this.primitive.updateTexCoords(this.length_s, this.length_t);
        }

        this.primitive.display();
        this.scene.popMatrix();
    }
}