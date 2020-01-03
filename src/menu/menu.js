/**
 * Menu
 * @constructor
 */
class Menu extends CGFobject {
	constructor(scene, button_actions, backgroundTexturePath) {
        super(scene);
        
        this.button_spacing = 0.35;
        this.menu_width = 3;
        this.menu_breadth = 0.5;
        this.num_button_actions = button_actions.length;

        if (this.num_button_actions <= 3) {
            this.menu_height = 2;
            this.buttons_padding = this.button_spacing/4;
        } else {
            this.menu_height = 2 + (this.num_button_actions - 3) * this.button_spacing;
            this.buttons_padding = this.button_spacing * 1.3;
        }

        this.menuBody = new Cube(this.scene);
        this.background = new MyPlane(this.scene, 20, 20);

        this.buttons = [];
        for (let button_action of button_actions) {
            this.buttons.push(new Button(scene, button_action));
        }

        this.initMaterials(backgroundTexturePath);
    };

    display() {
        if (this.num_button_actions > 3) {
            this.scene.scale(0.8, 0.8, 0.8);
        }
        this.scene.pushMatrix();
            this.scene.translate(0, 0, -(this.menu_breadth/2 + 0.001));
            this.scene.scale(this.menu_width, this.menu_height, this.menu_breadth);
            this.menu_body_material.apply();
            this.scene.pushMatrix();
            this.menuBody.display();
            this.scene.popMatrix();

        this.scene.popMatrix();
        this.scene.pushMatrix();
            this.scene.scale(this.menu_width, this.menu_height, 1);
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            this.menu_material.apply();
            this.scene.pushMatrix();
            this.background.display();
            this.scene.popMatrix();
        this.scene.popMatrix();
        this.scene.pushMatrix();
            this.scene.translate(-this.menu_width/3, this.buttons_padding, 0);
            for (let button of this.buttons) {
                button.display();
                this.scene.translate(0, -this.button_spacing, 0);
            }
        this.scene.popMatrix();
    }

    initMaterials(backgroundTexturePath) {
        let background_texture = new CGFtexture(this.scene, backgroundTexturePath);
        let menu_body_texture = new CGFtexture(this.scene, "menu/resources/menuback.png");

        this.menu_material = new CGFappearance(this.scene);
        this.menu_material.setAmbient(0.15, 0.15, 0.15, 1);
        this.menu_material.setDiffuse(0.4, 0.4, 0.4, 1);
        this.menu_material.setSpecular(0.3, 0.3, 0.3, 1);
        this.menu_material.setEmission(0, 0, 0, 1);
        this.menu_material.setShininess(25);
        this.menu_material.setTexture(background_texture);

        this.menu_body_material = new CGFappearance(this.scene);
        this.menu_body_material.setAmbient(0.15, 0.15, 0.15, 1);
        this.menu_body_material.setDiffuse(0.5, 0.5, 0.5, 1);
        this.menu_body_material.setSpecular(0.3, 0.3, 0.3, 1);
        this.menu_body_material.setEmission(0, 0, 0, 1);
        this.menu_body_material.setShininess(25);
        this.menu_body_material.setTexture(menu_body_texture);
    }
};