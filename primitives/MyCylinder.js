/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 * @param base - the base radius
 * @param top - the top radius
 * @param height - the height of the cylinder
 * @param slices - number of slices
 * @param stacks - number of stacks
 */
class MyCylinder extends CGFobject {
    constructor(scene, slices, stacks, height, base, top) {
        super(scene);

        this.slices = slices;
        this.stacks = stacks;
        this.height = height;
        this.base = base;
        this.top = top;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        this.index = 0;
        let grid = [];
        // this will be used to calculate the normal
        let slope = (this.base - this.top) / this.height;

        // generate vertices, normals and texCoords
        for (let stack = 0; stack <= this.stacks; ++stack) {
            let indexRow = [];

            let v = stack / this.stacks;
            let radius = v * (this.top - this.base) + this.base; // calculate the radius of the current row

            for (let slice = 0; slice <= this.slices; ++slice) {
                let u = slice / this.slices;

                let theta = u * 2 * Math.PI;

                let sinTheta = Math.sin(theta);
                let cosTheta = Math.cos(theta);

                // vertex
                this.vertices.push(radius * sinTheta, radius * cosTheta, v * this.height);

                // normal
                let normal = vec3.create();
                vec3.set(normal, sinTheta, cosTheta, slope);
                vec3.normalize(normal, normal);

                this.normals.push(normal[0], normal[1], normal[2]);

                this.texCoords.push(u, 1 - v);

                indexRow.push(this.index++);
            }

            grid.push(indexRow);
        }

        // generate indices
        for (let slice = 0; slice < this.slices; slice++) {
            for (let stack = 0; stack < this.stacks; stack++) {
                // we use the index array to access the correct indices
                let a = grid[stack][slice];
                let b = grid[stack + 1][slice];
                let c = grid[stack + 1][slice + 1];
                let d = grid[stack][slice + 1];

                this.indices.push(a, b, d);
                this.indices.push(b, c, d);
            }

        }

        this.generateCap(true);
        this.generateCap(false);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    generateCap(top) {
        let centerIndex;
        let radius = (top === true) ? this.top : this.base;
        let sign = (top === true) ? 1 : -1;

        // save the index of the center vertex
        centerIndex = this.index;

        this.vertices.push(0, 0, this.height / 2 * (sign + 1));
        this.normals.push(0, 0, sign);
        this.texCoords.push(0.5, 0.5);

        this.index++;

        // now we generate the surrounding vertices, normals and texCoords
        for (let slice = 0; slice <= this.slices; slice++) {

            let u = slice / this.slices;
            let theta = u * 2 * Math.PI;

            let cosTheta = Math.cos(theta);
            let sinTheta = Math.sin(theta);

            // vertex
            this.vertices.push(radius * sinTheta, radius * cosTheta, this.height / 2 * (sign + 1));

            // normal
            this.normals.push(0, 0, sign);

            //texCoords
            this.texCoords.push((cosTheta * 0.5) + 0.5, (sinTheta * 0.5 * sign) + 0.5);

            this.index++;
        }

        // generate indices
        for (let slice = 0; slice <= this.slices; slice++) {
            let i = centerIndex + slice;

            if (top === true) {
                this.indices.push(i + 1, i, centerIndex);
            } else {
                this.indices.push(i, i + 1, centerIndex);
            }
        }
    }
}