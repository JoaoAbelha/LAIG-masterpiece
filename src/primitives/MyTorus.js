/**
 * MyTorus
 * @constructor
 * @param scene - Reference to MyScene obsliceect
 * @param inner - inner loop
 * @param outer - outer loop
 * @param slices - number of slices
 * @param loops - number of loops
 */
class MyTorus extends CGFobject {
    constructor(scene, inner, outer, slices, loops) {
        super(scene);

        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;

        this.initBuffers();
    };

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.texCoords = [];

        //array used for indices definition 
        let grid = [];
        let index = 0;

        // generate vertices, normals and texCoords
        for (let slice = 0; slice <= this.slices; ++slice) {
            let indexRow = [];

            let v = slice / this.slices;

            let theta = v * 2 * Math.PI;
            let sinTheta = Math.sin(theta);
            let cosTheta = Math.cos(theta);

            for (let loop = 0; loop <= this.loops; ++loop) {
                let u = loop / this.loops;

                let phi = u * 2 * Math.PI;
                let sinPhi = Math.sin(phi);
                let cosPhi = Math.cos(phi);

                let vertex = vec3.fromValues((this.outer + this.inner * cosTheta) * cosPhi, (this.outer + this.inner * cosTheta) * sinPhi, this.inner * sinTheta);

                this.vertices.push(vertex[0], vertex[1], vertex[2]);

                let center = vec3.fromValues(this.outer * cosPhi, this.outer * sinPhi, 0);

                //calculate the vertice normal
                let normal = vec3.create();
                vec3.sub(normal, vertex, center);
                vec3.normalize(normal, normal);

                this.normals.push(normal[0], normal[1], normal[2]);

                this.texCoords.push(u, v);

                indexRow.push(index++);
            }

            grid.push(indexRow);
        }

        // generate indices
        for (let slice = 0; slice < this.slices; ++slice) {
            for (let loop = 0; loop < this.loops; ++loop) {
                // we use the index array to access the correct indices
                let a = grid[slice][loop + 1];
                let b = grid[slice][loop];
                let c = grid[slice + 1][loop];
                let d = grid[slice + 1][loop + 1];

                this.indices.push(a, d, b);
                this.indices.push(b, d, c);
            }

        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}