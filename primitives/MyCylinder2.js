/**
 * MyCylinder2
 * @constructor
 * @param scene - Reference to MyScene object
 * @param base_radius - the base radius
 * @param top_radius - the top radius
 * @param height - the height of the cylinder
 * @param slices - number of slices
 * @param stacks - number of stacks
 */
class MyCylinder2 extends CGFobject {
    constructor(scene, base_radius, top_radius, height,slices, stacks) {
        super(scene);
        //non-rational spline W = 1
        const weight = 1;
        this.init(base_radius, top_radius, height, slices, stacks,weight);
    };

    init(base_radius, top_radius, height, slices, stacks, weight) {
        const degreeU = 1;
        const dregreeV = 3;

    this.controlvertexes = [
        [	
            [ top_radius,0                ,height, weight],
            [ top_radius, top_radius *4/3 ,height, weight],
            [-top_radius, top_radius *4/3 ,height, weight],
            [-top_radius, 0               ,height, weight]
            
         ],
         [	
            [ base_radius, 0                ,-height, weight],
            [ base_radius, base_radius *4/3 ,-height, weight],
            [-base_radius, base_radius *4/3 ,-height, weight],
            [-base_radius, 0                ,-height, weight]
            
         ]
        ];

        this.semiCylinder = new CGFnurbsSurface(degreeU, dregreeV, this.controlvertexes);
        this.nurbsObject = new CGFnurbsObject(this.scene, stacks, slices, this.semiCylinder);
    };

    display() {
        this.nurbsObject.display();
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI , 0 , 0 ,1);
        this.nurbsObject.display();
        this.scene.popMatrix();

    };

}