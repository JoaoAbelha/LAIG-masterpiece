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

        this.gui = new dat.GUI();

        this.model = {}
        // add a group of controls (and open/expand by defult)

        this.initKeys();

        // this.gui.add(this.scene,'selectedView', this.scene.camerasId).name('Cameras').onChange(this.scene.updateCamera());
        return true;
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

    secutyCameraDropDown(views) {
        this.model.securityCamera = this.scene.securityCamera;

        this.gui.add(this.model, 'securityCamera', views)
            .name("Security Camera")
            .onChange(value => this.scene.securityCamera = value);
    }

    /**
     * Adds a folder containing the IDs of the lights
     * @param {Ligths parsed from the XML} lights 
     */
    lightsCheckBoxes(lights) {
        var group = this.gui.addFolder("Lights");

        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                let light = lights[key];
                this.model[key] = light.enableLight;
                group.add(this.model, key)
                    .name("Light " + key)
                    .onChange(val => {
                        this.scene.setLightState(light.lightID, val);
                    });
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