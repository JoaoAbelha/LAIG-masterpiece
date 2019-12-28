/**
 * MyPlane
 * @constructor
 * @param scene - Reference to MyScene object
 * @param npartsU - number of divisions in U
 * @param npartsV - number of divisions in V
 */
class MyPlane extends CGFobject {
    constructor(scene, npartsU, npartsV) {
        super(scene);
        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.init();
    };

    init() {
        this.controlvertexes = [
            [
                [-0.5, 0, 0.5, 1],
                [-0.5, 0, -0.5, 1]
            ],
            [
                [0.5, 0, 0.5, 1],
                [0.5, 0, -0.5, 1]
            ]
        ];
        this.surface = new CGFnurbsSurface(1, 1, this.controlvertexes);
        this.nurbsObject = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, this.surface);
    };

    display() {
        this.nurbsObject.display();
    };

}