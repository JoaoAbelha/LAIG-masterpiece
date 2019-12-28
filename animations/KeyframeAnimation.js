/**
 * KeyframeAnimation
 * @constructor 
 * class that implements keyframes animation
 */
class KeyframeAnimation extends Animation {
    constructor(keyframesTrack) {
        super();
        this.keyframesTrack = keyframesTrack;
    }

    /**
     * updates the state accordingly to the current time
     * @param {time passed since the last update} time 
     */
    update(time) {
        this.time += time;
        
        if(this.time >= this.keyframesTrack.span()) {
            this.finished = true;
        }
        
        let transformations = this.keyframesTrack.interpolantionValues(this.time);
        this.updateMatrix(transformations);
    }

    /**
     * 
     * @param {values interpolated} transformations 
     */
    updateMatrix(transformations) {
        let matrix = mat4.create();

        mat4.translate(matrix, matrix, vec3.fromValues(...Object.values(transformations.translate)));
        mat4.rotateX(matrix, matrix, DEGREE_TO_RAD * transformations.rotate.angle_x);
        mat4.rotateY(matrix, matrix, DEGREE_TO_RAD * transformations.rotate.angle_y);
        mat4.rotateZ(matrix, matrix, DEGREE_TO_RAD * transformations.rotate.angle_z);
        mat4.scale(matrix, matrix, vec3.fromValues(...Object.values(transformations.scale)));

        this.matrix = matrix;
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