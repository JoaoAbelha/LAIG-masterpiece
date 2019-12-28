/**
* Interpolant
 * @constructor 
 * abstract class that implements interpolate used to make interpolation between values
 */
class Interpolant {
    interpolate(value1, value2, time) {
        throw new TypeError('You have to implement the method interpolate!');
    };
}