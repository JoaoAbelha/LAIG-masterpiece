/**
 * MyPatch
 * @constructor
 * @param scene - Reference to MyScene object
 * @param npartsU - number of divisions in U
 * @param npartsV - number of divisions in V
 * @param npointsU - number of points U
 * @param npointsV - number of points V
 * @param controlPoints - control points
 */
class MyPatch extends CGFobject {
	constructor(scene, npartsU, npartsV, npointsU, npointsV, controlPoints) {
		super(scene);
        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.npointsU = npointsU;
        this.npointsV = npointsV;
        this.controlPoints = controlPoints;

        this.init();
    };
    
    init() {
        this.controlVertexes = [];

		for (let i = 0; i < this.npointsU; i++) {
			let upoints = [];
			for (let j = 0; j < this.npointsV; j++) {
				let point = Object.values(this.controlPoints[i*this.npointsV + j]);
                point.push(1);	// control points have w = 1
				upoints.push(point);
			}
			this.controlVertexes.push(upoints);
        }   
        
        this.surface = new CGFnurbsSurface(this.npointsU-1, this.npointsV-1, this.controlVertexes);
        this.nurbsObject = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, this.surface);
    };

	display() {
        this.nurbsObject.display();
    };
};