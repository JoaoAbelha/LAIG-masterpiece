class CoolPiece extends CGFobject {
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.piece = new MySphere(this.scene, 0.4, 10, 10);
        this.base = new MyCylinder(scene,10,10, 0.5 ,1, 1);

        const degreeU = 2;
        const dregreeV = 3;
        const weight = 1;
        const top_radius = 0.3;
        const base_radius = 0.3;
        const height = 0.6;

        this.controlvertexes = [
            [	
                [ top_radius,0                ,height, weight],
                [ top_radius, top_radius *4/3 ,height, weight],
                [-top_radius, top_radius *4/3 ,height, weight],
                [-top_radius, 0               ,height, weight]
                
            ],

            [	
                [ top_radius/8,top_radius *4/3                ,height/2, weight*2],
                [ top_radius/8, top_radius *4/3 ,height/2, weight*2],
                [-top_radius/8, top_radius *4/3 ,height/2, weight*2],
                [-top_radius/8, top_radius *4/3              ,height/2, weight*2]
                
            ],


            [	
                [ base_radius, 0                ,-height, weight],
                [ base_radius, base_radius *4/3 ,-height, weight],
                [-base_radius, base_radius *4/3 ,-height, weight],
                [-base_radius, 0                ,-height, weight]
                
            ]
            ];


        this.semiCylinder = new CGFnurbsSurface(degreeU, dregreeV, this.controlvertexes);
        this.nurbsObject = new CGFnurbsObject(this.scene, 5, 5, this.semiCylinder);
    };

    display() {
        this.scene.pushMatrix();
        this.scene.translate(0,0.2,0);
        this.scene.rotate(Math.PI/2, 1,0,0);
        this.scene.scale(0.4,0.4,0.4);
        this.base.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 1,0,0);
        this.scene.scale(0.5,0.5,0.4);
        this.base.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0,0.8,0);
        this.scene.rotate(Math.PI/2, 1,0,0);
        this.nurbsObject.display();
        this.scene.rotate(Math.PI, 0,0,1);
        this.nurbsObject.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0,1.5,0);
        this.piece.display();
        this.scene.popMatrix();
    }
}