/**
 * TransformationTrack
 * @constructor 
 * @param keyframes -
 * @param interpolant -
 */
class TransformationTrack extends KeyframeTrack {
    constructor(keyframes, interpolant) {
        super(keyframes, interpolant);
    }

    /**
     * Retreive default keyframe when nextKeyframe is the first one in the array
     */
    defaultKeyframe() {
        return {
            instant: 0,
            rotate: {
                angle_x: 0,
                angle_y: 0,
                angle_z: 0
            },
            scale: {
                x: 1,
                y: 1,
                z: 1
            },
            translate: {
                x: 0,
                y: 0,
                z: 0
            }
        };
    };

    /**
     * 
     * @param {*} time 
     */
    interpolantionValues(time) {
        let next_keyframe_index = this.nextKeyframeIndex(time);
        let keyframe1, keyframe2;

        if(next_keyframe_index === -1) {
            return this.keyframes[this.size - 1];
        } else if(next_keyframe_index === 0) {
            keyframe1 = this.defaultKeyframe();
            keyframe2 = this.keyframes[next_keyframe_index];
        } else {
            keyframe1 = this.keyframes[next_keyframe_index - 1];
            keyframe2 = this.keyframes[next_keyframe_index];
        }

        return this.interpolant.interpolate(keyframe1, keyframe2, time-keyframe1.instant);
    };
}