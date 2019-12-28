/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - radius of the sphere
 * @param slices - number of slices
 * @param stacks - number of stacks
 */
class MySphere extends CGFobject {
    constructor(scene, radius, slices, stacks) {
        super(scene);
        this.radius = radius;
        this.slices = slices;
        this.stacks = 2 * stacks;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        //array used for indices definition 
        let grid = [];
        let index = 0;

        // generate vertices, normals and texCoords
        for (let stack = 0; stack <= this.stacks; ++stack) {

            let indexRow = [];

            let v = stack / this.stacks;

            let theta = v * Math.PI;
            let sinTheta = Math.sin(theta);
            let cosTheta = Math.cos(theta);

            // special case for the poles
            let uOffset = 0;

            if (stack == 0) {
                uOffset = 0.5 / this.slices;
            } else if (stack == this.stacks) {
                uOffset = -0.5 / this.slices;
            }

            for (let slice = 0; slice <= this.slices; ++slice) {

                let u = slice / this.slices;

                let phi = u * 2 * Math.PI;
                let sinPhi = Math.sin(phi);
                let cosPhi = Math.cos(phi);

                this.vertices.push(-this.radius * cosPhi * sinTheta, this.radius * cosTheta, this.radius * sinPhi * sinTheta);

                this.normals.push(-cosPhi * sinTheta, cosTheta, sinPhi * sinTheta);

                this.texCoords.push(u + uOffset, 1 - v);

                indexRow.push(index++);
            }

            grid.push(indexRow);
        }

        // generate indices
        for (let stack = 0; stack < this.stacks; ++stack) {
            for (let slice = 0; slice < this.slices; ++slice) {
                // we use the index array to access the correct indices
                let a = grid[stack][slice + 1];
                let b = grid[stack][slice];
                let c = grid[stack + 1][slice];
                let d = grid[stack + 1][slice + 1];

                if (stack !== 0) this.indices.push(a, b, d);
                if (stack !== this.stacks - 1) this.indices.push(b, c, d);
            }

        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}