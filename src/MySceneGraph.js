var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var GLOBALS_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var ANIMATION_INDEX = 7;
var PRIMITIVES_INDEX = 8;
var COMPONENTS_INDEX = 9;


/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // remove the extension
        // a scene_id is reprensented by the name of the file
        this.scene_id = filename.split('.')[0];

        // Establish bidirectional references between scene and graph.
        console.log(scene);

        this.scene = scene;
        scene.graphs[this.scene_id] = this;

        if(!scene.current_graph) { // if is not defined selects the scene
            scene.select_scene_graph = this.scene_id;
            scene.current_graph= this;
        }


        this.idRoot = null; // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        //exception in case something does not permit to continue the parsing
        try {
            this.parseXMLFile(rootElement);
        } catch (error) {
            if (error) {
                this.onXMLError(error);
                return;
            }
        }

        this.loadedOk = true;
        //console.log(this.components);
       //console.log(this.animations);

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded(this);
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lxs")
            throw "root tag <lxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) === -1) {
            throw "tag <scene> missing";
        } else {
            if (index !== SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);
            this.parseScene(nodes[index]);
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) === -1)
            throw "tag <views> missing";
        else {
            if (index !== VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");
            this.parseView(nodes[index]);
        }

        // <ambient>
        if ((index = nodeNames.indexOf("globals")) === -1)
            throw "tag <globals> missing";
        else {
            if (index !== GLOBALS_INDEX)
                this.onXMLMinorError("tag <globals> out of order");
            this.parseGlobals(nodes[index]);
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) === -1)
            throw "tag <lights> missing";
        else {
            if (index !== LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");
            this.parseLights(nodes[index]);
        }

        // <textures>
        if ((index = nodeNames.indexOf("textures")) === -1)
            throw "tag <textures> missing";
        else {
            if (index !== TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");
            this.parseTextures(nodes[index]);
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) === -1)
            throw "tag <materials> missing";
        else {
            if (index !== MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");
            this.parseMaterials(nodes[index]);
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) === -1)
            throw "tag <transformations> missing";
        else {
            if (index !== TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");
            this.parseTransformations(nodes[index]);
        }

        //<animation> 
        if ((index = nodeNames.indexOf("animations")) === -1)
            throw "tag <animations> missing";
        else {
            if (index !== ANIMATION_INDEX)
                this.onXMLMinorError("tag <animation> out of order");
            this.parseAnimations(nodes[index]);
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) === -1)
            throw "tag <primitives> missing";
        else {
            if (index !== PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");
            this.parsePrimitives(nodes[index]);
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) === -1)
            throw "tag <components> missing";
        else {
            if (index !== COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");
            this.parseComponents(nodes[index]);
        }

        const piecesNode = rootElement.querySelector("pieces");

        if (piecesNode) {
            this.parsePieces(piecesNode);
        }
        
        this.log("All parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {
        // Save the ID of the root
        this.idRoot = this.parseString(sceneNode, "root", "Scene: ");

        // check the length of the axis
        this.referenceLength = this.parseFloat(sceneNode, "axis_length", "Scene: ", 1);
        if (this.referenceLength < 0) {
            this.onXMLMinorError("The length if the axis is negative: " + this.referenceLength);
        }

        this.log("Parsed Scene");
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {

        this.views = []; // where the parsed views are saved

        // have a reference to the default view
        this.defaultViewId = this.parseString(viewsNode, "default", "Views: ");

        let views = viewsNode.children;
        let view_nr = 0;

        // parsing all the views:
        // they can be either of type ortho or perspective
        for (; view_nr < views.length; ++view_nr) {
            if (views[view_nr].nodeName === "perspective") {
                this.parsePerspectiveView(views[view_nr]);
            } else if (views[view_nr].nodeName === "ortho") {
                this.parseOrthoView(views[view_nr]);
            } else this.onXMLMinorError("Views: unknown tag <" + views[view_nr].nodeName + ">");
        }

        /*There should be declared at least one view*/
        if (view_nr == 0) {
            throw "At least one view must be defined: ortho or perspective";
        }

        /*Check if the default view Id exists*/
        if (this.views[this.defaultViewId] === undefined) {
            throw "Default view id not specified";
        }

        if (this.views["player_camera"] === undefined) {
            throw "view with id 'player_camera' must be specified";
        }

        if (this.views["spectator_camera"] === undefined) {
            throw "view with id 'spectator_camera' must be specified";
        }

        this.log("Parsed Views");
    }

    /**
     * Parses the  views of type perspective
     * @param {view element} viewNode
     */
    parsePerspectiveView(viewNode) {
        /*Parsing the view ID  */
        let viewId = this.parseString(viewNode, "id");
        let messageError = "Perspective view with id " + viewId + ": ";

        /* The view id should have a proper name and should be defined*/
        if (viewId === "")
            throw "Perspective id must not be empty";
        else if (this.views[viewId] !== undefined)
            throw messageError + "id is already in use";

        //parse near,far,angle
        let near = this.parseFloat(viewNode, "near", messageError, 0.5);
        let far = this.parseFloat(viewNode, "far", messageError, 500);
        let angle = this.parseFloat(viewNode, "angle", messageError, 45);

        //check near and far values
        if (near >= far)
            throw messageError + "near attribute must be smaller than far attribute";

        //check angle value
        if (angle <= 0) {
            this.onXMLMinorError(messageError + "view angle should be bigger than 0, setting angle to 45");
            angle = 45;
        } else if (angle > 180) {
            this.onXMLMinorError(messageError + "view angle should be smaller or equal to 180, setting angle to 45");
            angle = 45;
        }

        let coords = viewNode.children;

        //check if view has a valid number of coords
        if (coords.length > 2)
            throw messageError + "invalid number of view coordinates";

        //push node names
        let nodeNames = [];
        for (let j = 0; j < coords.length; j++) {
            nodeNames.push(coords[j].nodeName);
        }

        //check if from and to exists
        let fromIndex, toIndex;
        if ((fromIndex = nodeNames.indexOf("from")) === -1)
            throw messageError + "from tag is missing";
        if ((toIndex = nodeNames.indexOf("to")) === -1)
            throw messageError + "to tag is missing";

        //parse from and to attributes
        let from = this.parseCoordinates3D(coords[fromIndex], messageError);
        let to = this.parseCoordinates3D(coords[toIndex], messageError);

        //check if from and to are different
        if (from.x === to.x && from.y === to.y && from.z === to.z)
            throw messageError + "from and to attributes cannot be the same point in space";

        // save the info view
        const view = {
            type: "perspective",
            viewId,
            near,
            far,
            angle,
            from,
            to,
        }
        // save all the parsed views
        this.views[view.viewId] = view;
    }

    /**
     * Parses the views of type ortho
     * @param {view element} viewNode
     */
    parseOrthoView(viewNode) {
        /*Parsing the view ID  */
        let viewId = this.parseString(viewNode, "id");
        let messageError = "Ortho view with id " + viewId + ": ";

        /* The view id should have a proper name and should be defined*/
        if (viewId === "")
            throw "Ortho id must not be empty";
        else if (this.views[viewId] !== undefined)
            throw messageError + "id is already in use";

        //parse near,far
        let near = this.parseFloat(viewNode, "near", messageError, 0.5);
        let far = this.parseFloat(viewNode, "far", messageError, 500);

        //check near and far values
        if (near >= far)
            throw messageError + "near attribute must be smaller than far attribute";

        //parse left,right
        let left = this.parseFloat(viewNode, "left", messageError);
        let right = this.parseFloat(viewNode, "right", messageError);

        //check left and right values
        if (left >= right)
            throw messageError + "left attribute must be smaller than right attribute";

        //parse bottom,top
        let bottom = this.parseFloat(viewNode, "bottom", messageError);
        let top = this.parseFloat(viewNode, "top", messageError);

        //check bottom and top values
        if (bottom >= top) {
            throw messageError + "bottom attribute must be smaller than top attribute";
        }

        let coords = viewNode.children;

        //check if view has a valid number of coords
        if (coords.length > 3)
            throw messageError + "invalid number of view coordinates";

        //push node names
        let nodeNames = [];
        for (let j = 0; j < coords.length; j++) {
            nodeNames.push(coords[j].nodeName);
        }

        //check if from and to exist
        let fromIndex, toIndex;
        if ((fromIndex = nodeNames.indexOf("from")) === -1)
            throw messageError + "from tag is missing";
        else if ((toIndex = nodeNames.indexOf("to")) === -1)
            throw messageError + "to tag is missing";

        //parse from and to attributes
        let from = this.parseCoordinates3D(coords[fromIndex], messageError);
        let to = this.parseCoordinates3D(coords[toIndex], messageError);

        //check if from and to are different
        if (from.x === to.x && from.y === to.y && from.z === to.z)
            throw messageError + "from and to attributes cannot be the same point in space";

        //parse up
        let up, upIndex;
        if ((upIndex = nodeNames.indexOf("up")) !== -1) {
            up = this.parseCoordinates3D(coords[upIndex], messageError);
        } else {
            this.onXMLMinorError(messageError + "up tag is missing, assuming value [0,1,0]");
            up = {
                x: 0,
                y: 1,
                z: 0
            }
        }

        //save the parsed view information 
        const view = {
            type: "ortho",
            viewId,
            near,
            far,
            left,
            right,
            bottom,
            top,
            from,
            to,
            up
        }

        // save all the parsed views
        this.views[view.viewId] = view;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseGlobals(globalsNode) {
        let children = globalsNode.children;
        let messageError = "Globals: "

        //check if globals has a valid number of coords
        if (children.length > 2)
            throw messageError + "invalid number of child nodes";

        let nodeNames = [];

        for (let i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        /*Check if the tags exist */
        let ambientIndex = nodeNames.indexOf("ambient");
        let backgroundIndex = nodeNames.indexOf("background");

        if (ambientIndex === -1)
            throw messageError + "ambient tag is missing";
        if (backgroundIndex === -1)
            throw messageError + "background tag is missing";

        //parse ambient and background and save the information
        this.ambient = this.parseColor(children[ambientIndex], messageError);
        this.background = this.parseColor(children[backgroundIndex], messageError);

        this.log("Parsed Globals");
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        this.lights = []; // to save all the lights objects
        let lights = lightsNode.children;

        let light_nr = 0;

        //parse the light: they can be omni or spot
        for (; light_nr < lights.length; ++light_nr) {
            if (lights[light_nr].nodeName === "omni") {
                this.parseOmniLight(lights[light_nr]);
            } else if (lights[light_nr].nodeName === "spot") {
                this.parseSpotLight(lights[light_nr]);
            } else this.onXMLMinorError("Lights: unknown tag <" + lights[light_nr].nodeName + ">");
        }

        //there should always be at least one light. however there can not be more than eight
        if (light_nr === 0) {
            throw "At least one light must be defined: omni or spot";
        } else if (light_nr > 8) {
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");
        }

        this.log("Parsed Lights");
    }

    /**
     * Parses the  light node of type omni
     * @param {light omni} lightNode
     */
    parseOmniLight(lightNode) {
        //get the id
        let lightID = this.parseString(lightNode, "id");
        let messageError = "Omni ligh with id " + lightID + ": ";

        //check light id
        if (lightID === "")
            throw "Omni id must not be empty";
        else if (this.lights[lightID] !== undefined)
            throw messageError + "id is already in use";

        // Light enable/disable
        let enableLight = true;
        let aux = this.reader.getBoolean(lightNode, 'enabled');
        if (!(aux != null && !isNaN(aux) && (aux == true || aux == false))) {
            this.onXMLMinorError(messageError + "unable to parse value component of the enable light field; assuming 'value = 1'");
            enableLight = 1;
        } else {
            enableLight = aux;
        }

        let lightNodes = lightNode.children;

        //check if light has a valid number of coords
        if (lightNodes.length > 5)
            throw messageError + "invalid number of lights nodes";

        let nodeNames = [];
        for (var j = 0; j < lightNodes.length; j++) {
            nodeNames.push(lightNodes[j].nodeName);
        }

        let locationIndex, ambientIndex, diffuseIndex, specularIndex, attenuationIndex;
        // check if location, ambient, diffuse, specular and attenuation tag exist
        if ((locationIndex = nodeNames.indexOf("location")) === -1)
            throw messageError + "location tag is missing";
        else if ((ambientIndex = nodeNames.indexOf("ambient")) === -1)
            throw messageError + "ambient tag is missing";
        else if ((diffuseIndex = nodeNames.indexOf("diffuse")) === -1)
            throw messageError + "diffuse tag is missing";
        else if ((specularIndex = nodeNames.indexOf("specular")) === -1)
            throw messageError + "specular tag is missing";

        //parse light nodes
        let location = this.parseCoordinates4D(lightNodes[locationIndex], messageError);
        let ambient = this.parseColor(lightNodes[ambientIndex], messageError);
        let diffuse = this.parseColor(lightNodes[diffuseIndex], messageError);
        let specular = this.parseColor(lightNodes[specularIndex], messageError);

        //parse attenuation attribute
        let attenuation, constant, linear, quadratic;
        if ((attenuationIndex = nodeNames.indexOf("attenuation")) !== -1) {
            constant = this.parseFloat(lightNodes[attenuationIndex], "constant", messageError);
            linear = this.parseFloat(lightNodes[attenuationIndex], "linear", messageError);
            quadratic = this.parseFloat(lightNodes[attenuationIndex], "quadratic", messageError);

            if (constant === 0 && linear === 0 && quadratic === 0) {
                throw messageError + "one of the attenuation values must be greatter than zero";
            }
        } else {
            this.onXMLMinorError(messageError + "attenuation tag is missing, assuming constant attenuation");
            constant = 1;
            linear = 0;
            quadratic = 0;
        }

        attenuation = {
            constant,
            linear,
            quadratic
        }
        // save all the light information
        const light = {
            type: "omni",
            lightID,
            enableLight,
            location,
            ambient,
            diffuse,
            specular,
            attenuation
        }
        // save all the lights of type omni
        this.lights[light.lightID] = light;
    }


    /**
     * Parses the  light node of type spot
     * @param {light omni} lightNode
     */
    parseSpotLight(lightNode) {
        //retrieve id of the light
        let lightID = this.parseString(lightNode, "id");
        let messageError = "Spot ligh with id " + lightID + ": ";

        //check light id
        if (lightID === "")
            throw "Spot id must not be empty";
        else if (this.lights[lightID] !== undefined)
            throw messageError + "id is already in use";

        // Light enable/disable
        let enableLight = true;
        let aux = this.reader.getBoolean(lightNode, 'enabled');
        if (!(aux != null && !isNaN(aux) && (aux == true || aux == false))) {
            this.onXMLMinorError(messageError + "unable to parse value component of the enable light field; assuming 'value = 1'");
            enableLight = 1;
        } else {
            enableLight = aux;
        }

        //parse angle
        let angle = this.parseFloat(lightNode, "angle", messageError);

        //check angle value
        if (angle <= 0) {
            this.onXMLMinorError(messageError + "light angle should be bigger than 0; setting angle to 0.1");
            angle = 0.1;
        } else if (angle > 180) {
            this.onXMLMinorError(messageError + "light angle should be smaller or equal to 180, setting angle to 180");
            angle = 180;
        }

        //parse expoent
        let exponent = this.parseFloat(lightNode, "exponent", messageError);

        let lightNodes = lightNode.children;

        //check if light has a valid number of coords
        if (lightNodes.length > 6)
            throw messageError + "invalid number of lights nodes";

        let nodeNames = [];
        for (var j = 0; j < lightNodes.length; j++) {
            nodeNames.push(lightNodes[j].nodeName);
        }

        let locationIndex, targetIndex, ambientIndex, diffuseIndex, specularIndex, attenuationIndex;
        // check if location,target, ambient, diffuse, specular and attenuation tag exist

        if ((locationIndex = nodeNames.indexOf("location")) === -1)
            throw messageError + "location tag is missing";
        else if ((targetIndex = nodeNames.indexOf("target")) === -1)
            throw messageError + "target tag is missing";
        else if ((ambientIndex = nodeNames.indexOf("ambient")) === -1)
            throw messageError + "ambient tag is missing";
        else if ((diffuseIndex = nodeNames.indexOf("diffuse")) === -1)
            throw messageError + "diffuse tag is missing";
        else if ((specularIndex = nodeNames.indexOf("specular")) === -1)
            throw messageError + "specular tag is missing";

        //parse light nodes
        let location = this.parseCoordinates4D(lightNodes[locationIndex], messageError);
        let target = this.parseCoordinates3D(lightNodes[targetIndex], messageError);
        let ambient = this.parseColor(lightNodes[ambientIndex], messageError);
        let diffuse = this.parseColor(lightNodes[diffuseIndex], messageError);
        let specular = this.parseColor(lightNodes[specularIndex], messageError);

        //parse attenuation attribute
        let attenuation, constant, linear, quadratic;
        if ((attenuationIndex = nodeNames.indexOf("attenuation")) !== -1) {
            constant = this.parseFloat(lightNodes[attenuationIndex], "constant", messageError);
            linear = this.parseFloat(lightNodes[attenuationIndex], "linear", messageError);
            quadratic = this.parseFloat(lightNodes[attenuationIndex], "quadratic", messageError);

            if (constant === 0 && linear === 0 && quadratic === 0) {
                throw messageError + "one of the attenuation values must be greatter than zero";
            }
        } else {
            this.onXMLMinorError(messageError + "attenuation tag is missing, assuming constant attenuation");
            constant = 1;
            linear = 0;
            quadratic = 0;
        }

        attenuation = {
            constant,
            linear,
            quadratic
        }
        // save the information related to the light
        const light = {
            type: "omni",
            lightID,
            enableLight,
            angle,
            exponent,
            location,
            target,
            ambient,
            diffuse,
            specular,
            attenuation
        }

        //save the lights of type spot
        this.lights[light.lightID] = light;
    }


    /**
     * Regex to check if a path is absolute
     * @param {path} path
     */
    isPathAbsolute(path) {
        return /^(?:\/|[a-z]+:\/\/)/.test(path);
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        this.textures = []; // references to all the texture objects
        let textures = texturesNode.children;

        let texture_nr = 0;

        //parse textures
        for (; texture_nr < textures.length; ++texture_nr) {
            if (textures[texture_nr].nodeName !== 'texture') {
                this.onXMLMinorError("Textures: unknown tag <" + textures[texture_nr].nodeName + ">");
                continue;
            } else this.parseTexture(textures[texture_nr]);
        }

        //check if there is at least one texture defined
        if (texture_nr === 0) {
            throw "At least one texture must be defined";
        }

        this.log("Parsed Textures");
    }

    /**
     * Parses the a texture
     * @param {textures block element} texturesNode
     */
    parseTexture(textureNode) {
        // retrieve the if
        let textureID = this.parseString(textureNode, "id");
        let messageError = "Texture with id " + textureID + ": ";

        //check texture id
        if (textureID === "")
            throw "Texture id must not be empty";
        else if (this.textures[textureID] !== undefined)
            throw messageError + "id is already in use";

        let path = this.parseString(textureNode, "file", messageError);

        //check if path is absolute
        if (this.isPathAbsolute(path)) {
            throw messageError + "path must be relative";
        }

        const texture = {
            textureID,
            path
        }
        // save the texture
        this.textures[texture.textureID] = texture;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        this.materials = []; // has reference to all the material objects
        let materials = materialsNode.children;

        let material_nr = 0;
        //parse the materials
        for (; material_nr < materials.length; ++material_nr) {
            if (materials[material_nr].nodeName !== 'material') {
                this.onXMLMinorError("Materials: unknown tag <" + materials[material_nr].nodeName + ">");
                continue;
            } else this.parseMaterial(materials[material_nr]);
        }
        //should have at least one material
        if (material_nr === 0) {
            throw "At least one material must be defined";
        }

        this.log("Parsed Materials");
    }

    /**
     * Parses one material
     * @param {material to parse} materialsNode
     */
    parseMaterial(materialNode) {
        //retrieve the id of the material
        let materialID = this.parseString(materialNode, "id");
        let messageError = "Material with id " + materialID + ": ";

        //check material id
        if (materialID === "")
            throw "Material id must not be empty";
        else if (this.materials[materialID] !== undefined)
            throw messageError + "id is already in use";

        let shininess = this.parseFloat(materialNode, "shininess", messageError);

        let materialNodes = materialNode.children;

        //check if material has a valid number of coords
        if (materialNodes.length > 4)
            throw messageError + "invalid number of material nodes";

        let nodeNames = [];
        for (var j = 0; j < materialNodes.length; j++) {
            nodeNames.push(materialNodes[j].nodeName);
        }


        let emissionIndex, ambientIndex, diffuseIndex, specularIndex;
        // check if emission, ambient, diffuse and specular tag exists
        if ((emissionIndex = nodeNames.indexOf("emission")) === -1)
            throw messageError + "emission tag is missing";
        else if ((ambientIndex = nodeNames.indexOf("ambient")) === -1)
            throw messageError + "ambient tag is missing";
        else if ((diffuseIndex = nodeNames.indexOf("diffuse")) === -1)
            throw messageError + "diffuse tag is missing";
        else if ((specularIndex = nodeNames.indexOf("specular")) === -1)
            throw messageError + "specular tag is missing";

        //parse material nodes
        let emission = this.parseColor(materialNodes[emissionIndex], messageError);
        let ambient = this.parseColor(materialNodes[ambientIndex], messageError);
        let diffuse = this.parseColor(materialNodes[diffuseIndex], messageError);
        let specular = this.parseColor(materialNodes[specularIndex], messageError);

        const material = {
            materialID,
            shininess,
            emission,
            ambient,
            diffuse,
            specular
        }

        // save the material
        this.materials[material.materialID] = material;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        this.transformations = []; // save all the transformations
        let transformations = transformationsNode.children;

        let transformation_nr = 0;
        // parse transformation
        for (; transformation_nr < transformations.length; ++transformation_nr) {
            if (transformations[transformation_nr].nodeName !== 'transformation') {
                this.onXMLMinorError("Transformations: unknown tag <" + transformations[transformation_nr].nodeName + ">");
                continue;
            } else this.parseTransformation(transformations[transformation_nr]);
        }

        // check if there is  at least one transformation
        if (transformation_nr === 0) {
            throw "At least one transformation must be defined";
        }

        this.log("Parsed Transformations");
    }

    /**
     * Parses one transformation
     * @param {transformation element} transformationNode
     */
    parseTransformation(transformationNode) {
        //retrieve the id of the transformation
        let transformationID = this.parseString(transformationNode, "id");
        let messageError = "Transformation with id " + transformationID + ": ";

        //check tranformation id
        if (transformationID === "")
            throw "Transformation id must not be empty";
        else if (this.transformations[transformationID] !== undefined)
            throw messageError + "id is already in use";

        const transformation = {
            transformationID,
            transformations: []
        }

        let transformationNodes = transformationNode.children;
        // parse the type of transformation
        let aux;
        for (let i = 0; i < transformationNodes.length; ++i) {
            if (transformationNodes[i].nodeName === "translate") {
                aux = this.parseTranslate(transformationNodes[i], messageError);
            } else if (transformationNodes[i].nodeName === "rotate") {
                aux = this.parseRotate(transformationNodes[i], messageError);
            } else if (transformationNodes[i].nodeName === "scale") {
                aux = this.parseScale(transformationNodes[i], messageError);
            } else {
                this.onXMLMinorError(messageError + "unknown tag <" + transformationNodes[i].nodeName + ">");
                continue;
            }

            transformation.transformations.push(aux);
        }

        //it should have some type of transformation
        if (transformation.transformations.length === 0) {
            throw messageError + "transformation is empty";
        }

        // save the transformation values
        this.transformations[transformation.transformationID] = transformation;
    }

    /**
     * Parses type of transformation- translate
     * @param {transformation element} translateNode
     * @param {message to send if there is an error} messageError
     */
    parseTranslate(translateNode, messageError) {
        const translate = this.parseCoordinates3D(translateNode, messageError);
        translate.type = "translate";

        return translate;
    }

    /**
     * Parses type of transformation- rotation
     * @param {transformation element} rotateNode
     * @param {message to send if there is an error} messageError
     */
    parseRotate(rotateNode, messageError) {
        let axis = this.parseString(rotateNode, "axis", messageError);
        if (axis !== "x" && axis !== "y" && axis !== "z") {
            throw messageError + "rotate transformation with invalid axis (must be 'x', 'y' or 'z')";
        }

        let angle = this.parseFloat(rotateNode, "angle", messageError);

        const rotate = {
            type: "rotate",
            axis,
            angle
        }

        return rotate;
    }

    /**
     * Parses all the rotations
     * @param {rotation element} rotateNode
     * @param {message to send if there is an error} messageError
     */
    parseRotateAllTogether(rotateNode, messageError) {

        let angle_x = this.parseFloat(rotateNode, "angle_x", messageError);
        let angle_y = this.parseFloat(rotateNode, "angle_y", messageError);
        let angle_z = this.parseFloat(rotateNode, "angle_z", messageError);


        const rotate = {
            type: "rotate",
            angle_x,
            angle_y,
            angle_z
        }
        return rotate;
    }

    /**
     * Parses type of transformation- translate
     * @param {transformation element} scaleNode
     * @param {message to send if there is an error} messageError
     */
    parseScale(scaleNode, messageError) {
        const scale = this.parseCoordinates3D(scaleNode, messageError);
        scale.type = "scale";

        return scale;
    }

    /**
     * Parses the <animation> block
     * @param {animation block element} animationsNode
     */
    parseAnimations(animationsNode) {
        this.animations = [];
        let animations = animationsNode.children;

        let animation_nr = 0;
        /*parsing all the animations */
        for (; animation_nr < animations.length; ++animation_nr) {
            if (animations[animation_nr].nodeName !== 'animation') {
                this.onXMLMinorError("Animations: unknown tag <" + animations[animation_nr].nodeName + ">");
                continue;
            } else this.parseAnimation(animations[animation_nr]);
        }

        this.log("Parsed Animations");
    }

    
    /**
     * Parses one animation
     * @param {animation element} animationsNode
     */
    parseAnimation(animationNode) {
        let animationID = this.parseString(animationNode, "id");
        let messageError = "Animation with id " + animationID + ": ";

        /*validating the animationId */
        if (animationID === "")
            throw "Animation id must not be empty";
        else if (this.animations[animationID] !== undefined)
            throw messageError + "id is already in use";

        let animation = {
            animationID,
            keyframes: []
        };

        /*checking all the keyframes */
        let keyframesNodes = animationNode.children;
        if (!keyframesNodes.length) {
            throw messageError + "there should be at least one keyframe defined";
        }

        for (let i = 0; i < keyframesNodes.length; ++i) {
            var aux;
            if (keyframesNodes[i].nodeName === "keyframe") {
                aux = this.parseKeyframe(keyframesNodes[i], messageError);
            } else {
                this.onXMLMinorError(messageError + "unknown tag <" + keyframesNodes[i].nodeName + ">");
                continue;
            }
            
            let instantsArr = animation.keyframes.map(function(item){ return item.instant });
            let isDuplicate = (instantsArr.indexOf(aux.instant) !== -1) ? true : false;

            /*checking duplicate */
            if(!isDuplicate){
                animation.keyframes.push(aux);
            } else this.onXMLMinorError(messageError + "keyframe instant repeated, ignoring keyframe")
        }

        if (animation.keyframes.length === 0) {
            throw messageError + "animation is empty";
        }

        this.animations[animation.animationID] = animation;
    }

    
    /**
     * Parses one keyframe of an animation
     * @param {keyframe element} keyframeNode
     * @param {message to send if there is an error} messageError
     */
    parseKeyframe(keyframeNode, messageError) {
        let instant = this.parseFloat(keyframeNode, "instant");
        let transformations = keyframeNode.children;
        /*Parse the transformations associated to a keyframe */

        if (transformations.length != 3) {
            throw messageError + "there should be three tags inside the keyframes that are related to the possible transformations in the animation";
        }

        let nodeNames = [];
        for (let j = 0; j < transformations.length; j++) {
            nodeNames.push(transformations[j].nodeName);
        }

        let translateIndex, rotateIndex, scaleIndex;

        if ((translateIndex = nodeNames.indexOf("translate")) === -1)
            throw messageError + "translate tag is missing";
        else if ((rotateIndex = nodeNames.indexOf("rotate")) === -1)
            throw messageError + "rotate tag is missing";
        else if ((scaleIndex = nodeNames.indexOf("scale")) === -1)
            throw messageError + "scale tag is missing";

        let translate = this.parseTranslate(transformations[translateIndex], messageError);
        let rotate = this.parseRotateAllTogether(transformations[rotateIndex], messageError);
        let scale = this.parseScale(transformations[scaleIndex], messageError);

        return {
            instant,
            translate,
            rotate,
            scale
        };
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        this.primitives = []; // to save primitives
        let primitives = primitivesNode.children;
        this.hasBoardPrimitive = false;

        let primitive_nr = 0;

        // parse the primitives
        for (; primitive_nr < primitives.length; ++primitive_nr) {
            if (primitives[primitive_nr].nodeName !== 'primitive') {
                this.onXMLMinorError("Primitives: unknown tag <" + primitives[primitive_nr].nodeName + ">");
                continue;
            } else this.parsePrimitive(primitives[primitive_nr]);
        }

        //there should be a board in the game
        if (this.hasBoardPrimitive === false) {
            throw "There should be a board primitive defined";
        }

        //check if there is at least one primitive
        if (primitive_nr === 0) {
            throw "At least one primitive must be defined";
        }

        this.log("Parsed Primitives");
    }

    /**
     * Parses the <primitives> block.
     * @param {primitive element} primitiveNode
     */
    parsePrimitive(primitiveNode) {
        //retrieve element
        let primitiveID = this.parseString(primitiveNode, "id");
        let messageError = "Primitive with id " + primitiveID + ": ";

        //check primitive id
        if (primitiveID === "")
            throw "Primitive id must not be empty";
        else if (this.primitives[primitiveID] !== undefined)
            throw messageError + "id is already in use";

        let primitiveNodes = primitiveNode.children;

        //check if primitve has a valid number of coords
        if (primitiveNodes.length > 1)
            throw messageError + "invalid number of primitive nodes";

        let primitive;
        let node = primitiveNodes[0];
        // check what type of primitive it is
        if (node.nodeName === "rectangle")
            primitive = this.parseRectangle(node, messageError);
        else if (node.nodeName === "triangle")
            primitive = this.parseTriangle(node, messageError);
        else if (node.nodeName === "cylinder") {
            primitive = this.parseCylinder(node, messageError);
            primitive.type = "cylinder";
        } else if (node.nodeName === "sphere")
            primitive = this.parseSphere(node, messageError);
        else if (node.nodeName === "torus")
            primitive = this.parseTorus(node, messageError);
        else if (node.nodeName === "plane")
            primitive = this.parsePlane(node, messageError);
        else if (node.nodeName === "patch")
            primitive = this.parsePatch(node, messageError);
        else if (node.nodeName === "cylinder2") {
            primitive = this.parseCylinder(node, messageError);
            primitive.type = "cylinder2";
        } else if(node.nodeName === "gameboard") {
            primitive = this.parseBoard(node, messageError);
            this.hasBoardPrimitive = true;
        }
        else if (node.nodeName === "timer") {
            primitive = this.parseTimer(node, messageError);
        }
        else if (node.nodeName === "scoreboard") {
            primitive = this.parseScoreBoard(node, messageError);
        }
        else if(node.nodeName === "cubeMap") {
            primitive = this.parseCubeMap(node, messageError);
        }
        else if (node.nodeName === "sky") {
            primitive = this.parsesky(node, messageError);
        }
        else if (node.nodeName === "water") {
            primitive = this.parseWater(node, messageError);
        }
        else {
            this.onXMLMinorError(messageError + "unknown tag <" + node.nodeName + ">");
            return;
        }

        //save the primitive id
        primitive.primitiveID = primitiveID;
        
        this.primitives[primitive.primitiveID] = primitive;
    }


    parseWater(node, messageError) {
        let size = this.parseFloat(node, "size", messageError);
        let heightMap = this.parseString(node,"height", messageError);
        let color = this.parseString(node, "color", messageError);

        return {
        
            type:"water",
            heightMap:heightMap,
            size,
            color
        }
    }


    parsesky(node, messageError) {
        let heightMap = this.parseString(node,"height", messageError);
        let colorMap = this.parseString(node, "colorMap", messageError);
        let size = this.parseFloat(node, "size", messageError);

        return {
            type:"sky",
            heightMap:heightMap,
            colorMap: colorMap,
            size
        };

    }


    parseCubeMap(node, messageError) {
        let folderPath = this.parseString(node, "folderPath", messageError);
        let size = this.parseFloat(node, "size", messageError);

        return {
            type:"cubeMap",
            folderPath:folderPath,
            size:size
        }
    }
  
    parseScoreBoard(node, messageError) {

        return {
            type: "scoreboard"

        };
    }

    
    /**
     * Parses the timer
     * @param {gameboard element} boardNode
     * @param {message to send if there is an error} messageError
     */
    parseTimer(timerNode, messageError) {

        return {
            type: "timer",

        };
    }


    /**
     * Parses the primitive gameboard
     * @param {gameboard element} boardNode
     * @param {message to send if there is an error} messageError
     */
    parseBoard(boardNode, messageError) {
        let texture = this.parseString(boardNode, "texture", messageError);

        return {
            type: "gameboard",
            texture
        };
    }

    /**
     * Parses the primitive rectangle
     * @param {rectangle element} rectangleNode
     * @param {message to send if there is an error} messageError
     */
    parseRectangle(rectangleNode, messageError) {
        let x1 = this.parseFloat(rectangleNode, "x1", messageError);
        let y1 = this.parseFloat(rectangleNode, "y1", messageError);
        let x2 = this.parseFloat(rectangleNode, "x2", messageError);
        let y2 = this.parseFloat(rectangleNode, "y2", messageError);

        return {
            type: "rectangle",
            x1,
            y1,
            x2,
            y2
        };
    }

    /**
     * Parses the primitive triangle
     * @param {triangle element} triangleNode
     * @param {message to send if there is an error} messageError
     */
    parseTriangle(triangleNode, messageError) {
        let x1 = this.parseFloat(triangleNode, "x1", messageError);
        let y1 = this.parseFloat(triangleNode, "y1", messageError);
        let z1 = this.parseFloat(triangleNode, "z1", messageError);
        let x2 = this.parseFloat(triangleNode, "x2", messageError);
        let y2 = this.parseFloat(triangleNode, "y2", messageError);
        let z2 = this.parseFloat(triangleNode, "z2", messageError);
        let x3 = this.parseFloat(triangleNode, "x3", messageError);
        let y3 = this.parseFloat(triangleNode, "y3", messageError);
        let z3 = this.parseFloat(triangleNode, "z3", messageError);

        return {
            type: "triangle",
            x1,
            y1,
            z1,
            x2,
            y2,
            z2,
            x3,
            y3,
            z3
        }
    }

    /**
     * Parses the primitive cylinder
     * @param {cylinder element} cylinderNode
     * @param {message to send if there is an error} messageError
     */
    parseCylinder(cylinderNode, messageError) {
        let base = this.parseFloat(cylinderNode, "base", messageError);
        let top = this.parseFloat(cylinderNode, "top", messageError);
        let height = this.parseFloat(cylinderNode, "height", messageError);
        let slices = this.parseFloat(cylinderNode, "slices", messageError);
        let stacks = this.parseFloat(cylinderNode, "stacks", messageError);

        if (height < 0) {
            throw messageError + "height must be a positive number";
        } else if (top < 0) {
            throw messageError + "top must be a positive number";
        } else if (base < 0) {
            throw messageError + "base must be a positive number";
        } else if (slices < 3) {
            this.onXMLMinorError(messageError + "should have at least 3 slices");
        } else if (stacks < 1) {
            this.onXMLMinorError(messageError + "should have at least 1 stacks");
        }

        return {
            base,
            top,
            height,
            slices,
            stacks
        }
    }

    /**
     * Parses the primitive sphere
     * @param {sphere element} sphereNode
     * @param {message to send if there is an error} messageError
     */
    parseSphere(sphereNode, messageError) {
        let radius = this.parseFloat(sphereNode, "radius", messageError);
        let slices = this.parseFloat(sphereNode, "slices", messageError);
        let stacks = this.parseFloat(sphereNode, "stacks", messageError);

        if (radius < 0) {
            throw messageError + "radius must be a positive number";
        } else if (slices < 3) {
            this.onXMLMinorError(messageError + "should have at least 3 slices");
        } else if (stacks < 1) {
            this.onXMLMinorError(messageError + "should have at least 1 stack");
        }

        return {
            type: "sphere",
            radius,
            slices,
            stacks
        }
    }

    /**
     * Parses the primitive torus
     * @param {torus element} torusNode
     * @param {message to send if there is an error} messageError
     */
    parseTorus(torusNode, messageError) {
        let inner = this.parseFloat(torusNode, "inner", messageError);
        let outer = this.parseFloat(torusNode, "outer", messageError);
        let slices = this.parseFloat(torusNode, "slices", messageError);
        let loops = this.parseFloat(torusNode, "loops", messageError);

        if (inner < 0) {
            throw messageError + "inner radius must be a positive number";
        } else if (outer < 0) {
            throw messageError + "outer radius must be a positive number";
        } else if (slices < 2) {
            this.onXMLMinorError(messageError + "should have at least 2 slices");
        } else if (loops < 3) {
            this.onXMLMinorError(messageError + "should have at least 3 loops");
        }

        return {
            type: "torus",
            inner,
            outer,
            slices,
            loops
        }
    }

    /**
     * Parses the primitive plane
     * @param {plane element} planeNode
     * @param {message to send if there is an error} messageError
     */
    parsePlane(planeNode, messageError) {
        let npartsU = this.parseInt(planeNode, "npartsU", messageError);
        let npartsV = this.parseInt(planeNode, "npartsV", messageError);

        /*check for error */
        if (npartsU < 1) {
            throw messageError + "npartsU must be greater or equal to 1";
        } else if (npartsV < 1) {
            throw messageError + "npartsV must be greater or equal to 1";
        }

        return {
            type: "plane",
            npartsU,
            npartsV
        }
    }

    /**
     * Parses the primitive patch
     * @param {patch element} planeNode
     * @param {message to send if there is an error} messageError
     */
    parsePatch(patchNode, messageError) {
        let npointsU = this.parseInt(patchNode, "npointsU", messageError);
        let npointsV = this.parseInt(patchNode, "npointsV", messageError);
        let npartsU = this.parseInt(patchNode, "npartsU", messageError);
        let npartsV = this.parseInt(patchNode, "npartsV", messageError);

        /*check for error */
        if (npointsU < 1) {
            throw messageError + "npointsU must be greater or equal to 1";
        } else if (npointsV < 1) {
            throw messageError + "npointsV must be greater or equal to 1";
        } else if (npartsU < 1) {
            throw messageError + "npartsU must be greater or equal to 1";
        } else if (npartsV < 1) {
            throw messageError + "npartsV must be greater or equal to 1";
        }

        let controlpoints = patchNode.children;
        let cp = [];

        /*parse controlpoints */
        for (let controlpointNode of controlpoints) {
            if (controlpointNode.nodeName === "controlpoint") {
                let xx = this.parseFloat(controlpointNode, "xx", messageError);
                let yy = this.parseFloat(controlpointNode, "yy", messageError);
                let zz = this.parseFloat(controlpointNode, "zz", messageError);
                cp.push({
                    xx,
                    yy,
                    zz
                });
            } else {
                this.onXMLMinorError(messageError + "unknown tag <" + controlpointNode.nodeName + ">");
            }
        }

        let numPoints = npointsU * npointsV;
        if (cp.length !== numPoints) {
            throw messageError + "patch must have exactly " + numPoints + " control points";
        }

        return {
            type: "patch",
            npointsU,
            npointsV,
            npartsU,
            npartsV,
            controlpoints: cp
        }
    }

    /**
     * Parses the <components> block.
     * @param {components block element} componentsNode
     */
    parseComponents(componentsNode) {
        this.components = []; // to save the components
        this.childComponentIds = new Set(); // to dont have repeated elements
        let components = componentsNode.children;

        let component_nr = 0;

        //parse the components
        for (; component_nr < components.length; ++component_nr) {
            if (components[component_nr].nodeName !== 'component') {
                this.onXMLMinorError("Components: unknown tag <" + components[component_nr].nodeName + ">");
                continue;
            } else this.parseComponent(components[component_nr]);
        }

        //there should be at least one component
        if (component_nr === 0) {
            throw "At least one component must be defined";
        }

        // the componenet with idRoot should be defined to know where the rootScene is
        if (this.components[this.idRoot] === undefined) {
            throw "Root component with id " + this.idRoot + " is missing";
        }

        if (component_nr < this.childComponentIds.length) {
            throw "Some component ids were not found";
        }

        //check if they were all defined
        for (let id of this.childComponentIds) {
            if (this.components[id] === undefined) {
                throw "Component with id " + id + " was not defined";
            }
        }

        this.log("Parsed Components");
    }

    /**
     * Parses the a component
     * @param {component element} componentNode
     */
    parseComponent(componentNode) {
        //retrieve the id
        let componentID = this.parseString(componentNode, "id");
        let messageError = "Component with id " + componentID + ": ";

        if (componentID === "")
            throw "Component id must not be empty";
        else if (this.components[componentID] !== undefined)
            throw messageError + "id is already in use";

        let componentNodes = componentNode.children;

        if (componentNodes.length > 5)
            throw messageError + "invalid number of component nodes";

        let nodeNames = [];
        for (var j = 0; j < componentNodes.length; j++) {
            nodeNames.push(componentNodes[j].nodeName);
        }

        let transformationIndex, materialIndex, textureIndex, childrenIndex, animationIndex;
        // check if the tags transformation, materuals, texture and children are not missing
        if ((transformationIndex = nodeNames.indexOf("transformation")) === -1)
            throw messageError + "transformation tag is missing";
        else if ((materialIndex = nodeNames.indexOf("materials")) === -1)
            throw messageError + "materials tag is missing";
        else if ((textureIndex = nodeNames.indexOf("texture")) === -1)
            throw messageError + "texture tag is missing";
        else if ((childrenIndex = nodeNames.indexOf("children")) === -1)
            throw messageError + "children tag is missing";
        animationIndex = nodeNames.indexOf("animationref");

        // parse the transformation, materials and texture
        let transformation = this.parseComponentTransformation(componentNodes[transformationIndex], messageError);
        let materials = this.parseComponentMaterials(componentNodes[materialIndex], messageError);
        let texture = this.parseComponentTexture(componentNodes[textureIndex], messageError);
        let animation;

        if (animationIndex !== -1) {
            animation = this.parseString(componentNodes[animationIndex], "id", messageError);
            if (this.animations[animation] === undefined) {
                throw messageError + "animation with id " + animation + " is not defined";
            }
        }

        let primitiveIds = [];
        let componentIds = [];

        let childs = componentNodes[childrenIndex].children;

        // check if there is ate least one child defined
        if (childs.length === 0) {
            throw messageError + "at least one children must be defined";
        }

        //parse the components
        for (let child of childs) {
            if (child.nodeName === "componentref") {
                let childId = this.parseString(child, "id", messageError);
                if (childId === componentID) {
                    throw messageError + "component includes itself in its children";
                } else {
                    if (componentIds.indexOf(childId) !== -1) {
                        this.onXMLMinorError(messageError + "duplicate child component with id " + childId + ". It will be ignored");
                    } else {
                        componentIds.push(childId);
                        this.childComponentIds.add(childId);
                    }
                }
            } else if (child.nodeName === "primitiveref") {
                let childId = this.parseString(child, "id", messageError);
                if ((this.primitives[childId] === undefined)) {
                    throw messageError + "primitive child with id " + childId + " is not defined";
                } else {
                    if (primitiveIds.indexOf(childId) !== -1) {
                        this.onXMLMinorError(messageError + "duplicate child primitive with id " + childId + ". It will be ignored");
                    } else {
                        primitiveIds.push(childId);
                    }
                }
            } else {
                this.onXMLMinorError(messageError + "unknown tag <" + child.nodeName + ">");
            }
        }


        const component = {
            componentID,
            transformation,
            animation,
            materials,
            texture,
            children: {
                primitiveIds,
                componentIds
            }
        };
        // save the components
        this.components[component.componentID] = component;

        //console.log(this.components);
    }

    /**
     * Parses the transformation of a component
     * @param {component transformation element} componentTransformationNode
     * @param {message to send if there is an error} messageError
     */
    parseComponentTransformation(componentTransformationNode, messageError) {
        let foundTransformation = false;
        let transformationref = null;
        let transformations = [];

        let transf = componentTransformationNode.children;
        for (let transformation of transf) {
            if (transformation.nodeName === "transformationref") {
                //check if an explicit transformation was already defined
                if (foundTransformation) {
                    this.onXMLMinorError(messageError + "transformation has already been found, ignoring transformation references");
                    continue;
                }

                let transformationID = this.parseString(transformation, "id", messageError);
                //verify the existence of the transformation
                if ((this.transformations[transformationID] === undefined)) {
                    throw messageError + "transformation with id " + transformationID + " is not defined";
                } else if (transformations.length > 1) {
                    this.onXMLMinorError(messageError + "only one transformationref is allowed. Further references will be ignored");
                }
                transformationref = transformationID;
                //found transformationref, ignoring the the remaining nodes
                break;
            } else {
                let aux;
                if (transformation.nodeName === "translate") {
                    aux = this.parseTranslate(transformation);
                } else if (transformation.nodeName === "rotate") {
                    aux = this.parseRotate(transformation);
                } else if (transformation.nodeName === "scale") {
                    aux = this.parseScale(transformation);
                } else {
                    this.onXMLMinorError(messageError + "unknown tag <" + transformation.nodeName + ">");
                    continue;
                }

                foundTransformation = true;
                transformations.push(aux);
            }
        }

        return {
            transformationref,
            transformations
        }
    }

    /**
     * Parses the materials of a component
     * @param {component materials element} componentMaterialsNode
     * @param {message to send if there is an error} messageError
     */
    parseComponentMaterials(componentMaterialsNode, messageError) {
        let materialIds = [];

        let mat = componentMaterialsNode.children;

        if (mat.length === 0) {
            throw messageError + "at least one material must be defined";
        }

        for (let material of mat) {
            if (material.nodeName !== "material") {
                this.onXMLMinorError(messageError + "unknown tag <" + material.nodeName + ">");
            } else {
                let materialId = this.parseString(material, "id", messageError);

                if ((this.materials[materialId] === undefined) && materialId !== "inherit") {
                    throw messageError + "material with id " + materialId + " is not defined";
                }

                materialIds.push(materialId);
            }
        }

        return materialIds;
    }

    /**
     * Parses the texture of a component
     * @param {component texture element} componentTextureNode
     * @param {message to send if there is an error} messageError
     */
    parseComponentTexture(componentTextureNode, messageError) {
        let textureId = this.parseString(componentTextureNode, "id", messageError);

        if ((this.textures[textureId] === undefined) && textureId !== "inherit" && textureId !== "none") {
            throw messageError + "texture with id " + textureId + " is not defined";
        }

        let length_s, length_t;
        if (textureId !== "inherit" && textureId !== "none") {
            length_s = this.parseFloat(componentTextureNode, "length_s", messageError);
            length_t = this.parseFloat(componentTextureNode, "length_t", messageError);
        }

        if (textureId === "inherit" || textureId === "none") {
            if (this.reader.hasAttribute(componentTextureNode, "length_s") || this.reader.hasAttribute(componentTextureNode, "length_t")) {
                throw messageError + "length_s and length_t should not be included in the statement if id = inherit or none";
            }
        }

        // return its information
        return {
            textureId,
            length_s,
            length_t
        }
    }

    parsePieces(piecesNode) {
        const piece_green = piecesNode.querySelector("piece_green");
        if (piece_green) {
            this.piece_green = this.parsePiece(piece_green, "green");
        } else {
            this.onXMLMinorError("Custom green piece was not defined in pieces node, using default piece");
        }
        const piece_yellow = piecesNode.querySelector("piece_yellow");
        if (piece_yellow) {
            this.piece_yellow = this.parsePiece(piece_yellow, "yellow");
        } else {
            this.onXMLMinorError("Custom yellow piece was not defined in pieces node, using default piece");
        }

        this.log("Parsed Pieces");
    }

    /**
     * Parses the a component
     * @param {component element} componentNode
     */
    parsePiece(pieceNode, color) {
        let messageError = "Piece " + color + ": ";
        let pieceNodes = pieceNode.children;

        if (pieceNodes.length > 4)
            throw messageError + "invalid number of piece nodes";

        let nodeNames = [];
        for (var j = 0; j < pieceNodes.length; j++) {
            nodeNames.push(pieceNodes[j].nodeName);
        }

        let transformationIndex, materialIndex, textureIndex, primitiveIndex;
        // check if the tags transformation, materuals, texture and children are not missing
        if ((transformationIndex = nodeNames.indexOf("transformation")) === -1)
            throw messageError + "transformation tag is missing";
        else if ((materialIndex = nodeNames.indexOf("material")) === -1)
            throw messageError + "materials tag is missing";
        else if ((textureIndex = nodeNames.indexOf("texture")) === -1)
            throw messageError + "texture tag is missing";
        else if ((primitiveIndex = nodeNames.indexOf("primitive")) === -1)
            throw messageError + "primitive tag is missing";

        // parse the transformation, materials and texture
        let transformation = this.parsePieceTransformation(pieceNodes[transformationIndex], messageError);
        let material = this.parsePieceMaterial(pieceNodes[materialIndex], messageError);
        let texture = this.parsePieceTexture(pieceNodes[textureIndex], messageError);
        let primitive = this.parsePiecePrimitive(pieceNodes[primitiveIndex], messageError);

        const piece = {
            transformation,
            material,
            texture,
            primitive
        };

        return piece;
    }

    parsePieceTransformation(pieceTransformationNode, messageError) {
        let foundTransformation = false;
        let transformationref = null;
        let transformations = [];

        let transf = pieceTransformationNode.children;
        for (let transformation of transf) {
            if (transformation.nodeName === "transformationref") {
                //check if an explicit transformation was already defined
                if (foundTransformation) {
                    this.onXMLMinorError(messageError + "transformation has already been found, ignoring transformation references");
                    continue;
                }

                let transformationID = this.parseString(transformation, "id", messageError);
                //verify the existence of the transformation
                if ((this.transformations[transformationID] === undefined)) {
                    throw messageError + "transformation with id " + transformationID + " is not defined";
                } else if (transformations.length > 1) {
                    this.onXMLMinorError(messageError + "only one transformationref is allowed. Further references will be ignored");
                }
                transformationref = transformationID;
                //found transformationref, ignoring the the remaining nodes
                break;
            } else {
                let aux;
                if (transformation.nodeName === "translate") {
                    aux = this.parseTranslate(transformation);
                } else if (transformation.nodeName === "rotate") {
                    aux = this.parseRotate(transformation);
                } else if (transformation.nodeName === "scale") {
                    aux = this.parseScale(transformation);
                } else {
                    this.onXMLMinorError(messageError + "unknown tag <" + transformation.nodeName + ">");
                    continue;
                }

                foundTransformation = true;
                transformations.push(aux);
            }
        }

        return {
            transformationref,
            transformations
        }
    }

    parsePieceMaterial(pieceMaterialsNode, messageError) {
        let materialId = this.parseString(pieceMaterialsNode, "id", messageError);

        if (this.materials[materialId] === undefined) {
            throw messageError + "material with id " + materialId + " is not defined";
        }

        return materialId;
    }

    parsePieceTexture(pieceTextureNode, messageError) {
        let textureId = this.parseString(pieceTextureNode, "id", messageError);

        if ((this.textures[textureId] === undefined) && textureId !== "none") {
            throw messageError + "texture with id " + textureId + " is not defined";
        }

        let length_s, length_t;
        if (textureId !== "none") {
            length_s = this.parseFloat(pieceTextureNode, "length_s", messageError);
            length_t = this.parseFloat(pieceTextureNode, "length_t", messageError);
        }

        if (textureId === "none") {
            if (this.reader.hasAttribute(pieceTextureNode, "length_s") || this.reader.hasAttribute(pieceTextureNode, "length_t")) {
                throw messageError + "length_s and length_t should not be included in the statement if id = inherit or none";
            }
        }

        // return its information
        return {
            textureId,
            length_s,
            length_t
        }
    }

    parsePiecePrimitive(piecePrimitiveNode, messageError) {
        let primitiveID = this.parseString(piecePrimitiveNode, "id", messageError);
        
        if ((this.primitives[primitiveID] === undefined)) {
            throw messageError + "primitive child with id " + primitiveID + " is not defined";
        }

        return primitiveID;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var x = this.parseFloat(node, "x", messageError);
        var y = this.parseFloat(node, "y", messageError);
        var z = this.parseFloat(node, "z", messageError);

        return {
            x,
            y,
            z
        };
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        let position = this.parseCoordinates3D(node, messageError);

        let w = this.parseFloat(node, "w", messageError);
        position.w = w;

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError = "") {
        var r = this.parseFloat(node, "r", messageError);
        var g = this.parseFloat(node, "g", messageError);
        var b = this.parseFloat(node, "b", messageError);
        var a = this.parseFloat(node, "a", messageError);

        if (r < 0) {
            this.onXMLMinorError(messageError + node.nodeName + " red attribute must be in the range [0, 1]; assuming value 0");
            r = 0;
        } else if (r > 1) {
            this.onXMLMinorError(messageError + node.nodeName + " red attribute must be in the range [0, 1]; assuming value 1");
            r = 1;
        } else if (g < 0) {
            this.onXMLMinorError(messageError + node.nodeName + " green attribute must be in the range [0, 1]; assuming value 0");
            g = 0;
        } else if (g > 1) {
            this.onXMLMinorError(messageError + node.nodeName + " green attribute must be in the range [0, 1]; assuming value 1");
            g = 1;
        } else if (b < 0) {
            this.onXMLMinorError(messageError + node.nodeName + " blue attribute must be in the range [0, 1]; assuming value 0");
            b = 0;
        } else if (b > 1) {
            this.onXMLMinorError(messageError + node.nodeName + " blue attribute must be in the range [0, 1]; assuming value 1");
            b = 1;
        } else if (a < 0) {
            this.onXMLMinorError(messageError + node.nodeName + " alpha attribute must be in the range [0, 1]; assuming value 0");
            a = 0;
        } else if (a > 1) {
            this.onXMLMinorError(messageError + node.nodeName + " alpha attribute must be in the range [0, 1]; assuming value 1");
            a = 1;
        }

        return {
            r,
            g,
            b,
            a
        };
    }


    /**
     * Parse the float component from a node
     * @param {block element} node
     * @param {attribute float to be parsed } attribute
     * @param {message to be displayed in case of error} messageError
     * @param {default value in case the attribute value is not valid} defaultValue
     */
    parseFloat(node, attribute, messageError = "", defaultValue) {
        let node_name = node.nodeName;

        if (!this.reader.hasAttribute(node, attribute)) {
            //check if default value was not defined
            if (defaultValue === undefined)
                throw messageError + node_name + " " + attribute + " attribute is not defined";
            else {
                this.onXMLMinorError(messageError + "unable to parse value of the " + attribute + " from " + node_name + "; assuming value " + defaultValue);
                return defaultValue;
            }
        }

        let attr = this.reader.getFloat(node, attribute);
        if (isNaN(attr)) {
            throw messageError + node_name + " " + attribute + " attribute is not a number";
        }

        return attr;
    }

    /**
     * Parse the integer component from a node
     * @param {block element} node
     * @param {attribute float to be parsed } attribute
     * @param {message to be displayed in case of error} messageError
     * @param {default value in case the attribute value is not valid} defaultValue
     */
    parseInt(node, attribute, messageError = "", defaultValue) {
        let attr = this.parseFloat(node, attribute, messageError, defaultValue);

        if (!Number.isInteger(attr)) {
            throw messageError + node.nodeName + " " + attribute + " attribute is not an integer";
        }

        return attr;
    }

    /**
     * Parse the integer component from a node
     * @param {block element} node
     * @param {attribute float to be parsed } attribute
     * @param {message to be displayed in case of error} messageError
     * @param {default value in case the attribute value is not valid} defaultValue
     */
    parseString(node, attribute, messageError = "") {
        if (!this.reader.hasAttribute(node, attribute)) {
            throw messageError + node.nodeName + " " + attribute + " attribute is not defined";
        }

        return this.reader.getString(node, attribute);
    }

    /** 
     * Callback to be executed on any read error, showing an error on the console
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Constrcuts the graph based on the information that was parsed
     */
    constructGraph() {
        this.sceneComponents = [];
        this.scenePrimitives = [];

        //create primitives
        this.createPrimitives();

        //create components
        this.createComponents();

        //Setting component children
        for (var key in this.sceneComponents) {
            if (this.sceneComponents.hasOwnProperty(key)) {
                let childComponents = [];
                let childPrimitives = [];
                let component = this.components[key];
                for (let childComponent of component.children.componentIds) {
                    childComponents.push(childComponent);
                }
                for (let childPrimtive of component.children.primitiveIds) {
                    childPrimitives.push(childPrimtive);
                }
                this.sceneComponents[key].setChildren(childPrimitives, childComponents);
            }
        }
    }

    /**
     * Creates the objects that correspond to a primitive
     */
    createPrimitives() {
        for (var key in this.primitives) {
            if (this.primitives.hasOwnProperty(key)) {
                var primitive = this.primitives[key];

                let prim;
                switch (primitive.type) {
                    case "rectangle":
                        prim = new MyRectangle(this.scene, primitive.x1, primitive.x2, primitive.y1, primitive.y2);
                        break;
                    case "triangle":
                        prim = new MyTriangle(this.scene, primitive.x1, primitive.x2, primitive.x3, primitive.y1, primitive.y2, primitive.y3, primitive.z1, primitive.z2, primitive.z3);
                        break;
                    case "cylinder":
                        prim = new MyCylinder(this.scene, primitive.slices, primitive.stacks, primitive.height, primitive.base, primitive.top);
                        break;
                    case "sphere":
                        prim = new MySphere(this.scene, primitive.radius, primitive.slices, primitive.stacks);
                        break;
                    case "torus":
                        prim = new MyTorus(this.scene, primitive.inner, primitive.outer, primitive.slices, primitive.loops);
                        break;
                    case "plane":
                        prim = new MyPlane(this.scene, primitive.npartsU, primitive.npartsV);
                        break;
                    case "patch":
                        prim = new MyPatch(this.scene, primitive.npartsU, primitive.npartsV, primitive.npointsU, primitive.npointsV, primitive.controlpoints);
                        break;
                    case "cylinder2":
                        prim = new MyCylinder2(this.scene, primitive.base, primitive.top, primitive.height, primitive.slices, primitive.stacks);
                    case "gameboard":
                        prim = new Board(this.scene, primitive.texture);
                        break;
                    case "timer":
                        prim = new timer(this.scene);   
                    break;   
                    case "scoreboard":
                        prim = new ScoreBoard(this.scene);
                    break;
                    case "cubeMap":
                        prim = new cubeMap(this.scene, primitive.size, primitive.folderPath);
                    break;
                    case "sky":
                        prim = new sky(this.scene, primitive.heightMap, primitive.colorMap, primitive.size);
                    break;
                    case "water":
                        prim = new water(this.scene, primitive.heightMap, primitive.size, primitive.color)
                    break;
                    default:
                        break;
                }

                this.scenePrimitives[key] = prim;

                if (primitive.type === "gameboard") {
                    this.scene.board = prim;
                } else if (primitive.type === "timer") {
                    this.scene.clock = prim;
                } else if (primitive.type === "scoreboard") {
                    this.scene.scoreBoard = prim;
                }
            }
        }
    }

    /**
     * Creates the components of the graph by creating the MyGraphNode object
     */
    createComponents() {
        for (var key in this.components) {
            if (this.components.hasOwnProperty(key)) {
                var component = this.components[key];

                //calculate component transformation
                let matrix;
                if (component.transformation.transformationref) {
                    matrix = this.scene.transformations[component.transformation.transformationref];
                } else {
                    matrix = mat4.create();
                    for (let transf of component.transformation.transformations) {
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
                }

            
                //push all materials defined for the component
                let materials = [];
                for (let materialId of component.materials) {
                    if (materialId === "inherit") {
                        materials.push(materialId);
                    } else {
                        materials.push(this.scene.materials[materialId]);
                    }
                }

                let texture;
                if (component.texture.textureId === "none" || component.texture.textureId === "inherit") {
                    texture = component.texture.textureId;
                } else {
                    texture = this.scene.textures[component.texture.textureId];
                }

                //create the MyGraphNode object
                this.sceneComponents[key] = new MyGraphNode(matrix,this.scene.animations[component.animation], materials, texture, component.texture.length_s, component.texture.length_t);
            }
        }

    }

    createCustomPieces() {
        const green_piece_model = this.piece_green;
        const yellow_piece_model = this.piece_yellow;

        let green_piece, yellow_piece;

        if (green_piece_model) {
            let matrix = this.calculateMatrix(green_piece_model.transformation);
            let material = this.scene.materials[green_piece_model.material];
            let primitive = this.scenePrimitives[green_piece_model.primitive];
            
            let texture;
            if (green_piece_model.texture.textureId === "none") {
                texture = green_piece_model.texture.textureId;
            } else {
                texture = this.scene.textures[green_piece_model.texture.textureId];
            }

            green_piece = new PieceNode(this.scene, matrix, material, texture, green_piece_model.texture.length_s, green_piece_model.texture.length_t, primitive);
        }

        if (yellow_piece_model) {
            let matrix = this.calculateMatrix(yellow_piece_model.transformation);
            let material = this.scene.materials[yellow_piece_model.material];
            let primitive = this.scenePrimitives[yellow_piece_model.primitive];

            let texture;
            if (yellow_piece_model.texture.textureId === "none") {
                texture = yellow_piece_model.texture.textureId;
            } else {
                texture = this.scene.textures[yellow_piece_model.texture.textureId];
            }

            yellow_piece = new PieceNode(this.scene, matrix, material, texture, yellow_piece_model.texture.length_s, yellow_piece_model.texture.length_t, primitive);
        }

        // Passing the created pieces to the board
        //this.board.setCustomPieces(green_piece, yellow_piece);
    }

    calculateMatrix(transformation) {
        let matrix;
        if (transformation.transformationref) {
            matrix = this.scene.transformations[transformation.transformationref];
        } else {
            matrix = mat4.create();
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
        }

        return matrix;
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.transversePreorder(this.idRoot, this.scene.defaultMaterial, null, 1, 1);
        //console.log(this.idRoot);
    }

    /**
     * Transverses(dfs) the sceneGraph and displays the primitives building the expected scene
     * @param {id} id 
     * @param {parent material} material 
     * @param {parent texture} texture 
     * @param {parent length_s} length_s 
     * @param {parent length_t} length_t 
     */
    transversePreorder(id, material, texture, length_s, length_t) {
        //console.log(this.sceneComponents);
        let node = this.sceneComponents[id];
        this.scene.pushMatrix();
        this.scene.multMatrix(node.tranfMatrix);

        /* apply the animation */
        if (node.animation !== undefined) {
            node.animation.apply(this.scene);
        }

        let currentMaterial, currentTexture, currentS, currentT;

        if (node.getSelectedMaterial() === "inherit") {
            currentMaterial = material;
        } else {
            currentMaterial = node.getSelectedMaterial();
        }

        if (node.texture === "inherit") {
            currentTexture = texture;
            currentS = length_s;
            currentT = length_t;
        } else if (node.texture === "none") {
            currentTexture = null;
            currentS = node.length_s;
            currentT = node.length_t;
        } else {
            currentTexture = node.texture;
            currentS = node.length_s;
            currentT = node.length_t;
        }

        currentMaterial.setTexture(currentTexture);
        currentMaterial.apply();

        for (let child of node.primitives) {
            this.scene.pushMatrix();
            let primitive = this.scenePrimitives[child];
            //only triangle and rectangle scale factors need to be applied
            if (primitive instanceof MyTriangle || primitive instanceof MyRectangle) {
                primitive.updateTexCoords(currentS, currentT);
            }

            primitive.display();
            this.scene.popMatrix();


        }

        for (let child of node.components) {
            this.transversePreorder(child, currentMaterial, currentTexture, currentS, currentT);
        }

        this.scene.popMatrix();
    }

    /**
     * Rotates all the materials of the components that have more than one material in the scene
     */
    rotateMaterials() {
        for (var key in this.sceneComponents) {
            if (this.sceneComponents.hasOwnProperty(key)) {
                let node = this.sceneComponents[key];
                node.nextMaterial();
            }
        }
    }
}