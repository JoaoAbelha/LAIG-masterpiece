/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale in X
 * @param y - Scale in Y
 */
class MyTriangle extends CGFobject {
    constructor(scene, x1, x2, x3, y1, y2, y3, z1, z2, z3) {
        super(scene);
        this.x1 = x1;
        this.x2 = x2;
        this.x3 = x3;
        this.y1 = y1;
        this.y2 = y2;
        this.y3 = y3;
        this.z1 = z1;
        this.z2 = z2;
        this.z3 = z3;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            this.x1, this.y1, this.z1, //0
            this.x2, this.y2, this.z2, //1
            this.x3, this.y3, this.z3 //2
        ];

        //Counter-clockwise reference of vertices
        this.indices = [
            0, 1, 2,
            2, 1, 0
        ];

        //calculate the normals of the plane
        //more stuff : http://glmatrix.net/docs/module-vec3.html

        let Q = new vec3.fromValues(this.x1 - this.x2, this.y1 - this.y2, this.z1 - this.z2);
        let S = new vec3.fromValues(this.x2 - this.x3, this.y2 - this.y3, this.z2 - this.z3);

        //cross product
        let normal = vec3.create();
        vec3.cross(normal, Q, S);
        vec3.normalize(normal, normal);

        this.normals = [
            normal[0], normal[1], normal[2],
            normal[0], normal[1], normal[2],
            normal[0], normal[1], normal[2]
        ];

        // length of triangle sides
        this.a = Math.sqrt(Math.pow((this.x1 - this.x2), 2) + Math.pow((this.y1 - this.y2), 2) + Math.pow((this.z1 - this.z2), 2));
        this.b = Math.sqrt(Math.pow((this.x2 - this.x3), 2) + Math.pow((this.y2 - this.y3), 2) + Math.pow((this.z2 - this.z3), 2));
        this.c = Math.sqrt(Math.pow((this.x3 - this.x1), 2) + Math.pow((this.y3 - this.y1), 2) + Math.pow((this.z3 - this.z1), 2));

        this.cosa = (this.a * this.a - this.b * this.b + this.c * this.c) / (2 * this.a * this.c);
        this.sina = Math.sqrt(1 - (this.cosa * this.cosa));

        this.texCoords = [
            0, 1,
            1, 1,
            0.5, 0,
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Updates the list of texture coordinates of the triangle
     * @param {S scale factor} lengthS 
     * @param {T scale factor} lenghtT 
     */
    updateTexCoords(lengthS, lenghtT) {
        this.texCoords = [
            0, 1,
            this.a / lengthS, 1,
            this.c * this.cosa / lengthS, 1 - this.c * this.sina / lenghtT,
        ];

        this.updateTexCoordsGLBuffers();
    }
}