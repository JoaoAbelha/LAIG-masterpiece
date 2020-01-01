/**
/*
* @class Animation

 */
class Arch extends Animation {

    /**
     *  used to perform the animation in the pieces
     *  
     * @param {Number} xi - initial x position
     * @param {Number} zi - initial z position
     * @param {Number} xf - final x position
     * @param {Number} zf - final z position
     * @param {Number} flag -set when needed to update the matrix
     * @constructor
     */
    constructor (xi, zi, xf, zf, flag = false) {
        super();
        this.time = 500 + this.distance * 50; // rewrite the time of the parent constructor

        // extra parameters
        this.xi = xi;
        this.zi = zi;
        this.xf = xf;
        this.zf = zf;

        this.current_x = 0;
        this.current_z = 0;
        this.current_y = 0;

        // int the end they should be the same
        this.distance = Math.sqrt(Math.pow(this.xf - this.xi, 2) + Math.pow(this.zf - this.zi, 2));
        this.total_distance = 0;

        this.angle = Math.PI;
        this.total_angle = 0;

        this.previous_time = null;

        this.flag = flag;
    }

    /**
     * updates the animation
     * 
     * @param {Number} current_time - Current time, in mili seconds
     * @return {null}
     */
    update (current_time) {
        // reached the end
        if (this.total_distance >= this.distance) {
            this.finished = true;
            return;
        }

        if (this.previous_time == null) {
            this.previous_time = current_time;
            return;
        }

        let delta_time = current_time - this.previous_time;
        this.previous_time = current_time;

        //delta_x and delta_z
        this.dx = (this.xf - this.xi) * delta_time / this.time;
        this.dz = (this.zf - this.zi) * delta_time / this.time;
        let angle = this.angle * delta_time / this.time;

        this.current_x += this.dx;
        this.current_z += this.dz;
        this.total_angle += angle;

        this.current_y = 5 * Math.sin(this.total_angle);

        // calculates new distance(atual)
        this.total_distance += Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dz, 2));
        this.updateMatrix();
    }

    /**
     * Update the animation matrix
     * 
     */
    updateMatrix() {
        mat4.identity(this.matrix);
        
        if (this.flag) {
            mat4.translate(this.matrix, this.matrix, [this.current_x + 0.5, this.current_y, this.current_z + 0.5]);
            mat4.rotate(this.matrix, this.matrix, this.total_angle * 8, [1, 0, 0]);
            mat4.translate(this.matrix, this.matrix, [-0.5, -0.075, -0.5]);
        } else {
            mat4.translate(this.matrix, this.matrix, [this.current_x, this.current_y, this.current_z]);
        }
    }

      /**
     * applies the matrix animation to the scene
     * @param {reference to the scene object} scene 
     */
    apply(scene) {
        if (this.matrix !== undefined) {
            scene.multMatrix(this.matrix);
        }
    }
}