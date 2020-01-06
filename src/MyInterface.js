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
        return true;
    }

    restartGUI() {
        this.gui && this.gui.destroy();
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui
        this.gui = new dat.GUI();
        this.model = {};
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

    scenesDropDown() {
        let sceneDropdownModel = [
            "room.xml", 
            "game.xml",
            "mario.xml",
        ];
        
        this.model.sceneIndex = this.scene.graph.filename;

        this.gui.add(this.model, "sceneIndex", sceneDropdownModel)
            .name("Current Scene")
            .onChange(filename => this.scene.graph.parseXML(filename));
    }

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

    addDifferentScenes(scene_graphs) {
        let scene_name = [];

        for(let names in scene_graphs)
            scene_name.push(names);

        this.gui.add(this.scene, 'select_scene_graph', scene_name).onChange(function(sceneName) {
            this.object.onGraphChange(sceneName);
        }).name("Scene");
    }



    /**
     * Adds a folder containing the IDs of the lights
     * @param {Ligths parsed from the XML} lights 
     */
    lightsCheckBoxes(lights) {
        this.group_light = this.gui.addFolder("Lights");
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