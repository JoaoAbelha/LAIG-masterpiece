/**
 * KeyframeTrack
 * @constructor 
 * @keyframes -
 * @interpolant -
 */
class KeyframeTrack {
    constructor(keyframes, interpolant) {
        this.keyframes = keyframes;
        this.interpolant = interpolant;
        this.size = this.keyframes.length;

        this.keyframes.sort((a,b) => (a.instant > b.instant) ? 1 : ((b.instant > a.instant) ? -1 : 0));
    };

    /**
     * Animation Span
     */
    span() {
        return this.keyframes[this.size - 1].instant;
    }

    /**
     * Get the next keyframe  
     * @param {time} time 
     */
    nextKeyframeIndex(time) {
        let index;
        
        if(this.size > 0 && time > this.span()) {
            index = - 1;
        } else {
            index = this.keyframes.findIndex(t => t.instant > time);
        }   

        return index;
    };

    /**
     * Abstract function
     * @param {time} time 
     */
    interpolantionValues(time) {
        throw new TypeError('You have to implement the method apply!');
    };
}