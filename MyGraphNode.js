/**
 * MyGraphNode, represents an intermediate node of the graph
 * @constructor
 **/

class MyGraphNode {
	constructor(matrix, animation, materials, texture, length_s, length_t) {
		this.primitives = []; //child primitives
		this.components = []; //child components
		this.materials = materials; //component materials
		this.selectedMaterial = 0; //current material
		this.tranfMatrix = matrix; //component tranformation matrix
		this.texture = texture; //component texture
		this.length_s = length_s; //component length_s
		this.length_t = length_t; //component length_t
		this.animation = animation;
	}

	/**
	 * Set the component childs
	 * @param {Array with child primtive IDs} primitives 
	 * @param {Array with child components IDs} components 
	 */
	setChildren(primitives, components) {
		this.primitives = primitives;
		this.components = components;
	}

	/** 
	 * Selects the next material  
	 */
	nextMaterial() {
		let len = this.materials.length;
		this.selectedMaterial = (this.selectedMaterial + 1) % len;
	}

	/**
	 * Return the selected material
	 */
	getSelectedMaterial() {
		return this.materials[this.selectedMaterial];
	}
}