 /**
  * TransformationInterpolant
  */
 class TransformationInterpolant extends Interpolant {

    /**
     *  Interpolates the transformation translation between two keyframes
     * @param {the first keyframe} keyframe1 
     * @param {the second keyframe} keyframe2 
     * @param {time that has passed since the last one} time 
     */
    interpolateTranslate(keyframe1, keyframe2, time) {
        let delta_time = keyframe2.instant - keyframe1.instant;

        /*velocity */
        let vx = (keyframe2.translate.x - keyframe1.translate.x) / delta_time;
        let vy = (keyframe2.translate.y - keyframe1.translate.y) / delta_time;
        let vz = (keyframe2.translate.z - keyframe1.translate.z) / delta_time;

        let x = keyframe1.translate.x + vx * time;
        let y = keyframe1.translate.y + vy * time;
        let z = keyframe1.translate.z + vz * time;

        return {
            x,
            y,
            z
        };
    };

    /**
     *  Interpolates the transformation rotation between two keyframes
     * @param {the first keyframe} keyframe1 
     * @param {the second keyframe} keyframe2 
     * @param {time that has passed since the last one} time 
     */
    interpolateRotate(keyframe1, keyframe2, time) {
        let delta_time = keyframe2.instant - keyframe1.instant;

        /* rotational velocity */
        let wx = (keyframe2.rotate.angle_x - keyframe1.rotate.angle_x) / delta_time;
        let wy = (keyframe2.rotate.angle_y - keyframe1.rotate.angle_y) / delta_time;
        let wz = (keyframe2.rotate.angle_z - keyframe1.rotate.angle_z) / delta_time;
        
        let angle_x = keyframe1.rotate.angle_x + wx * time;
        let angle_y = keyframe1.rotate.angle_y + wy * time;
        let angle_z = keyframe1.rotate.angle_z + wz * time;

        return {
            angle_x,
            angle_y,
            angle_z
        };
    };

    /**
     *  Interpolates the transformation scale between two keyframes
     * @param {the first keyframe} keyframe1 
     * @param {the second keyframe} keyframe2 
     * @param {time that has passed since the last one} time 
     */
    interpolateScale(keyframe1, keyframe2, time) {
        let delta_time = keyframe2.instant - keyframe1.instant;

        let change_scalex = 0;
        let change_scaley = 0;
        let change_scalez = 0;



        /*check if one of them is negative or perform if one of them is negative*/
        if ( (keyframe1.scale.x ^ keyframe2.scale.x) < 0 || keyframe1.scale.x === 0 || keyframe2.scale.x === 0) {
            change_scalex = 1 - Math.min(keyframe1.scale.x , keyframe2.scale.x);
            keyframe1.scale.x += change_scalex;
            keyframe2.scale.x += change_scalex;
        }

        /*check if one of them is negative or perform if one of them is negative*/
        if ( (keyframe1.scale.y ^ keyframe2.scale.y) < 0 || keyframe1.scale.y === 0 || keyframe2.scale.y === 0) {
            change_scaley = 1 - Math.min(keyframe1.scale.y , keyframe2.scale.y);
            keyframe1.scale.y += change_scaley;
            keyframe2.scale.y += change_scaley;
        }

        /*check if one of them is negative or perform if one of them is negative*/
        if ( (keyframe1.scale.z ^ keyframe2.scale.z) < 0 || keyframe1.scale.z === 0 || keyframe2.scale.z === 0) {
            change_scalez = 1 - Math.min(keyframe1.scale.z , keyframe2.scale.z);
            keyframe1.scale.z += change_scalez;
            keyframe2.scale.z += change_scalez;
        }

        let x = keyframe1.scale.x * Math.pow(keyframe2.scale.x / keyframe1.scale.x, time / delta_time);
        let y = keyframe1.scale.y * Math.pow(keyframe2.scale.y / keyframe1.scale.y, time / delta_time);
        let z = keyframe1.scale.z * Math.pow(keyframe2.scale.z / keyframe1.scale.z, time / delta_time);

        if (change_scalex !== 0) {
            x -= change_scalex;
            keyframe1.scale.x -= change_scalex;
            keyframe2.scale.x -= change_scalex;
        }

        if (change_scaley !== 0) {
            y -= change_scaley;
            keyframe1.scale.y -= change_scaley;
            keyframe2.scale.y -= change_scaley;
        }

        if (change_scalez !== 0) {
            z -= change_scalez;
            keyframe1.scale.z -= change_scalez;
            keyframe2.scale.z -= change_scalez;
        }

        return {
            x,
            y,
            z
        };
    };

    /**
     *  Interpolates the transformationsbetween two keyframes
     * @param {the first keyframe} keyframe1 
     * @param {the second keyframe} keyframe2 
     * @param {time that has passed since the last one} time 
     */
    interpolate(keyframe1, keyframe2, time) {
        let translate = this.interpolateTranslate(keyframe1, keyframe2, time);
        let rotate = this.interpolateRotate(keyframe1, keyframe2, time);
        let scale = this.interpolateScale(keyframe1, keyframe2, time);

        return {
            translate,
            rotate,
            scale
        };
    };
}