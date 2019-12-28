
/**
 * Animation
 * @constructor 
 * abstract class that implements the methods update and apply(scene)
 */
class Animation {
    constructor() {
        this.finished = false;
        this.time = 0;
    };

    /**
     * updates the animation matrix
     */
    update() {
        throw new TypeError('You have to implement the method update!');
    };

    /**
     * applies to the scene the animation matrix
     * @param {reference to the scene object} scene 
     */
    apply(scene) {
        throw new TypeError('You have to implement the method apply!');
    };

    /*
    * check if the animation has ended
    */
    isFinished(){
		return this.finished;
    };
    
    /**
     * sets the atribute finished to pause and play animantion
     */
    setFinished(finished) {
        this.finished = finished;
    };

    /**
     * resets the time to zero so it can play again
     */
    reset() {
        this.time = 0;
    };
}