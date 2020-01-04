var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        let d = new Date();
        this.time = d.getTime();

        // to allow different scenes

        this.graphs = {};
        this.current_graph = null;

        this.select_scene_graph = null;

    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();
        this.initMenuCamera();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.depthMask(true);

        this.setPickEnabled(true);

        this.axis = new CGFaxis(this);
        this.showAxis = false;
        this.textures = [];

        this.createDefaultMaterial();
        this.setUpdatePeriod(10);

        // Static objects scene setting
        ClickHandler.setScene(this);
        CameraHandler.setScene(this);
        MenuHandler.init(this);
    }

 

    /**
     * Initialize the scene camera.
     */
    initCameras() {
        this.views = [];
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
        this.selectedView = "default"
        this.views["default"] = this.camera;
    }

    /**
     * Create a default material to be used as the parent material for the root component display
     */
    createDefaultMaterial() {
        this.defaultMaterial = new CGFappearance(this);
        this.defaultMaterial.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.defaultMaterial.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.defaultMaterial.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.defaultMaterial.setShininess(10.0);
    }

    initMenuCamera() {
        this.menu_camera = new CGFcamera(1.3, 0.1, 20, vec3.fromValues(0, 0, 2.5), vec3.fromValues(0, 0, 0));
        this.camera = this.menu_camera;
    }

    /**
     * Toggle showAxis (used by MyInterface)
     */
    changeAxis() {
        this.showAxis = !this.showAxis;
    }

    /**
     * Initializes the scene views with the values read from the XML file.
     */
    initViews() {
        let viewsId = []; //array used for interface cameras dropdown

        for (var key in this.current_graph.views) {
            if (this.current_graph.views.hasOwnProperty(key)) {
                var view = this.current_graph.views[key];

                if (view.type === "ortho") {
                    let v = new CGFcameraOrtho(
                        view.left, view.right, view.bottom, view.top,
                        view.near, view.far,
                        vec3.fromValues(...Object.values(view.from)),
                        vec3.fromValues(...Object.values(view.to)),
                        vec3.fromValues(...Object.values(view.up))
                    );
                    this.views[key] = v;
                } else if (view.type === "perspective") {
                    let v = new CGFcamera(
                        view.angle * DEGREE_TO_RAD, view.near,
                        view.far, vec3.fromValues(...Object.values(view.from)),
                        vec3.fromValues(...Object.values(view.to))
                    );
                    this.views[key] = v;
                }

                viewsId.push(key);
            }
        }

        //change to the default view defined
        this.selectedView = this.current_graph.defaultViewId;
        //this.camera = this.views[this.selectedView];
       // this.interface.setActiveCamera(this.camera);

        if (!this.menuMode) {
            // Already playing (not in menu mode), change player camera to the defined default
            this.setCurrentCamera(this.current_graph.defaultViewId);  
        }
        else {
            this.interface.setActiveCamera(null);
        }

        this.game_camera = this.camera;
    }

    initGame() {
        CameraHandler.resetZoom();
        this.camera = this.game_camera;
        this.menuMode = false;
        this.enableLights();
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        this.lightsId = [];
        let i = 0;

        // Reads the lights from the scene graph.
        for (var key in this.current_graph.lights) {
            if (i >= 8)
                break; // Only eight lights allowed by WebGL.

            if (this.current_graph.lights.hasOwnProperty(key)) {
                var light = this.current_graph.lights[key];

                let pos = light.location;
                let ambient = light.ambient;
                let diffuse = light.diffuse;
                let specular = light.specular;

                this.lights[i].setPosition(pos.x, pos.y, pos.z, pos.w);
                this.lights[i].setAmbient(ambient.r, ambient.g, ambient.b, ambient.a);
                this.lights[i].setDiffuse(diffuse.r, diffuse.g, diffuse.b, diffuse.a);
                this.lights[i].setSpecular(specular.r, specular.g, specular.b, specular.a);

                //set attenuation
                this.lights[i].setConstantAttenuation(light.attenuation.constant);
                this.lights[i].setLinearAttenuation(light.attenuation.linear);
                this.lights[i].setQuadraticAttenuation(light.attenuation.quadratic);

                if (light.type == "spot") {
                    this.lights[i].setSpotCutOff(light.angle);
                    this.lights[i].setSpotExponent(light.exponent);

                    let target = light.target;
                    this.lights[i].setSpotDirection(target.x - pos.x, target.y - pos.y, target.z - pos.z);
                }

                this.lights[i].disable();

                this.lights[i].update();
                this.lightsId[key] = i;

                i++;
            }
        }
    }

    enableLights() {
        let i = 0;

        for(var key in this.current_graph.lights) {
            if (this.current_graph.lights.hasOwnProperty(key)) {
                var light = this.current_graph.lights[key];

                if (light.enableLight)
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }

        //add lights checkbox and show lights to interface
        this.interface.lightsCheckbox();
        this.interface.lightsCheckBoxes(this.current_graph.lights);
    }

    /**
     * Enables/Disables a light
     * @param {Light key} key 
     * @param {New enable light value} newVal 
     */
    setLightState(key, newVal) {
        let lightIndex = this.lightsId[key];

        if (newVal) {
            this.lights[lightIndex].enable();
        } else {
            this.lights[lightIndex].disable();
        }
    }

    /**
     * Set all lights to visible
     */
    showLights() {
        for (let light of this.lights) {
            light.setVisible(!light.visible);
        }
    }

    /**
     * Initializes the scene materials with the values read from the XML file.
     */
    initMaterials() {
        this.materials = [];

        for (var key in this.current_graph.materials) {
            if (this.current_graph.materials.hasOwnProperty(key)) {
                var material = this.current_graph.materials[key];

                this.materials[key] = new CGFappearance(this);

                let ambient = material.ambient;
                let diffuse = material.diffuse;
                let specular = material.specular;
                let emission = material.emission;

                this.materials[key].setAmbient(ambient.r, ambient.g, ambient.b, ambient.a);
                this.materials[key].setDiffuse(diffuse.r, diffuse.g, diffuse.b, diffuse.a);
                this.materials[key].setSpecular(specular.r, specular.g, specular.b, specular.a);
                this.materials[key].setEmission(emission.r, emission.g, emission.b, emission.a);
                this.materials[key].setShininess(material.shininess);
                this.materials[key].setTextureWrap('REPEAT','REPEAT');
            }
        }
    }

    /**
     * Initializes the scene textures with the values read from the XML file.
     */
    initTextures(graph) {
        for (var key in graph.textures) {
            if (graph.textures.hasOwnProperty(key)) {
                var texture = graph.textures[key];
                this.textures[key] = new CGFtexture(this, texture.path);
            }
        }
    }

    /**
     * Initializes the scene transformations with the values read from the XML file.
     */
    initTransformations() {
        this.transformations = [];

        for (var key in this.current_graph.transformations) {
            if (this.current_graph.transformations.hasOwnProperty(key)) {
                var transformation = this.current_graph.transformations[key];

                //calculate the trnasformation matrix
                let matrix = mat4.create();
                for (let transf of transformation.transformations) {
                    switch (transf.type) {
                        case "translate":
                            mat4.translate(matrix, matrix, vec3.fromValues(transf.x, transf.y, transf.z));
                            break;
                        case "rotate":
                            switch (transf.axis) {
                                case "x":
                                    mat4.rotateX(matrix, matrix, DEGREE_TO_RAD * transf.angle);
                                    break;
                                case "y":
                                    mat4.rotateY(matrix, matrix, DEGREE_TO_RAD * transf.angle);
                                    break;
                                case "z":
                                    mat4.rotateZ(matrix, matrix, DEGREE_TO_RAD * transf.angle);
                                    break;
                            }
                            break;
                        case "scale":
                            mat4.scale(matrix, matrix, vec3.fromValues(transf.x, transf.y, transf.z));
                            break;
                        default:
                            break;
                    }
                }

                this.transformations[key] = matrix;
            }
        }
    }

    /*
    * Resumes the animations that were being performed 
    */
    playAnimation() {
        for (var key in this.animations) {
            if (this.animations.hasOwnProperty(key)) {
                this.animations[key].setFinished(false);
            }
        }
    };

    /*
    * Pauses all the animations
    */
    pauseAnimation() {
        for (var key in this.animations) {
            if (this.animations.hasOwnProperty(key)) {
                this.animations[key].setFinished(true);
            }
        }
    };

    /*
    * Restarts all the animations
    */
    restartAnimation() {
        for (var key in this.animations) {
            if (this.animations.hasOwnProperty(key)) {
                this.animations[key].setFinished(false);
                this.animations[key].reset();
            }
        }
    };

    /*
    * After being parsed intializes all the animations and the objects associated with them such
    * as KeyframeAnimation, TransformationInterpolant, TransformationTrack
    */
    initAnimations() {
        this.animations = [];
        let interpolant = new TransformationInterpolant();

        for (var key in this.current_graph.animations) {
            if (this.current_graph.animations.hasOwnProperty(key)) {
                let animation = this.current_graph.animations[key];
                let keyframes = animation.keyframes;
                let keyframeTrack = new TransformationTrack(keyframes, interpolant);
                this.animations[key] = new KeyframeAnimation(keyframeTrack);
            }
        }
    }

    /**
    function called periodically
    * This function is being used to help to performe the animations of the scene and the
    * animations of the shader
    * @param t - current time
    */
    update(t) {
        let delta_time = t - this.time;
        this.time = t;
        // update das keyframes since it can not depende on the rate the function display is called

        if (this.sceneInited) {
            CameraHandler.update(delta_time);
            ClockState.updateCountdown(delta_time);
            BoardState.updatePieceAnimations(delta_time);
            this.scoreBoard && this.scoreBoard.updateTextures();
            this.clock && this.clock.updateTextures();
        }
    }

    setCurrentCamera(camera_id) {
        const selected_camera = this.cameras.get(camera_id);

        if(!selected_camera) {
            console.warn(`Camera with id '${camera_id}' was not found, falling back to default camera`);
        }

        this.camera = selected_camera || this.default_camera;
        // this.interface.setActiveCamera(this.camera);
        this.interface.setActiveCamera(null);
    }

    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded(graph) {


        if (this.current_graph != graph) {
            graph.constructGraph();
            graph.createCustomPieces();
            this.initMaterials();
            this.initTextures(graph);
            this.initTransformations();
            return;
        }

        // If another scene was loaded before, "pause" the scene rendering to ensure there are no unnecessary errors
        //this.sceneInited = false;

        //console.log(this.current_graph.ambient);
        this.axis = new CGFaxis(this, this.current_graph.referenceLength);

        this.gl.clearColor(this.current_graph.background.r, this.current_graph.background.g, this.current_graph.background.b, this.current_graph.background.a);

        this.setGlobalAmbientLight(this.current_graph.ambient.r, this.current_graph.ambient.g, this.current_graph.ambient.b, this.current_graph.ambient.a);

        this.initViews();
        this.initLights();
        this.initMaterials();
        this.initTextures(this.current_graph);
        this.initTransformations();
        this.initAnimations();

        //add axis checkbox to interface
        this.interface.axisCheckBox();

        this.interface.addDifferentScenes(this.graphs);

        //construct the graph before start displaying
        this.current_graph.constructGraph();
        this.current_graph.createCustomPieces();

        if (!this.menuMode) {
            CameraHandler.swapToCurrentCamera();
            CameraHandler.moveToCurrentPosition();
        }

        // Start or "resume" scene displaying

        this.sceneInited = true;
    }

    onGraphChange(scene_name) {
        this.current_graph = this.graphs[scene_name];
        this.axis = new CGFaxis(this,this.current_graph.referenceLength);
        this.gl.clearColor(this.current_graph.background.r, this.current_graph.background.g, this.current_graph.background.b, this.current_graph.background.a);
        this.setGlobalAmbientLight(this.current_graph.ambient.r, this.current_graph.ambient.g, this.current_graph.ambient.b, this.current_graph.ambient.a);
        this.interface.updateLightsGroup(this.current_graph.lights);
    }

    

    /**
     * Displays the scene.
     * @param camara - the active camara to render the scene
     */
    display() {
        // set camara active

        // ---- BEGIN Background, camera and axis setup
        ClickHandler.verifyClicks();
        
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        for (let light of this.lights) {
            light.update();
        }

        this.pushMatrix();

        if (this.showAxis)
            this.axis.display();

        if (this.sceneInited) {
            if (this.menuMode) {
                MenuHandler.displayCurrentMenu();
            } else {
                //  console.log(this.camera);
                this.current_graph.displayScene();  
            }   
        }
        this.popMatrix();
    }

}