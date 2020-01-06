/**
 * Screen
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x1 - vertex position in the screen in x
 * @param y1 - vertex position in the screen in y
 * @param x2 - second vertex position in the screen in x
 * @param y2 - second vertex position in the screen in y
 */
class Screen extends CGFobject {
    constructor(scene,x1,x2,y1,y2) {
        super(scene);
        this.screen = new MyRectangle(scene, x1,x2, y1, y2);
        /*create the shader */
        this.shader = new CGFshader(this.scene.gl, "shaders/security.vert", "shaders/security.frag");

        //this.time;
    }

    display() {
        //pass the current value of the time to the shader
        //this.shader.setUniformsValues({ timeFactor: this.time / 1000 % 100});
        this.scene.setActiveShader(this.shader);

        this.texture.bind();
        //this.texture.bind(1); /*bind the second texture */

        this.screen.display(); /*displays the second screen */
        this.scene.setActiveShader(this.scene.defaultShader);
    }

    setBackgroundTexture(text) {
        this.texture =  text;

    }


  
}