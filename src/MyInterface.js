/**
 * MyInterface class, creating a GUI interface.
 */
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        return true;
    }


    loadInterface() {

        this.gui && this.gui.destroy();
        this.gui = new dat.GUI();

        this.model = {}
        // add a group of controls (and open/expand by defult)

        this.addDifferentScenes();

        this.initKeys();

    }


    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui = this;
        this.processKeyboard = () => {};
    }

    processKeyDown(event) {
        if (event.code == "KeyM") {
            this.scene.graph.rotateMaterials();
        }
    };

    processKeyUp(event) {

    };

    /**
     * Adds a dropdown select for the views
     * @param {Array with views ids} views 
     */
    viewsDropDown(views) {
        this.model.defaultView = this.scene.selectedView;

        this.gui.add(this.model, 'defaultView', views)
            .name("View")
            .onChange(value => this.scene.selectedView = value);
    }

    addDifferentScenes() {
        const scene_name = [
            "game.xml",
            "island.xml"
        ]

        this.model.scene = this.scene.graph.filename;

        this.gui.add(this.model, 'scene_name', scene_name).onChange(
            filename => this.scene.graph.parseXMLFile(filename)
        ).name("Scene");
    }



    /**
     * Adds a folder containing the IDs of the lights
     * @param {Ligths parsed from the XML} lights 
     */
    lightsCheckBoxes(lights) {
        this.group_light = this.gui.addFolder("Lights");
        this.group_light.open();
        this.lights = [];

        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                let light = lights[key];
                this.model[key] = light.enableLight;

                this.lights.push(this.group_light.add(this.model, key)
                    .name("Light " + key)
                    .onChange(val => {
                        this.scene.setLightState(light.lightID, val);
                    }));
            }
        }
    }

    /**
     * Adds a ckeckbox to show/hide the scene lights  
     */
    lightsCheckbox() {
        this.model['Show Lights'] = false;
        this.gui.add(this.model, 'Show Lights').onChange(val => {
            this.scene.showLights();
        });
    }


    updateLightsGroup(lights) {

        for (let i = 0; i < this.lights.length; ++i)
            this.group_light.remove(this.lights[i]);

        this.lights = [];
        


        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                let light = lights[key];
                this.model[key] = light.enableLight;

                this.lights.push(this.group_light.add(this.model, key)
                    .name("Light " + key)
                    .onChange(val => {
                        this.scene.setLightState(light.lightID, val);
                    }));
            }
        }

    }

    /**
     * Adds a ckeckbox to show/hide the scene axis
     */
    axisCheckBox() {
        this.model['Show Axis'] = this.scene.showAxis;
        this.gui.add(this.model, 'Show Axis').onChange(val => {
            this.scene.changeAxis();
        });
    }

    /**
     * Adds buttons to play, pause and restart the animations
     */
    addAnimations(){
        var group = this.gui.addFolder("Animations");
        group.open();
  
        group.add(this.scene, "playAnimation").name("Play");
        group.add(this.scene, "pauseAnimation").name("Pause");
        group.add(this.scene, "restartAnimation").name("Restart");
      }
}